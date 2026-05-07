// Ultra-compatible Mock Module for Node.js internals in Browser
const noop = () => {};
const asyncNoop = async () => {};

const fileURLToPath = (url) => typeof url === 'string' ? url.replace('file://', '') : url;
const pathToFileURL = (path) => `file://${path}`;

const fsPromises = {
  readFile: async () => Buffer.from(""),
  writeFile: asyncNoop,
  unlink: asyncNoop,
  mkdir: asyncNoop,
  readdir: async () => [],
  stat: async () => ({ isDirectory: () => false })
};

const mock = {
  // Functions
  fileURLToPath,
  pathToFileURL,
  createServer: () => ({ listen: noop, on: noop, close: noop }),
  connect: () => ({ on: noop, write: noop, end: noop }),
  spawn: () => ({ on: noop, stdout: { on: noop }, stderr: { on: noop } }),
  exec: () => ({ on: noop }),
  fork: () => ({ on: noop }),
  existsSync: () => false,
  readFileSync: () => Buffer.from(""),
  unlinkSync: noop,
  mkdirSync: noop,
  rmSync: noop,
  statSync: () => ({ isDirectory: () => false }),
  writeFile: noop,
  writeFileSync: noop,
  appendFileSync: noop,
  readdirSync: () => [],
  join: (...args) => args.join("/"),
  resolve: (...args) => args.join("/"),
  randomBytes: (size) => Buffer.alloc(size),
  createHash: () => ({ update: () => ({ digest: () => "" }) }),
  
  // Objects
  promises: fsPromises,
};

// Export for ESM (Named Exports)
export const {
  createServer,
  connect,
  spawn,
  exec,
  fork,
  existsSync,
  readFileSync,
  unlinkSync,
  mkdirSync,
  rmSync,
  statSync,
  writeFile,
  writeFileSync,
  appendFileSync,
  readdirSync,
  join,
  resolve,
  randomBytes,
  createHash,
  promises,
} = mock;

export { fileURLToPath, pathToFileURL };

// Export for ESM (Default Export)
export default mock;

// Support for CommonJS style if needed by the bundler
if (typeof module !== 'undefined') {
  module.exports = mock;
}
