import type { BackgroundColor, ForegroundColor } from "chalk";
import type { sprintf } from "sprintf-js";

export type CornsolColor = typeof BackgroundColor | typeof ForegroundColor;
export type LogType =
  | "log"
  | "groupStart"
  | "groupLine"
  | "groupEnd"
  | "info"
  | "start"
  | "error"
  | "warn"
  | "del"
  | "debug";
export type SymbolType = "groupStart" | "groupLine" | "groupEnd" | "singleLine" | "newLine" | "prefix";

export type CornsolSymbol = string | ((context: CornsolContext) => string);
export type CornsolFormatter = (context: CornsolContext) => string;

export interface CornsolContext {
  settings: CornsolSettings;
  lineNo: number;
  logType: LogType;
  format: typeof sprintf;
}

export interface CornsolSettings {
  colors: { [key in LogType]: CornsolColor[] };
  symbols: {
    groupStart: CornsolSymbol;
    groupLine: CornsolSymbol;
    groupEnd: CornsolSymbol;
    singleLine: CornsolSymbol;
    newLine: CornsolSymbol;
    prefix: CornsolSymbol;
  };
  formatters: {
    labelSpace: CornsolFormatter;
    groupNewLineSpace: CornsolFormatter;
    label: CornsolFormatter;
    lineNumber: CornsolFormatter;
    print: (context: CornsolContext, msg: any, ...params: any[]) => string;
    stepStart: (context: CornsolContext, name: string) => string;
    stepEnd: (context: CornsolContext, name: string, duration: number) => string;
    duration: (d: number) => string;
  };
}
