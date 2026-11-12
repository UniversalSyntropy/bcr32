// midi-capture: lists MIDI ports, logs timestamped messages to a JSON Lines file,
// and sends test messages to loopback ports only. macOS, CoreMIDI.
//
// Safety: `log` and `list` never send. `send` refuses any port that is not a loopback port.
// Build: swiftc -O -swift-version 5 -o <output> tools/midi-capture/src/main.swift

import CoreMIDI
import Darwin
import Foundation

// MARK: output helpers

func printErr(_ text: String) {
    FileHandle.standardError.write((text + "\n").data(using: .utf8)!)
}

func jsonEscape(_ s: String) -> String {
    var out = ""
    for u in s.unicodeScalars {
        switch u {
        case "\"": out += "\\\""
        case "\\": out += "\\\\"
        case "\n": out += "\\n"
        case "\r": out += "\\r"
        case "\t": out += "\\t"
        default:
            if u.value < 0x20 { out += String(format: "\\u%04x", u.value) } else { out.unicodeScalars.append(u) }
        }
    }
    return out
}

func hexString(_ bytes: [UInt8]) -> String {
    bytes.map { String(format: "%02X", $0) }.joined(separator: " ")
}

// MARK: time

var timebase = mach_timebase_info_data_t()
mach_timebase_info(&timebase)

func machToNs(_ ticks: UInt64) -> UInt64 {
    ticks &* UInt64(timebase.numer) / UInt64(timebase.denom)
}

let utcFormatter: DateFormatter = {
    let f = DateFormatter()
    f.locale = Locale(identifier: "en_US_POSIX")
    f.timeZone = TimeZone(identifier: "UTC")
    f.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
    return f
}()

let localFormatter: DateFormatter = {
    let f = DateFormatter()
    f.locale = Locale(identifier: "en_US_POSIX")
    f.dateFormat = "HH:mm:ss.SSS"
    return f
}()

// Wall time of an event: now, minus the age of its CoreMIDI time stamp (0 means now).
func eventDate(machTime: UInt64) -> Date {
    let now = mach_absolute_time()
    var age = 0.0
    if machTime != 0 && machTime <= now { age = Double(machToNs(now - machTime)) / 1e9 }
    return Date().addingTimeInterval(-age)
}

// MARK: records

struct Record {
    var date: Date
    var monoNs: UInt64
    var port: String
    var bytes: [UInt8]
    var kind: String
    var channel: Int?
    var d1: Int?
    var d2: Int?
    var text: String?

    func json() -> String {
        var s = "{\"t\":\"\(utcFormatter.string(from: date))\",\"mono_ns\":\(monoNs)"
        s += ",\"port\":\"\(jsonEscape(port))\",\"hex\":\"\(hexString(bytes))\",\"kind\":\"\(kind)\""
        if let c = channel { s += ",\"ch\":\(c)" }
        if let v = d1 { s += ",\"d1\":\(v)" }
        if let v = d2 { s += ",\"d2\":\(v)" }
        if let x = text { s += ",\"text\":\"\(jsonEscape(x))\"" }
        return s + "}"
    }

    func line() -> String {
        var s = "\(localFormatter.string(from: date))  \(port)  \(kind)"
        if let c = channel { s += " ch\(c)" }
        if let v = d1 { s += " \(v)" }
        if let v = d2 { s += " \(v)" }
        if let x = text { s += " \(x)" }
        return s + "  [\(hexString(bytes))]"
    }
}

