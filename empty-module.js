// Proxy module to satisfy Node.js built-in requirements during browser builds
export const createServer = () => ({ listen: () => {}, on: () => {}, close: () => {} });
export const connect = () => ({ on: () => {}, write: () => {}, end: () => {} });
export const spawn = () => ({ on: () => {}, stdout: { on: () => {} }, stderr: { on: () => {} } });
export const exec = () => ({ on: () => {} });
export const fork = () => ({ on: () => {} });
export const existsSync = () => false;
export const readFileSync = () => Buffer.from("");
export const writeFile = () => {};
export const join = (...args) => args.join("/");
export const resolve = (...args) => args.join("/");

const empty = {};
export default empty;
