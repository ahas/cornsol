# 🌽 cornsol 🌞

Pretty, Formatted, Numbered, Customizable

JavaScript console library.

[Demo](https://stackblitz.com/edit/node-1khd2o?file=index.ts)

![npm](https://img.shields.io/npm/v/cornsol)
![npm dev dependency version](https://img.shields.io/npm/dependency-version/cornsol/dev/typescript)
![npm](https://img.shields.io/npm/dm/cornsol)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/ahas/cornsol)
![NPM](https://img.shields.io/npm/l/cornsol)
![GitHub Repo stars](https://img.shields.io/github/stars/ahas/cornsol?style=social)

## Table of contents

- [Installation](#installation)
- [Cautions](#cautions)
- [Usage](#usage)
  - [Register globally](#register-globally)
  - [Function supports](#function-supports)
  - [Group](#group)
  - [Array](#array)
  - [Chunk](#chunk)
  - [Divider](#divider)
- [Customizations](#customizations)
  - [Spinners](#spinners)
  - [Line numbers](#line-numbers)
  - [Step messages](#step-messages)
  - [Symbols](#symbols)

## Installation

```bash
npm i cornsol
# or
yarn add cornsol
```

## Cautions

`cornsol` use the default naming for **asynchronous**.

If you want to use synchronous functions then use functions below.

```ts
function openPrintGroupSync<T>(fn?: () => T): T;
function closePrintGroupSync<T>(fn?: () => T): T;
function printStepSync<T = void>(stepName: string, stepFunction: () => T): T;
function printGroupSync<T = void>(stepFunction: () => T, open?: () => void, close?: () => void): T;
function printArraySync(fn: (msg: any, ...params: any[]) => void, messages: any[]): void;
function printBufferSync(fn: (msg: any, ...params: any[]) => void, chunk: any): void;
```

## Usage

### Register globally

1. JavaScript

```ts
const corn = require("cornsol");

corn.register();
```

2. TypeScript

```ts
import * as corn from "cornsol";

corn.register();
```

### Function supports

#### Overloads
- log
- debug
- dir
- info
- warn
- error
- group
- table
- trace
- groupCollapsed
- groupEnd

#### Extra features
- div
- array
- chunk

### Group

Example

```js
const corn = require("cornsol");

corn.register();

corn.printGroupSync(
  () => {
    console.log("content");
  },
  "group start",
  "group end"
);

// Open and close the group manually
console.group("group start");
console.log("content");
console.groupEnd("close group");
// or
corn.openPrintGroupSync(console.log, "group start");
console.log("content");
corn.closePrintGroupSync(console.log, "close group");
```

Result

```bash
➤ 0000: ─ This is an example for print group
➤ 0001: ┌ group start
        │ content
        └ group end
➤ 0002: ┌ group start
        │ content
        └ close group
```

### Array

Example

```ts
const corn = require("cornsol");

corn.register();

console.array(["Item 1", "Item 2"]);
// or
corn.printArray(console.log, ["Item 1", "Item 2"]);
```

Result

```bash
➤ 0000: ┌ Item 1
        └ Item 2
```

### Chunk

Example

```ts
const { printChunk } = require("cornsol");
const { exec } = require("child_process");

const proc = exec("process_path");

proc.stdout.on("data", console.chunk);
// or
proc.stdout.on("data", (chunk) => printBuffer(console.log, chunk));

// It works internally like
printArray(console.log, Buffer.from(chunk).toString().trim().split("\n"));
```

### Divider

Example

```ts
console.log("message 1");
console.div("This is a divider");
console.log("message 2");

// or

const { printDivider } = require("cornsol");

console.log("message 1");
printDivider("This is a divider");
console.log("message 2");
```

Result

```bash
➤ 0000: ─ message 1
───────── This is a divider
➤ 0001: ─ message 2
```

## Customizations

`cornsol` supports customizing.

### Spinners

`cornsol` use ASCII spinners on group print.

There are some presets for spinner.

```ts
// Built-in presets
export const spinners = [
  /* 0  */ "⣾⣽⣻⢿⡿⣟⣯⣷",
  /* 1  */ "←↖↑↗→↘↓↙",
  /* 2  */ "⠁⠂⠄⡀⢀⠠⠐⠈",
  /* 3  */ "▉▊▋▌▍▎▏▎▍▌▋▊▉",
  /* 4  */ "▁▂▃▄▅▆▇█▇▆▅▄▃▂▁",
  /* 5  */ "▖▘▝▗",
  /* 6  */ "┤┘┴└├┌┬┐",
  /* 7  */ "◢◣◤◥",
  /* 8  */ "◰◳◲◱",
  /* 9  */ "◴◷◶◵",
  /* 10 */ "◐◓◑◒",
  /* 11 */ "◡⊙◠",
  /* 12 */ "bᓂqᓄ",
  /* 13 */ "dᓇpᓀ",
  /* 14 */ "d|b|",
  /* 15 */ "q|p|",
  /* 16 */ "ᓂ—ᓄ—",
  /* 17 */ "ᓇ—ᓀ—",
  /* 18 */ "|/—\\",
];

// Update config
const corn = require("cornsol");

corn.configure({
  spinner: {
    symbols: corn.spinners[4], // "▁▂▃▄▅▆▇█▇▆▅▄▃▂▁"
  },
});
```

### Line numbers

Example

```ts
const corn = require("cornsol");

corn.register();

corn.configure({
  formatters: {
    lineNumber: (context) => `${String(context.lineNo).padStart(2, "0")} [${new Date().toISOString()}]:`,
  },
});

console.log(0);
console.log(1);
console.log(2);
```

Result

```bash
➤ 01 [2022-12-20T02:48:47.909Z]: ─ 0
➤ 02 [2022-12-20T02:48:47.909Z]: ─ 1
➤ 03 [2022-12-20T02:48:47.909Z]: ─ 2
```

### Step messages

Example

```ts
const corn = require("cornsol");

corn.register();

corn.configure({
  formatters: {
    stepStart: (context, name) => `The cool step ${name}`,
    stepEnd: (context, name, duration) => `The cool step ${name} has been completed in ${context.duration(duration)}`,
  },
});

console.log(0);
console.log(1);
console.log(2);
```

Result

```bash
➤ 0000: ┌ The cool step Test
        │ 0
        │ 1
        │ 2
        └ The cool step Test has been completed in 0s 1ms
```

### Symbols

Example

```ts
const corn = require("cornsol");

corn.register();

corn.configure({
  symbols: {
    prefix: "$",
    singleLine: "*",
    newLine: "&",
    groupStart: "┳",
    groupLine: "┣",
    groupEnd: "┗",
  },
});

console.log(0);
console.log(1);
console.log(2);

console.group(0);
console.log(1);
console.log(2);
console.log(3);
console.groupEnd(4);
```

Result (small size terminal)

```bash
$ 0000: * 0
$ 0001: * 1
$ 0002: * 2
$ 0003: ┳ The cool step Test
        ┣ 0
        ┣ 1
        ┣ 2
        ┗ The cool step Test has been
          &  completed in 0s 1ms
```

## License

[MIT](./LICENSE)
