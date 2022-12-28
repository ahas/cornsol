import chalk from "chalk";
import util, { InspectOptions } from "util";
import type { CornsolSettings, CornsolContext, PrintGroupStack, LogType, SymbolType, PrintFunction } from "./types";
import { groupCollapsed } from "console";

export const spinners = [
  "⣾⣽⣻⢿⡿⣟⣯⣷",
  "←↖↑↗→↘↓↙",
  "⠁⠂⠄⡀⢀⠠⠐⠈",
  "▉▊▋▌▍▎▏▎▍▌▋▊▉",
  "▁▂▃▄▅▆▇█▇▆▅▄▃▂▁",
  "▖▘▝▗",
  "┤┘┴└├┌┬┐",
  "◢◣◤◥",
  "◰◳◲◱",
  "◴◷◶◵",
  "◐◓◑◒",
  "◡⊙◠",
  "bᓂqᓄ",
  "dᓇpᓀ",
  "d|b|",
  "q|p|",
  "ᓂ—ᓄ—",
  "ᓇ—ᓀ—",
  "|/—\\",
];

// original console functions
const _log = console.log;
const _info = console.info;
const _error = console.error;
const _warn = console.warn;
const _debug = console.debug;
const _dir = console.dir;
const _table = console.table;
const _trace = console.trace;
const _group = console.group;
const _groupCollapsed = console.groupCollapsed;
const _groupEnd = console.groupEnd;

export const plain = {
  log: _log,
  info: _info,
  error: _error,
  warn: _warn,
  debug: _debug,
  dir: _dir,
  table: _table,
  trace: _trace,
  group: _group,
  groupCollapsed: _groupCollapsed,
  groupEnd: _groupEnd,
};

// global status
const _groupStack: PrintGroupStack[] = [];

let _lineNo = 0;
let _groupLineNo = 0;
let _isGroupStart = false;
let _isGroupEnd = false;
let _groupDepth = 0;
let _printGroupPrefix = "";
let _spinnerIndex = 0;
let _spinnerInterval: NodeJS.Timeout = null;
let _lastPrintText = "";
let _settings: CornsolSettings = {
  spinner: {
    symbols: spinners[0],
    isActive: false,
  },
  colors: {
    log: [],
    groupStart: ["green"],
    groupLine: [],
    groupEnd: ["blue"],
    internalGroupStart: ["green"],
    internalGroupLine: [],
    internalGroupEnd: ["blue"],
    info: ["blue"],
    start: ["green"],
    error: ["red"],
    warn: ["yellow"],
    del: ["red"],
    debug: ["magenta"],
    dir: ["magenta"],
    divider: [],
    table: ["magenta"],
    trace: ["magenta"],
  },
  symbols: {
    groupStart: "┌",
    groupLine: "│",
    groupEnd: "└",
    internalGroupStart: "├─┬",
    internalGroupLine: "│ │",
    internalGroupEnd: "│ └",
    singleLine: "─",
    newLine: "↳",
    divider: "─",
    prefix: ({ settings, logType }) => settings.colors[logType].reduce((a, b) => chalk[b](a), "➤"),
  },
  formatters: {
    labelSpace(context) {
      const lineNoText = context.settings.formatters.lineNumber(context);
      const groupSymbol = getGroupSymbol(context);
      const lineIcon = _groupDepth > 0 ? groupSymbol : getSymbol("singleLine", context.logType);
      const prefix = getSpace(lineNoText.length + 3);

      return getSpace(`${prefix} ${context.settings.spinner.isActive ? " " : lineIcon}`.length + 1);
    },
    groupNewLineSpace(context) {
      const lineNoText = context.settings.formatters.lineNumber(context);
      let groupSymbol: string = "";

      if (!context.settings.spinner.isActive) {
        if (_groupDepth > 1) {
          groupSymbol = appendGroupLine(groupSymbol);
          const groupLineSymbol = getSymbol("groupLine", "groupLine");
          const groupInternalLineSymbol = getSymbol("internalGroupLine", "internalGroupLine");

          if (_isGroupEnd) {
            groupSymbol +=
              getSymbol("groupLine", "groupLine") +
              new Array(groupInternalLineSymbol.length - groupLineSymbol.length).join(" ");
          } else if (!_isGroupEnd) {
            groupSymbol += getSymbol("internalGroupLine", "internalGroupLine");
          }
        } else if (!_isGroupEnd) {
          groupSymbol += getSymbol("groupLine", "groupLine");
        }
      } else {
        groupSymbol = " ";
      }

      return `${getSpace(lineNoText.length + 3)} ${groupSymbol}`;
    },
    label(context) {
      const prefixSymbol = getSymbol("prefix", context.logType);
      const lineNoText = context.settings.formatters.lineNumber(context);
      const groupSymbol = getGroupSymbol(context);
      const lineSymbol = _groupDepth > 0 ? groupSymbol : getSymbol("singleLine", context.logType);
      let prefix: string;

      if (_groupDepth > 0 && _groupLineNo >= 1) {
        prefix = getSpace(lineNoText.length + 3);
      } else {
        prefix = `${prefixSymbol} ${lineNoText}`;
      }

      return `${prefix} ${lineSymbol}`;
    },
    lineNumber: ({ lineNo }) => `${String(lineNo).padStart(4, "0")}:`,
    print(context, msg, ...params) {
      const label = context.settings.formatters.label(context);

      return `${label} ${splitMessage(context, label, msg, ...params)}`;
    },
    stepStart: (_context, name) => `${name} step`,
    stepEnd: (context, _name, duration) => `Completed in ${context.duration(duration)}`,
    divider: (context, msg, ...params) => {
      const label = context.settings.formatters.label(context);
      const dividerSymbol = getSymbol("divider", "log");

      return `${new Array(label.length + 1).join(dividerSymbol)} ${splitMessage(context, label, msg, ...params)}`;
    },
  },
};

