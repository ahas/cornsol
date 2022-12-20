import chalk from "chalk";
import { sprintf } from "sprintf-js";
import type { CornsolSettings, CornsolContext, LogType, SymbolType } from "./types";

export const defaultSpinners = {
  A: ["⣾", "⣽", "⣻", "⢿", "⡿", "⣟", "⣯", "⣷"],
  B: ["▉", "▊", "▋", "▌", "▍", "▎", "▏", "▎", "▍", "▌", "▋", "▊", "▉"],
  C: ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█", "▇", "▆", "▅", "▄", "▃", "▁"],
  D: ["▖", "▘", "▝", "▗"],
  E: ["┤", "┘", "┴", "└", "├", "┌", "┬", "┐"],
  F: ["◢", "◣", "◤", "◥"],
  G: ["◰", "◳", "◲", "◱"],
  H: ["◴", "◷", "◶", "◵"],
  I: ["◐", "◓", "◑", "◒"],
  J: ["◡◡", "⊙⊙", "◠◠"],
  K: ["←", "↖", "↑", "↗", "→", "↘", "↓", "↙"],
  L: ["⠁", "⠂", "⠄", "⡀", "⢀", "⠠", "⠐", "⠈"],
  M: ["b", "ᓂ", "q", "ᓄ"],
  N: ["d", "ᓇ", "p", "ᓀ"],
  O: ["d", "|", "b", "|"],
  P: ["q", "|", "p", "|"],
  Q: ["ᓂ", "—", "ᓄ", "—"],
  R: ["ᓇ", "—", "ᓀ", "—"],
  S: ["|", "/", "—", "\\"],
};

// original console functions
const _log = console.log;
const _info = console.info;
const _error = console.error;
const _warn = console.warn;
const _debug = console.debug;

