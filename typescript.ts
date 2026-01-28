import { createLanguageService, extractLocation, getPosition } from "./util.ts";
import path from "node:path";

const projectRoot = process.cwd();
const languageService = createLanguageService(projectRoot);
const targetFile = path.join(projectRoot, "src/index.ts");

const sourceFile = languageService.getProgram()?.getSourceFile(targetFile);
if (!sourceFile) throw new Error("Source file not found: " + targetFile);

const position = getPosition(sourceFile, 2, 8); // Position of 'a_1' in styles.a_1

console.log(`\n=== Definitions for a_1 ===`);
const definitions = languageService.getDefinitionAtPosition(
  targetFile,
  position,
);
console.dir(definitions?.map(extractLocation), { depth: null });

console.log(`\n=== References for a_1 ===`);
const references = languageService.findReferences(targetFile, position);
console.dir(references?.map(reference => ({
  definition: extractLocation(reference.definition),
  references: reference.references.map(ref => extractLocation(ref)),
})), { depth: null });

console.log(`=== RenameLocations for a_1 ===`);
const renameLocations = languageService.findRenameLocations(
  targetFile,
  position,
  false,
  false,
  {},
);
console.dir(renameLocations?.map(extractLocation), { depth: null });