// Name the message in a complete byte string. d1 and d2 are the raw data bytes.
// For a pitch bend the value is d2 * 128 + d1. For a SysEx message d1 is the byte count.
func classify(_ b: [UInt8]) -> (kind: String, channel: Int?, d1: Int?, d2: Int?) {
    guard let s = b.first else { return ("empty", nil, nil, nil) }
    let d1 = b.count > 1 ? Int(b[1]) : nil
    let d2 = b.count > 2 ? Int(b[2]) : nil
    if s >= 0x80 && s < 0xF0 {
        let ch = Int(s & 0x0F) + 1
        switch s & 0xF0 {
        case 0x80: return ("note-off", ch, d1, d2)
        case 0x90: return ("note-on", ch, d1, d2)
        case 0xA0: return ("poly-pressure", ch, d1, d2)
        case 0xB0: return ("cc", ch, d1, d2)
        case 0xC0: return ("program", ch, d1, nil)
        case 0xD0: return ("channel-pressure", ch, d1, nil)
        default: return ("pitch-bend", ch, d1, d2)
        }
    }
    switch s {
    case 0xF0: return ("sysex", nil, b.count, nil)
    case 0xF1: return ("time-code", nil, d1, nil)
    case 0xF2: return ("song-position", nil, d1, d2)
    case 0xF3: return ("song-select", nil, d1, nil)
    case 0xF6: return ("tune-request", nil, nil, nil)
    case 0xF8: return ("clock", nil, nil, nil)
    case 0xFA: return ("start", nil, nil, nil)
    case 0xFB: return ("continue", nil, nil, nil)
    case 0xFC: return ("stop", nil, nil, nil)
    case 0xFE: return ("active-sensing", nil, nil, nil)
    case 0xFF: return ("reset", nil, nil, nil)
    default: return ("unknown", nil, d1, d2)
    }
}

// MARK: UMP decoding (MIDI 1.0 protocol: message types 1, 2 and 3)

// Turns the words of one connection into complete MIDI byte strings. Reassembles SysEx.
final class UMPDecoder {
    var sysex: [UInt8]?

    // Number of 32-bit words in a UMP message of this type.
    static func wordCount(type: UInt32) -> Int {
        switch type {
        case 0, 1, 2, 6, 7: return 1
        case 3, 4, 8, 9, 0xA: return 2
        case 0xB, 0xC: return 3
        default: return 4
        }
    }

    // `emit` gets the bytes of each complete message, or nil bytes and a note for a type that is not decoded.
    func feed(_ words: [UInt32], emit: (_ bytes: [UInt8], _ note: String?) -> Void) {
        var i = 0
        while i < words.count {
            let w = words[i]
            let type = w >> 28
            let n = UMPDecoder.wordCount(type: type)
            if i + n > words.count { emit([], "truncated UMP message type \(type)"); return }
            let status = UInt8((w >> 16) & 0xFF)
            let a = UInt8((w >> 8) & 0xFF)
            let b = UInt8(w & 0xFF)
            switch type {
            case 1:
                switch status {
                case 0xF1, 0xF3: emit([status, a], nil)
                case 0xF2: emit([status, a, b], nil)
                default: emit([status], nil)
                }
            case 2:
                if status & 0xF0 == 0xC0 || status & 0xF0 == 0xD0 { emit([status, a], nil) } else { emit([status, a, b], nil) }
            case 3:
                let kind = (w >> 20) & 0xF
                let count = Int((w >> 16) & 0xF)
                let w1 = words[i + 1]
                let data = [a, b, UInt8(w1 >> 24), UInt8((w1 >> 16) & 0xFF), UInt8((w1 >> 8) & 0xFF), UInt8(w1 & 0xFF)]
                let chunk = Array(data.prefix(min(count, 6)))
                switch kind {
                case 0: emit([0xF0] + chunk + [0xF7], nil)
                case 1: sysex = [0xF0] + chunk
                case 2: if sysex != nil { sysex! += chunk } else { emit([], "SysEx continue without start") }
                default:
                    if var s = sysex { s += chunk; s.append(0xF7); emit(s, nil); sysex = nil } else { emit([], "SysEx end without start") }
                }
            case 0:
                break // utility message (for example a time stamp): not part of the stream
            default:
                emit([], "UMP message type \(type) not decoded")
            }
            i += n
        }
    }
}

// MARK: ports

