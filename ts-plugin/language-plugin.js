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
      console.log('=== Virtual Code for ' + relative(process.cwd(), scriptId) + ' ===');
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
 * @typedef {{ generatedOffsets: number[], lengths: number[], sourceOffsets: number[], generatedLengths?: number[] }} Mapping
 */

/**
 * 
 * @param {string} cssModuleText 
 * @returns {{ text: string, mapping: Mapping }}
 */
function createDts(cssModuleText) {
  /** @type {Mapping & { generatedLengths: number[] }} */
  const mapping = { generatedOffsets: [], lengths: [], sourceOffsets: [], generatedLengths: [] };

  const result = cssModuleText.match(/\.([a-zA-Z0-9_-]+)/g);
  if (!result) return { text: 'declare const styles: {};\nexport default styles;', mapping };

  const classNames = result.map(i => i.slice(1));
  const uniqueClassNames = Array.from(new Set(classNames));
  const dtsText = `
${classNames.map(className => `declare var _token_${uniqueClassNames.indexOf(className)}: string;`).join('\n')}
${classNames.map(className => `export { _token_${uniqueClassNames.indexOf(className)} as '${className}' };`).join('\n')}
  `.trim();

  for (const className of classNames) {
    mapping.sourceOffsets.push(cssModuleText.indexOf(className));
    mapping.lengths.push(className.length);
    mapping.generatedOffsets.push(dtsText.indexOf(`_token_${uniqueClassNames.indexOf(className)}`));
    mapping.generatedLengths.push(`_token_${uniqueClassNames.indexOf(className)}`.length);

    mapping.sourceOffsets.push(cssModuleText.indexOf(className));
    mapping.lengths.push(className.length);
    mapping.generatedOffsets.push(dtsText.indexOf(className));
    mapping.generatedLengths.push(className.length);
  }

  return { text: dtsText, mapping };
}
