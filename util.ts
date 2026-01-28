import ts from "typescript";
import fs from "node:fs";
import path from "node:path";

export function createLanguageService(projectRoot: string): ts.LanguageService {
  const configPath = path.join(projectRoot, "tsconfig.json");
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    projectRoot,
  );

  const languageServiceHost: ts.LanguageServiceHost = {
    getScriptFileNames: () => parsedConfig.fileNames,
    getScriptVersion: () => "0",
    getScriptSnapshot: (fileName) => {
      if (!fs.existsSync(fileName)) {
        return undefined;
      }
      const content = fs.readFileSync(fileName, "utf-8");
      return ts.ScriptSnapshot.fromString(content);
    },
    getCurrentDirectory: () => projectRoot,
    getCompilationSettings: () => parsedConfig.options,
    getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    directoryExists: ts.sys.directoryExists,
    getDirectories: ts.sys.getDirectories,
  };

  const languageService = ts.createLanguageService(
    languageServiceHost,
    ts.createDocumentRegistry(),
  );
  return languageService;
}

export function createLanguageServiceWithVolarTSPlugin(
  projectRoot: string,
): ts.LanguageService {
  const host: ts.server.ServerHost = {
    ...ts.sys,
    watchFile: ts.sys.watchFile!,
    watchDirectory: ts.sys.watchDirectory!,
    setTimeout: (callback, ms, ...args) =>
      setTimeout(() => callback(...args), ms),
    clearTimeout: clearTimeout,
    setImmediate: setImmediate,
    clearImmediate: clearImmediate,
  };
  const logger: ts.server.Logger = {
    close: () => {},
    hasLevel: () => false,
    loggingEnabled: () => false,
    perftrc: () => {},
    info: () => console.info,
    startGroup: () => console.group,
    endGroup: () => console.groupEnd,
    msg: () => console.log,
    getLogFileName: () => undefined,
  };
  const cancellationToken: ts.HostCancellationToken = {
    isCancellationRequested: () => false,
  };

  const projectService = new ts.server.ProjectService({
    host,
    logger,
    cancellationToken,
    useSingleInferredProject: false,
    useInferredProjectPerProjectRoot: false,
    globalPlugins: ["ts-plugin"],
    pluginProbeLocations: [import.meta.dirname],
    session: undefined,
  });

  const configPath = path.join(projectRoot, "tsconfig.json");
  projectService.openClientFile(configPath); // Load project
  const project = projectService.findProject(configPath);
  if (!project) throw new Error("Project not found");

  const languageService = project.getLanguageService();
  return languageService;
}

export function getPosition(
  sourceFile: ts.SourceFile,
  line: number,
  column: number,
): number {
  return ts.getPositionOfLineAndCharacter(sourceFile, line - 1, column - 1);
}

export function extractLocation({ fileName, textSpan }: { fileName: string; textSpan: ts.TextSpan }) {
  return { fileName, textSpan };
}
