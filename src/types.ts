import type { BackgroundColor, ForegroundColor } from "chalk";
import type util from "util";

export type CornsolColor = typeof BackgroundColor | typeof ForegroundColor;
export type LogType =
  | "log"
  | "groupStart"
  | "groupLine"
  | "groupEnd"
  | "nestedGroupStart"
  | "nestedGroupLine"
  | "nestedGroupEnd"
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
  | "nestedGroupStart"
  | "nestedGroupLine"
  | "nestedGroupEnd"
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
  format: typeof util.format;
  duration: (d: number) => string;
}

export interface CornsolSettings {
  spinner: {
    symbols: string;
    isActive: boolean;
  };
  colors: { [key in LogType]: CornsolColor[] };
  symbols: {
    /**
     * The print group indicator when the group is started and the depth equals to `1`.
     **/
    groupStart: CornsolSymbol;
    /**
     * The print group indicator when the depth equals to `1`.
     * @default '┌'
     **/
    groupLine: CornsolSymbol;
    /**
     * The print group indicator when the group is ended and the depth equals to `1`.
     * @default '│'
     **/
    groupEnd: CornsolSymbol;
    /**
     * The print group indicator when the group is started and the depth greater than `1`.
     * @default '└'
     **/
    nestedGroupStart: CornsolSymbol;
    /**
     * The print group indicator when the depth greater than `1`.
     * @default '├─┬'
     **/
    nestedGroupLine: CornsolSymbol;
    /**
     * The print group indicator when the group is ended and the depth greater than `1`.
     * @default '│ │'
     **/
    nestedGroupEnd: CornsolSymbol;
    /**
     * The line indicator for general single line print.
     * @default '│ └'
     **/
    singleLine: CornsolSymbol;
    /**
     * The line feed symbol for automatically wrapped string.
     * @default '─'
     **/
    newLine: CornsolSymbol;
    /**
     * The divider symbol.
     *
     * It will be repeated from column 0 to symbol position.
     * @default '↳'
     **/
    divider: CornsolSymbol;
    /**
     * The prefix of line symbol.
     *
     * It is colored by each function type.
     * @default '➤'
     **/
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
    /**
     * Open the print group with labels.
     *
     * The print group will be opened with `settings.symbols.groupStart`.
     * It increases the internal variable `_printGroupDepth`.
     * If `_printGroupDepth` greater than `0` then the indicator symbol will be set with `settings.symbols.nestedGroupStart`
     * @param {any[]} labels - The labels will be printed as group footer.
     **/
    group(...labels: any[]): void;
    /**
     * Close the print group with labels.
     *
     * The print group will be closed with `settings.symbols.groupEnd`.
     * It decreases the internal variable `_printGroupDepth`.
     * If `_printGroupDepth` greater than `0` then the indicator symbol will be set with `settings.symbols.nestedGroupEnd`
     * @param {any[]} labels - The labels will be printed as group footer.
     **/
    groupEnd(...labels: any[]): void;
    /**
     * Print the divider
     * @param {any[]} labels - The labels will be printed with divider.
     **/
    div(...labels: any[]): void;
    array: {
      /**
       * Print the array with group indicators.
       */
      (arr: any[]): void;
      /**
       * Print the array with group indicators asynchronously.
       */
      async: (arr: any[]) => Promise<void>;
    };
    chunk: {
      /**
       * Print the chunk (like I/O data).
       * @param {any} chunk - The readable data. It will be parsed by `Buffer.from`
       **/
      (chunk: any): void;
      /**
       * Print the chunk (like I/O data) asynchronously.
       * @param {any} chunk - The readable data. It will be parsed by `Buffer.from`
       **/
      async: (chunk: any) => Promise<void>;
    };
    step: {
      /**
       * Print the progress step.
       *
       * It shows the turnaround time when the `work` function ends.
       * @param {string} title - The step title
       * @param {string} work - The work group
       **/
      <T = void>(title: string, work: () => T): T;
      /**
       * Print the progress step asynchronously.
       *
       * It shows and the turnaround time when the `work` function ends
       * and a progress spinner until the `work` function is resolved
       * @param {string} title - The step title
       * @param {string} work - The work group
       **/
      async: <T = void>(title: string, work: Promise<T> | (() => Promise<T>)) => Promise<T>;
    };
  }
}
