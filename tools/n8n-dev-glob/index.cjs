const { glob, globSync } = require('tinyglobby');

// The pinned official CLI uses these options for build assets and template files.
// Refuse an expanded API instead of silently changing a future CLI's behavior.
const supported = new Set(['cwd', 'absolute', 'dot', 'ignore']);
function optionsFor(options = {}) {
  for (const key of Object.keys(options)) {
    if (!supported.has(key)) {
      throw new TypeError(`Unsupported n8n development glob option: ${key}`);
    }
  }
  return { ...options, onlyFiles: true, expandDirectories: false };
}

async function findFiles(patterns, options) {
  return glob(patterns, optionsFor(options));
}
findFiles.sync = (patterns, options) => globSync(patterns, optionsFor(options));

module.exports = findFiles;
