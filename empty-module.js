// Comprehensive Proxy module to satisfy Node.js requirements during browser builds
export const createServer = () => ({ listen: () => {}, on: () => {}, close: () => {} });
export const connect = () => ({ on: () => {}, write: () => {}, end: () => {} });
export const spawn = () => ({ on: () => {}, stdout: { on: () => {} }, stderr: { on: () => {} } });
export const exec = () => ({ on: () => {} });
export const fork = () => ({ on: () => {} });
export const existsSync = () => false;
export const readFileSync = () => Buffer.from("");
export const unlinkSync = () => {};
export const mkdirSync = () => {};
export const rmSync = () => {};
export const statSync = () => ({ isDirectory: () => false });
export const writeFile = () => {};
export const writeFileSync = () => {};
export const appendFileSync = () => {};
export const readdirSync = () => [];
export const join = (...args) => args.join("/");
export const resolve = (...args) => args.join("/");
export const randomBytes = (size) => Buffer.alloc(size);
export const createHash = () => ({ update: () => ({ digest: () => "" }) });

// Missing Node.js utilities required by QVAC browser environment
export const fileURLToPath = (url) => url.replace('file://', '');
export const pathToFileURL = (path) => `file://${path}`;

export const promises = {
  readFile: async () => Buffer.from(""),
  writeFile: async () => {},
  unlink: async () => {},
  mkdir: async () => {},
  readdir: async () => [],
  stat: async () => ({ isDirectory: () => false })
};

const empty = { promises, fileURLToPath, pathToFileURL };
export default empty;
