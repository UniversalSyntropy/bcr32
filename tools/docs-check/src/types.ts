export interface Finding {
  path: string;
  line: number;
  rule: string;
  message: string;
}

// What the rules need from the outside world. Tests give an in-memory version.
export interface Env {
  exists(path: string): boolean; // file or folder, repo-relative with forward slashes
  read(path: string): string | undefined; // text of a file, or undefined when it is missing
  controlIds: ReadonlySet<string>; // every element ID of the device
}
