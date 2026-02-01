/// <reference types="@volar/typescript" />

import { relative } from 'node:path';
import ts from 'typescript/lib/tsserverlibrary.js';

const LANGUAGE_ID = 'css-module';

/**
 * @returns {import('@volar/language-core').LanguagePlugin<string>}
 */
export function createCssModuleLanguagePlugin() {
  return {
    getLanguageId(scriptId) {
      if (scriptId.endsWith('.module.css')) return LANGUAGE_ID;
      return undefined;
    },
    createVirtualCode(scriptId, languageId, snapshot) {
      if (languageId !== LANGUAGE_ID) return undefined;
      const length = snapshot.getLength();
      const cssModuleText = snapshot.getText(0, length);
      const { text, mapping } = createDts(cssModuleText);
      console.log('\n=== Virtual Code for ' + relative(process.cwd(), scriptId) + ' ===');
      console.log(text);
      console.log('\n=== Mapping for ' + relative(process.cwd(), scriptId) + ' ===');
      console.log(mapping);
      return {
        id: 'main',
        languageId: 'typescript',
        snapshot: {
          getText: (start, end) => text.slice(start, end),
          getLength: () => text.length,
          getChangeRange: () => undefined,
        },
        mappings: [{ ...mapping, data: { navigation: true } }],
      };
    },
    typescript: {
      extraFileExtensions: [
        {
          extension: 'css',
          isMixedContent: true,
          scriptKind: ts.ScriptKind.TS,
        },
      ],
      getServiceScript(root) {
        return {
          code: root,
          extension: ts.Extension.Ts,
          scriptKind: ts.ScriptKind.TS,
        };
      },
    },
  };
}

/**
 * @typedef {Pick<import('@volar/language-core').CodeMapping, 'generatedOffsets' | 'sourceOffsets' | 'lengths'>} Mapping
 */

/**
 * 
 * @param {string} cssModuleText 
 * @returns {{ text: string, mapping: Mapping }}
 */
function createDts(cssModuleText) {
  /** @type {Mapping} */
  const mapping = { generatedOffsets: [], sourceOffsets: [], lengths: [] };

  const result = cssModuleText.match(/\.([a-zA-Z0-9_-]+)/g);
  if (!result) return { text: 'declare const styles: {};\nexport default styles;', mapping };

  const classNames = result.map(i => i.slice(1));
  const dtsText = `
declare const styles: {
${classNames.map(className => `  '${className}': string,`).join('\n')}
};
export default styles;
  `.trim();

  for (const className of classNames) {
    mapping.sourceOffsets.push(cssModuleText.indexOf(className));
    mapping.generatedOffsets.push(dtsText.indexOf(className));
    mapping.lengths.push(className.length);
  }

  return { text: dtsText, mapping };
}