// private functions
function pushGroup() {
  _groupStack.push({
    lineNo: _groupLineNo,
    prefix: _printGroupPrefix,
    depth: _groupDepth,
  });

  _groupLineNo = 0;
  _groupDepth++;
}

function popGroup() {
  const stack = _groupStack.pop();

  if (stack) {
    _groupLineNo = stack.lineNo;
    _printGroupPrefix = stack.prefix;
    _groupDepth = stack.depth;
  }
}

function appendGroupLine(groupSymbol: string): string {
  for (let i = 0; i < _groupDepth - 2; i++) {
    const symbol = getSymbol("internalGroupLine", "internalGroupLine");
    groupSymbol += symbol.substring(0, symbol.length - 1);
  }

  return groupSymbol;
}

function getGroupSymbol(context: CornsolContext): string {
  let groupSymbol: string = "";

  if (context.settings.spinner.isActive) {
    groupSymbol = context.settings.spinner.symbols[_spinnerIndex];
  } else if (_isGroupStart) {
    groupSymbol = appendGroupLine(groupSymbol);

    if (_groupDepth > 1) {
      groupSymbol += getSymbol("internalGroupStart", "internalGroupStart");
    } else {
      groupSymbol += getSymbol("groupStart", "groupStart");
    }
  } else if (_isGroupEnd) {
    groupSymbol = appendGroupLine(groupSymbol);

    if (_groupDepth > 1) {
      groupSymbol += getSymbol("internalGroupEnd", "internalGroupEnd");
    } else {
      groupSymbol += getSymbol("groupEnd", "groupEnd");
    }
  } else {
    groupSymbol = appendGroupLine(groupSymbol);

    if (_groupDepth > 1) {
      groupSymbol += getSymbol("internalGroupLine", "internalGroupLine");
    } else {
      groupSymbol += getSymbol("groupLine", "groupLine");
    }
  }

  return groupSymbol;
}

function increaseLineNo() {
  if (_groupDepth === 0 || _isGroupStart) {
    _lineNo++;
  } else {
    _groupLineNo++;
  }
}

function getContext(partial: Pick<CornsolContext, "logType">): CornsolContext {
  return {
    settings: _settings,
    lineNo: _lineNo,
    format: util.format,
    duration(d) {
      if (d > 1000 * 60) {
        const minutes = Math.floor(d / 1000 / 60);
        const seconds = Math.ceil((d - minutes * 60 * 1000) / 1000);

        return seconds === 0 ? `${minutes}m` : `${minutes}m ${seconds}s`;
      } else {
        const seconds = Math.floor(d / 1000);
        const milliseconds = d - seconds * 1000;

        return milliseconds === 0 ? `${seconds}s` : `${seconds}s ${milliseconds}ms`;
      }
    },
    ...(partial || {}),
  } as CornsolContext;
}

function getSymbol(name: SymbolType, logType: LogType) {
  const symbol = _settings.symbols[name];

  return typeof symbol === "function" ? symbol(getContext({ logType })) : symbol;
}

function splitMessage(context: CornsolContext, label: string, msg: any, ...params: any[]) {
  const maxMessageWidth = process.stdout.columns - label.length - 3;
  const lines: string[] = context
    .format(String(msg), ...(params || []))
    .split("\n")
    .map((x) => x.trim());
  const messages: string[] = [];

  for (const line of lines) {
    let buf = line;
    const length = line.length;

    for (let i = 0; i < length; i += maxMessageWidth) {
      messages.push(buf.substring(0, maxMessageWidth));
      buf = buf.substring(maxMessageWidth);
    }
  }

  let result = "";

  for (let i = 0; i < messages.length; i++) {
    const line = messages[i];
    let label: string;

    if (_groupDepth > 0) {
      label = context.settings.formatters.groupNewLineSpace(context);
    } else {
      label = context.settings.formatters.labelSpace(context);
    }

    const newLineSymbol = `\n${label} ${getSymbol("newLine", context.logType)} `;

    result += line;

    if (i + 1 < messages.length) {
      result += newLineSymbol;
    }
  }

  return result;
}

