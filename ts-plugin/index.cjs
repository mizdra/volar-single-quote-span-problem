const { createLanguageServicePlugin } = require('@volar/typescript/lib/quickstart/createLanguageServicePlugin.js');
const { createCssModuleLanguagePlugin } = require('./language-plugin.js');

module.exports = createLanguageServicePlugin((ts, info) => {
  return {
    languagePlugins: [createCssModuleLanguagePlugin()],
  };
});
