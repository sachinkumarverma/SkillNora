const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Store the browser binaries inside the project directory so Render bundles them into the final runner image
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