func displayName(_ obj: MIDIObjectRef) -> String {
    var cf: Unmanaged<CFString>?
    MIDIObjectGetStringProperty(obj, kMIDIPropertyDisplayName, &cf)
    return (cf?.takeRetainedValue() as String?) ?? "(no name)"
}

let selftestSourceName = "midi-capture selftest"

// A loopback port is a software port that cannot reach a unit.
func isLoopbackName(_ name: String) -> Bool {
    let n = name.lowercased()
    if n.contains("bcr") || n.contains("behringer") { return false }
    return n.hasPrefix("iac") || n.contains("loopback") || n == selftestSourceName.lowercased()
}

func listPorts() {
    print("sources (the unit sends from these):")
    for i in 0..<MIDIGetNumberOfSources() { print("  \(i)  \(displayName(MIDIGetSource(i)))") }
    print("destinations (`send` accepts only those marked loopback):")
    for i in 0..<MIDIGetNumberOfDestinations() {
        let name = displayName(MIDIGetDestination(i))
        print("  \(i)  \(name)\(isLoopbackName(name) ? "  [loopback]" : "")")
    }
}

// MARK: capture core

final class Connection {
    let port: String
    let decoder = UMPDecoder()
    let deliver: (Record) -> Void
    init(port: String, deliver: @escaping (Record) -> Void) {
        self.port = port
        self.deliver = deliver
    }
}

func makeInputPort(client: MIDIClientRef) -> MIDIPortRef? {
    var port = MIDIPortRef()
    let status = MIDIInputPortCreateWithProtocol(client, "midi-capture in" as CFString, ._1_0, &port) { list, refCon in
        guard let refCon = refCon else { return }
        let conn = Unmanaged<Connection>.fromOpaque(refCon).takeUnretainedValue()
        for packet in list.unsafeSequence() {
            let count = Int(packet.pointee.wordCount)
            let stamp = packet.pointee.timeStamp
            let words: [UInt32] = withUnsafePointer(to: packet.pointee.words) { tuple in
                tuple.withMemoryRebound(to: UInt32.self, capacity: 64) { Array(UnsafeBufferPointer(start: $0, count: min(count, 64))) }
            }
            conn.decoder.feed(words) { bytes, note in
                let date = eventDate(machTime: stamp)
                let mono = machToNs(stamp != 0 ? stamp : mach_absolute_time())
                if let note = note {
                    conn.deliver(Record(date: date, monoNs: mono, port: conn.port, bytes: [], kind: "note", channel: nil, d1: nil, d2: nil, text: note))
                } else {
                    let c = classify(bytes)
                    conn.deliver(Record(date: date, monoNs: mono, port: conn.port, bytes: bytes, kind: c.kind, channel: c.channel, d1: c.d1, d2: c.d2, text: nil))
                }
            }
        }
    }
    return status == noErr ? port : nil
}

func makeClient() -> MIDIClientRef? {
    var client = MIDIClientRef()
    return MIDIClientCreate("midi-capture" as CFString, nil, nil, &client) == noErr ? client : nil
}

// MARK: commands