function removeSpinner() {
  const lines = _lastPrintText.split("\n");

  _spinnerInterval && clearInterval(_spinnerInterval);
  _spinnerInterval = null;
  _settings.spinner.isActive = false;

  for (let i = 0; i < lines.length; i++) {
    process.stdout.moveCursor(0, -1);
    process.stdout.clearLine(0);
  }

  process.stdout.write(_lastPrintText + "\n");
}

function initSpinner(text: string) {
  _lastPrintText = text;
  _spinnerIndex = 0;
  _settings.spinner.isActive = true;
}

function updateSpinner(logType: LogType, msg: any, ...params: any[]) {
  const text = _settings.formatters.print(getContext({ logType }), msg, ...params);

  if (_spinnerInterval) {
    const lines = text.split("\n");

    for (let i = 0; i < lines.length; i++) {
      process.stdout.moveCursor(0, -1);
      process.stdout.clearLine(0);
    }
  }

  if (++_spinnerIndex >= _settings.spinner.symbols.length) {
    _spinnerIndex = 0;
  }

  process.stdout.cursorTo(0);
  process.stdout.write(text + "\n");
}

function print(fn: Function, logType: LogType, msg: any, ...params: any[]) {
  _settings.spinner.isActive && removeSpinner();

  if (_groupDepth > 0 && _groupLineNo > 0 && !_isGroupEnd) {
    initSpinner(_settings.formatters.print(getContext({ logType }), msg, ...params));
    updateSpinner(logType, msg, ...params);
    _spinnerInterval = setInterval(() => updateSpinner(logType, msg, ...params), 100);
  } else {
    fn(_settings.formatters.print(getContext({ logType }), msg, ...params));
    increaseLineNo();
  }
}

function printText(fn: Function, logType: LogType, text: string) {
  _settings.spinner.isActive && removeSpinner();

  if (_groupDepth > 0 && _groupLineNo > 0 && !_isGroupEnd) {
    initSpinner(text);
    updateSpinner(logType, text);
    _spinnerInterval = setInterval(() => updateSpinner(logType, text), 100);
  } else {
    fn(text);
  }
}

export function configure(settings: CornsolSettings) {
  _settings ??= {} as CornsolSettings;
  settings ??= {} as CornsolSettings;
  _spinnerIndex = 0;

  for (const key in settings) {
    _settings[key] ??= {};
    Object.assign(_settings[key], settings[key]);
  }
}

export function register() {
  const wrap = (funcName: string, alternative: Function) => {
    (console as any)[funcName] = alternative;
  };

  wrap("log", printLog);
  wrap("info", printInfo);
  wrap("error", printError);
  wrap("warn", printWarn);
  wrap("debug", printDebug);
  wrap("dir", printDir);
  wrap("table", printTable);
  wrap("trace", printTrace);
  wrap("group", openPrintGroupSync.bind(openPrintGroupSync, console.log));
  wrap("groupCollapsed", openPrintGroupSync.bind(openPrintGroupSync, console.log));
  wrap("groupEnd", closePrintGroupSync.bind(closePrintGroupSync, console.log));
  wrap("div", printDivider);
  wrap("chunk", printChunkSync.bind(printArraySync, console.log));
  wrap("array", printArraySync.bind(printArraySync, console.log));
}

export function getSpace(len: number) {
  return new Array(len).join(" ");
}

export function captureLog(logType: LogType, fn: Function) {
  const priorLog = console[logType];
  const messages: string[] = [];

  console[logType] = (msg: string) => messages.push(msg);
  fn();
  console[logType] = priorLog;

  return messages;
}

export function printLog(msg: any, ...params: any[]) {
  print(_log, "log", msg, ...params);
}

export function printInfo(msg: any, ...params: any[]) {
  print(_info, "info", msg, ...params);
}

export function printError(msg: any, ...params: any[]) {
  print(_error, "error", msg, ...params);
}

export function printWarn(msg: any, ...params: any[]) {
  print(_warn, "warn", msg, ...params);
}

export function printStart(msg: any, ...params: any[]) {
  print(_info, "start", msg, ...params);
}

export function printDel(msg: any, ...params: any[]) {
  print(_info, "del", msg, ...params);
}

export function printDebug(msg: any, ...params: any[]) {
  print(_debug, "debug", msg, ...params);
}

export function printDir(item: any, options: InspectOptions) {
  print(_debug, "dir", util.inspect(item, options));
}