// global status
let _lineNo = 0;
let _groupLineNo = 0;
let _isGroupEnabled = false;
let _isGroupEnd = false;
let _printGroupPrefix = "";
let _spinnerIndex = 0;
let _spinnerInterval: NodeJS.Timeout = null;
let _lastPrintText = "";
let _settings: CornsolSettings = {
  spinner: {
    characters: defaultSpinners.A,
    isActive: false,
  },
  colors: {
    log: [],
    groupStart: ["green"],
    groupLine: [],
    groupEnd: ["blue"],
    info: ["blue"],
    start: ["green"],
    error: ["red"],
    warn: ["yellow"],
    del: ["red"],
    debug: ["magenta"],
  },
  symbols: {
    groupStart: "┬",
    groupLine: "│",
    groupEnd: "└",
    singleLine: "─",
    newLine: "↳",
    prefix: ({ settings, logType }) => settings.colors[logType].reduce((a, b) => chalk[b](a), "➤"),
  },
  formatters: {
    labelSpace(context) {
      const lineNoText = context.settings.formatters.lineNumber(context);
      const lineIcon = _isGroupEnabled ? _printGroupPrefix : getSymbol("singleLine", context.logType);
      const prefix = getSpace(lineNoText.length + 3);

      return getSpace(`${prefix} ${context.settings.spinner.isActive ? " " : lineIcon}`.length + 1);
    },
    groupNewLineSpace(context) {
      const lineNoText = context.settings.formatters.lineNumber(context);

      return `${getSpace(lineNoText.length + 3)} ${
        context.settings.spinner.isActive ? " " : getSymbol("groupLine", context.logType)
      }`;
    },
    label(context) {
      const prefixSymbol = getSymbol("prefix", context.logType);
      const lineNoText = context.settings.formatters.lineNumber(context);
      const groupSymbol = context.settings.spinner.isActive
        ? context.settings.spinner.characters[_spinnerIndex]
        : _printGroupPrefix;
      const lineSymbol = _isGroupEnabled ? groupSymbol : getSymbol("singleLine", context.logType);
      let prefix: string;

      if (_isGroupEnabled && _groupLineNo >= 1) {
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
    stepStart: (context, name) => `${name} step`,
    stepEnd: (context, name, duration) => `Completed in ${context.settings.formatters.duration(duration)}`,
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
  },
};

// private functions
function increaseLineNo() {
  if (!_isGroupEnabled) {
    _lineNo++;
  } else {
    _groupLineNo++;
  }
}

function getContext(partial: Pick<CornsolContext, "logType">): CornsolContext {
  return {
    settings: _settings,
    lineNo: _lineNo,
    format: sprintf,
    ...(partial || {}),
  } as CornsolContext;
}

function getSymbol(name: SymbolType, logType: LogType) {
  const symbol = _settings.symbols[name];

  return typeof symbol === "function" ? symbol(getContext({ logType })) : symbol;
}

function splitMessage(context: CornsolContext, label: string, msg: any, ...params: any[]) {
  let str = context.format(String(msg), ...params);

  const maxMessageWidth = process.stdout.columns - label.length - 3;
  const lines: string[] = [];
  const length = str.length;

  for (let i = 0; i < length; i += maxMessageWidth) {
    lines.push(str.substring(0, maxMessageWidth));
    str = str.substring(maxMessageWidth);
  }

  let result = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let label: string;

    if (_isGroupEnabled && !_isGroupEnd) {
      label = context.settings.formatters.groupNewLineSpace(context);
    } else {
      label = context.settings.formatters.labelSpace(context);
    }

    const newLineSymbol = `\n${label} ${getSymbol("newLine", context.logType)} `;

    result += line;

    if (i + 1 < lines.length) {
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

function updateSpinner(logType: LogType, msg: any, ...params: any[]) {
  const text = _settings.formatters.print(getContext({ logType }), msg, ...params);

  if (_spinnerInterval) {
    const lines = text.split("\n");

    for (let i = 0; i < lines.length; i++) {
      process.stdout.moveCursor(0, -1);
      process.stdout.clearLine(0);
    }
  }

  if (++_spinnerIndex >= _settings.spinner.characters.length) {
    _spinnerIndex = 0;
  }

  process.stdout.cursorTo(0);
  process.stdout.write(text + "\n");
}

function print(fn: Function, logType: LogType, msg: any, ...params: any[]) {
  _settings.spinner.isActive && removeSpinner();

  if (_isGroupEnabled && _groupLineNo > 0 && !_isGroupEnd) {
    _lastPrintText = _settings.formatters.print(getContext({ logType }), msg, ...params);
    _spinnerIndex = 0;
    _settings.spinner.isActive = true;

    updateSpinner(logType, msg, ...params);
    _spinnerInterval = setInterval(() => updateSpinner(logType, msg, ...params), 100);
  } else {
    fn(_settings.formatters.print(getContext({ logType }), msg, ...params));
    increaseLineNo();
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
}

export function getSpace(len: number) {
  return new Array(len).join(" ");
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

export async function openPrintGroup<T>(fn?: () => T | Promise<T>): Promise<T> {
  _isGroupEnabled = true;
  _printGroupPrefix = getSymbol("groupStart", "groupStart");

  _groupLineNo = 0;
  const ret = (await fn?.()) || undefined;
  !fn && console.log("");

  _groupLineNo++;
  _printGroupPrefix = getSymbol("groupLine", "groupLine");

  return ret;
}

export function openPrintGroupSync<T>(fn?: () => T): T {
  _isGroupEnabled = true;
  _printGroupPrefix = getSymbol("groupStart", "groupStart");

  _groupLineNo = 0;
  const ret = fn?.() || undefined;
  !fn && console.log("");

  _groupLineNo++;
  _printGroupPrefix = getSymbol("groupLine", "groupLine");

  return ret;
}

export async function closePrintGroup<T>(fn?: () => T): Promise<T> {
  _isGroupEnd = true;
  _printGroupPrefix = getSymbol("groupEnd", "groupEnd");

  const ret = (await fn?.()) || undefined;
  !fn && console.log("");

  _printGroupPrefix = getSymbol("groupLine", "groupLine");
  _isGroupEnabled = false;
  _isGroupEnd = false;
  _lineNo++;

  return ret;
}

export function closePrintGroupSync<T>(fn?: () => T): T {
  _isGroupEnd = true;
  _printGroupPrefix = getSymbol("groupEnd", "groupEnd");

  const ret = fn?.() || undefined;
  !fn && console.log("");

  _printGroupPrefix = getSymbol("groupLine", "groupLine");
  _isGroupEnabled = false;
  _isGroupEnd = false;
  _lineNo++;

  return ret;
}

export async function printStep<T = void>(stepName: string, stepFunction: () => T | Promise<T>): Promise<T> {
  const start = Date.now();

  await openPrintGroup(() => {
    const context = getContext({ logType: "groupStart" });

    return printInfo(_settings.formatters.stepStart(context, stepName));
  });

  const ret = await stepFunction();
  const end = Date.now();

  await closePrintGroup(() => {
    const context = getContext({ logType: "groupEnd" });

    return printInfo(context.settings.formatters.stepEnd(context, stepName, end - start));
  });

  return ret;
}

export function printStepSync<T = void>(stepName: string, stepFunction: () => T): T {
  const start = Date.now();

  openPrintGroupSync(() => {
    const context = getContext({ logType: "groupStart" });

    return printInfo(_settings.formatters.stepStart(context, stepName));
  });

  const ret = stepFunction();
  const end = Date.now();

  closePrintGroupSync(() => {
    const context = getContext({ logType: "groupEnd" });

    printInfo(context.settings.formatters.stepEnd(context, stepName, end - start));
  });

  return ret;
}

export async function printGroup<T = void>(
  stepFunction: () => T | Promise<T>,
  open?: () => void | Promise<void>,
  close?: () => void | Promise<void>
): Promise<T> {
  await openPrintGroup(open);

  const ret = await stepFunction();

  await closePrintGroup(close);

  return ret;
}

export function printGroupSync<T = void>(stepFunction: () => T, open?: () => void, close?: () => void): T {
  openPrintGroupSync(open);

  const ret = stepFunction();

  closePrintGroupSync(close);

  return ret;
}

export async function printArray(fn: (msg: any, ...params: any[]) => void, messages: any[]): Promise<void> {
  if (messages.length === 1) {
    fn(messages[0]);
  } else if (messages.length >= 2) {
    await openPrintGroup(() => fn(messages[0]));

    for (let i = 1; i < messages.length - 1; i++) {
      fn(messages[i]);
    }

    await closePrintGroup(() => fn(messages[messages.length - 1]));
  }
}

export function printBuffer(fn: (msg: any, ...params: any[]) => void, chunk: any): Promise<void> {
  return printArray(fn, Buffer.from(chunk).toString().trim().split("\n"));
}

export function printArraySync(fn: (msg: any, ...params: any[]) => void, messages: any[]): void {
  if (messages.length === 1) {
    fn(messages[0]);
  } else {
    openPrintGroupSync(() => fn(messages[1]));

    for (let i = 1; i < messages.length - 1; i++) {
      fn(messages[i]);
    }

    closePrintGroupSync(() => fn(messages[messages.length - 1]));
  }
}

export function printBufferSync(fn: (msg: any, ...params: any[]) => void, chunk: any): void {
  printArraySync(fn, Buffer.from(chunk).toString().trim().split("\n"));
}