func runLog(args: [String]) -> Int32 {
    var filters: [String] = []
    var outPath: String? = nil
    var seconds: Double? = nil
    var skip = Set<String>()
    var i = 0
    while i < args.count {
        switch args[i] {
        case "--port": i += 1; if i < args.count { filters.append(args[i].lowercased()) }
        case "--out": i += 1; if i < args.count { outPath = args[i] }
        case "--seconds": i += 1; if i < args.count { seconds = Double(args[i]) }
        case "--skip": i += 1; if i < args.count { skip = Set(args[i].split(separator: ",").map { String($0) }) }
        default: printErr("log: unknown option \(args[i])"); return 2
        }
        i += 1
    }
    guard let client = makeClient(), let port = makeInputPort(client: client) else { printErr("log: cannot open CoreMIDI. Run this in the desktop session of the computer, not over SSH."); return 1 }

    let fm = FileManager.default
    let path: String
    if let p = outPath { path = p } else {
        let f = DateFormatter()
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "yyyyMMdd-HHmmss"
        path = "local/captures/capture-\(f.string(from: Date())).jsonl"
    }
    try? fm.createDirectory(atPath: (path as NSString).deletingLastPathComponent.isEmpty ? "." : (path as NSString).deletingLastPathComponent, withIntermediateDirectories: true)
    guard fm.createFile(atPath: path, contents: nil), let file = FileHandle(forWritingAtPath: path) else { printErr("log: cannot write \(path)"); return 1 }

    let queue = DispatchQueue(label: "midi-capture.out")
    var counts: [String: Int] = [:]
    var skipped = 0
    func write(_ r: Record) {
        queue.async {
            if skip.contains(r.kind) { skipped += 1; return }
            counts[r.kind, default: 0] += 1
            file.write((r.json() + "\n").data(using: .utf8)!)
            print(r.line())
            fflush(stdout)
        }
    }

    var connected = 0
    for s in 0..<MIDIGetNumberOfSources() {
        let src = MIDIGetSource(s)
        let name = displayName(src)
        if !filters.isEmpty && !filters.contains(where: { name.lowercased().contains($0) }) { continue }
        let conn = Unmanaged.passRetained(Connection(port: name, deliver: write))
        if MIDIPortConnectSource(port, src, conn.toOpaque()) == noErr { connected += 1; print("listening: \(name)") }
    }
    if connected == 0 { printErr("log: no source matched. Run `list` to see the ports."); return 1 }
    print("writing \(path)")
    print("type a line and press Enter to put a marker in the log. Press Ctrl-C to stop.")

    let marker = Thread {
        while let line = readLine() {
            let text = line.trimmingCharacters(in: .whitespaces)
            if text.isEmpty { continue }
            write(Record(date: Date(), monoNs: machToNs(mach_absolute_time()), port: "", bytes: [], kind: "mark", channel: nil, d1: nil, d2: nil, text: text))
        }
    }
    marker.start()

    func finish() -> Never {
        queue.sync {
            file.synchronizeFile()
            let total = counts.values.reduce(0, +)
            let detail = counts.sorted { $0.key < $1.key }.map { "\($0.key) \($0.value)" }.joined(separator: ", ")
            print("done: \(total) records (\(detail.isEmpty ? "none" : detail)), \(skipped) skipped. File: \(path)")
        }
        exit(0)
    }
    signal(SIGINT, SIG_IGN)
    signal(SIGTERM, SIG_IGN)
    let sigint = DispatchSource.makeSignalSource(signal: SIGINT, queue: .main)
    sigint.setEventHandler { finish() }
    sigint.resume()
    let sigterm = DispatchSource.makeSignalSource(signal: SIGTERM, queue: .main)
    sigterm.setEventHandler { finish() }
    sigterm.resume()
    if let s = seconds { DispatchQueue.main.asyncAfter(deadline: .now() + s) { finish() } }
    dispatchMain()
}