export function printTable(tabularData: any, properties?: readonly string[]) {
  const messages = captureLog("log", () => _table(tabularData, properties));

  return printArraySync(console.debug, messages[0].split("\n"));
}

export function printTrace(message?: any, ...optionalParams: any[]) {
  const args = Array.from(arguments);
  const messages = captureLog("error", () => _trace.apply(_trace, args));

  return printArraySync(console.debug, messages[0].split("\n"));
}

export function printDivider(msg: any, ...params: any[]) {
  const context = getContext({ logType: "log" });
  const message = context.settings.formatters.divider(context, msg, ...params);

  printText(_log, "divider", message);
}

export async function openPrintGroup(fn: PrintFunction, ...data: string[]): Promise<void> {
  _isGroupStart = true;
  _printGroupPrefix = getSymbol("groupStart", "groupStart");

  pushGroup();

  fn(...data);

  _groupLineNo++;
  _printGroupPrefix = getSymbol("groupLine", "groupLine");
  _isGroupStart = false;
}

export function openPrintGroupSync(fn: PrintFunction, ...data: string[]): void {
  _isGroupStart = true;
  _printGroupPrefix = getSymbol("groupStart", "groupStart");

  pushGroup();

  fn(...data);

  _groupLineNo++;
  _printGroupPrefix = getSymbol("groupLine", "groupLine");
  _isGroupStart = false;
}

export async function closePrintGroup(fn: PrintFunction, ...data: string[]): Promise<void> {
  _isGroupEnd = true;
  _printGroupPrefix = getSymbol("groupEnd", "groupEnd");

  fn(...data);

  _printGroupPrefix = getSymbol("groupLine", "groupLine");
  _isGroupEnd = false;
  popGroup();
}

export function closePrintGroupSync(fn: PrintFunction, ...data: string[]): void {
  _isGroupEnd = true;
  _printGroupPrefix = getSymbol("groupEnd", "groupEnd");

  fn(...data);

  _printGroupPrefix = getSymbol("groupLine", "groupLine");
  _isGroupEnd = false;
  popGroup();
}

export async function printStep<T = void>(stepName: string, stepFunction: () => T | Promise<T>): Promise<T> {
  let context: CornsolContext;
  const start = Date.now();

  context = getContext({ logType: "groupStart" });
  await openPrintGroup(console.log, _settings.formatters.stepStart(context, stepName));

  const ret = await stepFunction();
  const end = Date.now();

  context = getContext({ logType: "groupEnd" });
  await closePrintGroup(console.log, context.settings.formatters.stepEnd(context, stepName, end - start));

  return ret;
}

export function printStepSync<T = void>(stepName: string, stepFunction: () => T): T {
  let context: CornsolContext;
  const start = Date.now();

  context = getContext({ logType: "groupStart" });
  openPrintGroupSync(console.log, _settings.formatters.stepStart(context, stepName));

  const ret = stepFunction();
  const end = Date.now();

  context = getContext({ logType: "groupEnd" });
  closePrintGroupSync(console.log, context.settings.formatters.stepEnd(context, stepName, end - start));

  return ret;
}

export async function printGroup<T = void>(
  stepFunction: () => T | Promise<T>,
  groupHeader?: string,
  groupFooter?: string
): Promise<T> {
  await openPrintGroup(console.log, groupHeader);

  const ret = await stepFunction();

  await closePrintGroup(console.log, groupFooter);

  return ret;
}

export function printGroupSync<T = void>(stepFunction: () => T, groupHeader?: string, groupFooter?: string): T {
  openPrintGroupSync(console.log, groupHeader);

  const ret = stepFunction();

  closePrintGroupSync(console.log, groupFooter);

  return ret;
}

export async function printArray(fn: PrintFunction, messages: any[]): Promise<void> {
  if (messages.length === 1) {
    fn(messages[0]);
  } else if (messages.length >= 2) {
    await openPrintGroup(messages[0]);

    for (let i = 1; i < messages.length - 1; i++) {
      fn(messages[i]);
    }

    await closePrintGroup(messages[messages.length - 1]);
  }
}

export function printChunk(fn: PrintFunction, chunk: any): Promise<void> {
  return printArray(fn, Buffer.from(chunk).toString().trim().split("\n"));
}

export function printArraySync(fn: PrintFunction, messages: any[]): void {
  if (messages.length === 1) {
    fn(messages[0]);
  } else {
    openPrintGroupSync(fn, messages[0]);

    for (let i = 1; i < messages.length - 1; i++) {
      fn(messages[i]);
    }

    closePrintGroupSync(fn, messages[messages.length - 1]);
  }
}

export function printChunkSync(fn: PrintFunction, chunk: any): void {
  printArraySync(fn, Buffer.from(chunk).toString().trim().split("\n"));
}
