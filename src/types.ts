import type { BackgroundColor, ForegroundColor } from "chalk";
import type { sprintf } from "sprintf-js";

export type CornsolColor = typeof BackgroundColor | typeof ForegroundColor;
export type LogType =
  | "log"
  | "groupStart"
  | "groupLine"
  | "groupEnd"
  | "internalGroupStart"
  | "internalGroupLine"
  | "internalGroupEnd"
  | "info"
  | "start"
  | "error"
  | "warn"
  | "del"
  | "debug"
  | "dir"
  | "divider"
  | "table"
  | "trace";
export type SymbolType =
  | "groupStart"
  | "groupLine"
  | "groupEnd"
  | "internalGroupStart"
  | "internalGroupLine"
  | "internalGroupEnd"
  | "singleLine"
  | "newLine"
  | "prefix"
  | "divider";

export type CornsolSymbol = string | ((context: CornsolContext) => string);
export type CornsolFormatter = (context: CornsolContext) => string;
export type PrintFunction = (msg?: any, ...params: any[]) => void;

export interface CornsolContext {
  settings: CornsolSettings;
  lineNo: number;
  logType: LogType;
  format: typeof sprintf;
  duration: (d: number) => string;
}

export interface CornsolSettings {
  spinner: {
    symbols: string;
    isActive: boolean;
  };
  colors: { [key in LogType]: CornsolColor[] };
  symbols: {
    groupStart: CornsolSymbol;
    groupLine: CornsolSymbol;
    groupEnd: CornsolSymbol;
    internalGroupStart: CornsolSymbol;
    internalGroupLine: CornsolSymbol;
    internalGroupEnd: CornsolSymbol;
    singleLine: CornsolSymbol;
    newLine: CornsolSymbol;
    divider: CornsolSymbol;
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
    divider: (context, msg: any, ...params: any[]) => string;
  };
}

export interface PrintGroupStack {
  depth: number;
  prefix: string;
  lineNo: number;
}

declare global {
  interface Console {
    groupEnd(...labels: any[]): void;
    div(...data: any[]): void;
    array(arr: any[]): void;
    chunk(chunk: any): void;
  }
}