// Guided map: shows one instruction at a time and records the messages that follow it.
// Listen only. Default (confirm mode): messages are shown as they arrive and saved when you press Enter.
// c = clear what was heard, n = save "none", r = repeat the step, q = stop. With --auto the tool saves after a quiet gap.
func runMap(args: [String]) -> Int32 {
    var filters: [String] = []
    var stepsPath: String? = nil
    var outPath: String? = nil
    var quiet = 1.2
    var timeout = 6.0
    var skip: Set<String> = ["clock", "active-sensing"]
    var auto = false
    var i = 0
    while i < args.count {
        switch args[i] {
        case "--auto": auto = true
        case "--port": i += 1; if i < args.count { filters.append(args[i].lowercased()) }
        case "--steps": i += 1; if i < args.count { stepsPath = args[i] }
        case "--out": i += 1; if i < args.count { outPath = args[i] }
        case "--quiet": i += 1; if i < args.count, let v = Double(args[i]), v > 0 { quiet = v }
        case "--timeout": i += 1; if i < args.count, let v = Double(args[i]), v > 0 { timeout = v }
        case "--skip": i += 1; if i < args.count { skip = Set(args[i].split(separator: ",").map { String($0) }) }
        default: printErr("map: unknown option \(args[i])"); return 2
        }
        i += 1
    }
    guard let stepsPath = stepsPath else { printErr("map: --steps <file> is required"); return 2 }
    guard let data = FileManager.default.contents(atPath: stepsPath),
          let steps = (try? JSONSerialization.jsonObject(with: data)) as? [[String: String]],
          !steps.isEmpty, steps.allSatisfy({ $0["id"] != nil && $0["say"] != nil }) else {
        printErr("map: \(stepsPath) must be a JSON array of objects with string fields id and say")
        return 2
    }
    guard let client = makeClient(), let port = makeInputPort(client: client) else { printErr("map: cannot open CoreMIDI. Run this in the desktop session of the computer, not over SSH."); return 1 }

    let fm = FileManager.default
    let path: String
    if let p = outPath { path = p } else {
        let f = DateFormatter()
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "yyyyMMdd-HHmmss"
        path = "local/captures/map-\(f.string(from: Date())).jsonl"
    }
    try? fm.createDirectory(atPath: (path as NSString).deletingLastPathComponent.isEmpty ? "." : (path as NSString).deletingLastPathComponent, withIntermediateDirectories: true)
    guard fm.createFile(atPath: path, contents: nil), let file = FileHandle(forWritingAtPath: path) else { printErr("map: cannot write \(path)"); return 1 }

    let lock = NSLock()
    var buffer: [Record] = []
    var lastMessage = Date()
    var commands: [String] = []
    func deliver(_ r: Record) {
        if skip.contains(r.kind) { return }
        lock.lock(); buffer.append(r); lastMessage = Date(); lock.unlock()
        if !auto { print("  heard: \(r.line())"); fflush(stdout) }
    }
    var connected = 0
    for s in 0..<MIDIGetNumberOfSources() {
        let src = MIDIGetSource(s)
        let name = displayName(src)
        if !filters.isEmpty && !filters.contains(where: { name.lowercased().contains($0) }) { continue }
        let conn = Unmanaged.passRetained(Connection(port: name, deliver: deliver))
        if MIDIPortConnectSource(port, src, conn.toOpaque()) == noErr { connected += 1; print("listening: \(name)") }
    }
    if connected == 0 { printErr("map: no source matched. Run `list` to see the ports."); return 1 }
    print("writing \(path)")
    if auto {
        print("Do each step, then wait. Enter = nothing happened. r = repeat the step. q = stop.")
    } else {
        print("Do each step, check the lines shown, then press Enter to save them.")
        print("c = clear what was heard (wrong control). n = save \"none\". r = repeat the step. q = stop.")
    }

    let reader = Thread {
        while let line = readLine() {
            lock.lock(); commands.append(line.trimmingCharacters(in: .whitespaces).lowercased()); lock.unlock()
        }
    }
    reader.start()

    var heard = 0, silent = 0
    var index = 0
    var quit = false
    while index < steps.count && !quit {
        let step = steps[index]
        lock.lock(); buffer = []; commands = []; lock.unlock()
        print("\n[\(index + 1)/\(steps.count)] \(step["say"] ?? "")")
        fflush(stdout)
        let start = Date()
        var outcome = ""
        while outcome.isEmpty {
            usleep(50_000)
            lock.lock()
            let command = commands.isEmpty ? nil : commands.removeFirst()
            let got = buffer
            let last = lastMessage
            lock.unlock()
            if let c = command, !auto {
                if c == "q" { outcome = "quit" }
                else if c == "r" { outcome = "repeat" }
                else if c == "n" { lock.lock(); buffer = []; lock.unlock(); outcome = "none" }
                else if c == "c" { lock.lock(); buffer = []; lock.unlock(); print("  cleared. Do the step again.") }
                else if got.isEmpty { print("  nothing heard yet. Do the step, or type n to save none.") }
                else { outcome = "heard" }
            } else if let c = command {
                outcome = c == "r" ? "repeat" : (c == "q" ? "quit" : "none")
            } else if auto && !got.isEmpty && Date().timeIntervalSince(last) >= quiet {
                outcome = "heard"
            } else if auto && got.isEmpty && Date().timeIntervalSince(start) >= timeout {
                outcome = "none"
            }
        }
        if outcome == "repeat" { print("  repeat"); continue }
        if outcome == "quit" { quit = true; break }
        lock.lock(); let got = buffer; lock.unlock()
        let messages = outcome == "heard" ? got : []
        for m in messages { print("  \(m.line())") }
        if messages.isEmpty { print("  no message"); silent += 1 } else { heard += 1 }
        var json = "{\"id\":\"\(jsonEscape(step["id"] ?? ""))\",\"action\":\"\(jsonEscape(step["action"] ?? ""))\",\"say\":\"\(jsonEscape(step["say"] ?? ""))\""
        json += ",\"result\":\"\(messages.isEmpty ? "none" : "messages")\",\"messages\":[" + messages.map { $0.json() }.joined(separator: ",") + "]}"
        file.write((json + "\n").data(using: .utf8)!)
        index += 1
    }
    file.synchronizeFile()
    print("\ndone: \(index) of \(steps.count) steps, \(heard) with messages, \(silent) with none\(quit ? ", stopped early" : ""). File: \(path)")
    return 0
}

func parseHexBytes(_ tokens: [String]) -> [UInt8]? {
    var out: [UInt8] = []
    for t in tokens {
        let clean = t.hasPrefix("0x") ? String(t.dropFirst(2)) : t
        guard let v = UInt8(clean, radix: 16) else { return nil }
        out.append(v)
    }
    return out.isEmpty ? nil : out
}

func runSend(args: [String]) -> Int32 {
    guard args.count >= 3, args[0] == "--to" else { printErr("usage: midi-capture send --to <port name part> <hex byte> ..."); return 2 }
    let target = args[1].lowercased()
    // The refusal comes first, before any port is looked up.
    if !isLoopbackName(args[1]) && !(target.hasPrefix("iac") || target.contains("loopback")) {
        printErr("send: refused. '\(args[1])' is not a loopback port. This tool never sends to the unit.")
        return 2
    }
    guard let bytes = parseHexBytes(Array(args[2...])) else { printErr("send: the message must be hex bytes, for example 90 3C 64"); return 2 }
    guard let client = makeClient() else { printErr("send: cannot open CoreMIDI"); return 1 }
    var matches: [MIDIEndpointRef] = []
    for d in 0..<MIDIGetNumberOfDestinations() {
        let dest = MIDIGetDestination(d)
        let name = displayName(dest)
        if name.lowercased().contains(target) {
            if !isLoopbackName(name) { printErr("send: refused. The name matches '\(name)', which is not a loopback port."); return 2 }
            matches.append(dest)
        }
    }
    if matches.isEmpty { printErr("send: no loopback destination matches '\(args[1])'. Run `list`."); return 1 }
    var out = MIDIPortRef()
    guard MIDIOutputPortCreate(client, "midi-capture out" as CFString, &out) == noErr else { printErr("send: cannot create an output port"); return 1 }
    var buffer = [UInt8](repeating: 0, count: 65536)
    let status: OSStatus = buffer.withUnsafeMutableBytes { raw in
        let list = raw.baseAddress!.assumingMemoryBound(to: MIDIPacketList.self)
        let cur = MIDIPacketListInit(list)
        _ = MIDIPacketListAdd(list, raw.count, cur, 0, bytes.count, bytes)
        var result: OSStatus = noErr
        for dest in matches { result = MIDISend(out, dest, list) }
        return result
    }
    if status != noErr { printErr("send: CoreMIDI error \(status)"); return 1 }
    print("sent \(hexString(bytes)) to \(matches.count) loopback destination(s)")
    return 0
}

// Proves the capture path on a software port: known words in, expected records out.
func runSelftest() -> Int32 {
    guard let client = makeClient(), let port = makeInputPort(client: client) else { printErr("selftest: cannot open CoreMIDI"); return 1 }
    var src = MIDIEndpointRef()
    guard MIDISourceCreateWithProtocol(client, selftestSourceName as CFString, ._1_0, &src) == noErr else { printErr("selftest: cannot create a virtual source"); return 1 }

    let lock = NSLock()
    var got: [Record] = []
    let conn = Unmanaged.passRetained(Connection(port: selftestSourceName) { r in lock.lock(); got.append(r); lock.unlock() })
    guard MIDIPortConnectSource(port, src, conn.toOpaque()) == noErr else { printErr("selftest: cannot connect to the virtual source"); return 1 }

    // Literal UMP words. Each case: words, expected bytes, kind, channel, d1, d2.
    struct Case { var words: [UInt32]; var bytes: [UInt8]; var kind: String; var ch: Int?; var d1: Int?; var d2: Int? }
    let cases: [Case] = [
        Case(words: [0x2090_3C64], bytes: [0x90, 0x3C, 0x64], kind: "note-on", ch: 1, d1: 60, d2: 100),
        Case(words: [0x2080_3C00], bytes: [0x80, 0x3C, 0x00], kind: "note-off", ch: 1, d1: 60, d2: 0),
        Case(words: [0x20B0_617F], bytes: [0xB0, 0x61, 0x7F], kind: "cc", ch: 1, d1: 97, d2: 127),
        Case(words: [0x20BF_0201], bytes: [0xBF, 0x02, 0x01], kind: "cc", ch: 16, d1: 2, d2: 1),
        Case(words: [0x20C2_0500], bytes: [0xC2, 0x05], kind: "program", ch: 3, d1: 5, d2: nil),
        Case(words: [0x20D0_4000], bytes: [0xD0, 0x40], kind: "channel-pressure", ch: 1, d1: 64, d2: nil),
        Case(words: [0x20E0_0140], bytes: [0xE0, 0x01, 0x40], kind: "pitch-bend", ch: 1, d1: 1, d2: 64),
        Case(words: [0x10F8_0000], bytes: [0xF8], kind: "clock", ch: nil, d1: nil, d2: nil),
        Case(words: [0x10FA_0000], bytes: [0xFA], kind: "start", ch: nil, d1: nil, d2: nil),
        Case(words: [0x10F2_0102], bytes: [0xF2, 0x01, 0x02], kind: "song-position", ch: nil, d1: 1, d2: 2),
        // SysEx identity request in one complete message: F0 7E 7F 06 01 F7
        Case(words: [0x3004_7E7F, 0x0601_0000], bytes: [0xF0, 0x7E, 0x7F, 0x06, 0x01, 0xF7], kind: "sysex", ch: nil, d1: 6, d2: nil),
        // The same bytes in a start packet and an end packet
        Case(words: [0x3013_7E7F, 0x0600_0000, 0x3031_0100, 0x0000_0000], bytes: [0xF0, 0x7E, 0x7F, 0x06, 0x01, 0xF7], kind: "sysex", ch: nil, d1: 6, d2: nil),
        // A start, a continue and an end packet: 15 bytes in all
        Case(words: [0x3016_7E7F, 0x0601_0203, 0x3026_0405, 0x0607_0809, 0x3031_0A00, 0x0000_0000],
             bytes: [0xF0, 0x7E, 0x7F, 0x06, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0xF7], kind: "sysex", ch: nil, d1: 15, d2: nil),
    ]

    var expectedCount = 0
    for c in cases {
        var buf = [UInt8](repeating: 0, count: 1024)
        buf.withUnsafeMutableBytes { raw in
            let list = raw.baseAddress!.assumingMemoryBound(to: MIDIEventList.self)
            var cur = MIDIEventListInit(list, ._1_0)
            // Split two-packet cases into separate event packets, one UMP message each.
            var i = 0
            while i < c.words.count {
                let n = UMPDecoder.wordCount(type: c.words[i] >> 28)
                let slice = Array(c.words[i..<(i + n)])
                cur = slice.withUnsafeBufferPointer { MIDIEventListAdd(list, raw.count, cur, 0, n, $0.baseAddress!) }
                i += n
            }
            MIDIReceivedEventList(src, list)
        }
        expectedCount += 1
    }

    let deadline = Date().addingTimeInterval(3)
    while Date() < deadline {
        lock.lock(); let n = got.count; lock.unlock()
        if n >= expectedCount { break }
        Thread.sleep(forTimeInterval: 0.02)
    }
    Thread.sleep(forTimeInterval: 0.2) // time for a wrong extra record to show

    lock.lock()
    let records = got
    lock.unlock()
    var failures = 0
    if records.count != cases.count { printErr("selftest: expected \(cases.count) records, got \(records.count)"); failures += 1 }
    for (k, c) in cases.enumerated() where k < records.count {
        let r = records[k]
        let ok = r.bytes == c.bytes && r.kind == c.kind && r.channel == c.ch && r.d1 == c.d1 && r.d2 == c.d2
        if !ok { printErr("selftest: case \(k) wrong: got \(hexString(r.bytes)) \(r.kind) ch \(String(describing: r.channel)) \(String(describing: r.d1)) \(String(describing: r.d2))"); failures += 1 }
    }
    // The time stamps must be present and increase.
    for k in 1..<max(records.count, 1) where records[k].monoNs < records[k - 1].monoNs { printErr("selftest: time stamps go backwards at \(k)"); failures += 1 }
    // The JSON must hold the fields a reader needs.
    if let first = records.first {
        let j = first.json()
        for part in ["\"t\":\"", "\"mono_ns\":", "\"hex\":\"90 3C 64\"", "\"kind\":\"note-on\"", "\"ch\":1", "\"d1\":60", "\"d2\":100"] where !j.contains(part) {
            printErr("selftest: JSON line lacks \(part): \(j)"); failures += 1
        }
    }
    MIDIEndpointDispose(src)
    if failures == 0 { print("selftest: ok \(cases.count) of \(cases.count) messages captured as expected"); return 0 }
    print("selftest: FAILED \(failures) check(s)")
    return 1
}

// MARK: main

func usage() {
    print("""
    midi-capture: list MIDI ports, log messages, send test messages to loopback ports.

      midi-capture list
      midi-capture log [--port <name part>]... [--out <file>] [--seconds <n>] [--skip clock,active-sensing]
      midi-capture send --to <loopback port name part> <hex byte> ...
      midi-capture map --steps <file> [--port <name part>]... [--out <file>] [--quiet <s>] [--timeout <s>]
      midi-capture selftest

    log writes JSON Lines to local/captures/ by default. Type a line during a log to add a marker.
    map shows one step at a time and records the messages after it, to local/captures/.
    send never sends to the unit: it accepts loopback ports only.
    """)
}

let argv = Array(CommandLine.arguments.dropFirst())
guard let command = argv.first else { usage(); exit(2) }
switch command {
case "list":
    listPorts()
case "log":
    exit(runLog(args: Array(argv.dropFirst())))
case "send":
    exit(runSend(args: Array(argv.dropFirst())))
case "map":
    exit(runMap(args: Array(argv.dropFirst())))
case "selftest":
    exit(runSelftest())
case "help", "--help", "-h":
    usage()
default:
    printErr("unknown command '\(command)'")
    usage()
    exit(2)
}
