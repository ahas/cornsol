# Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Cautions](#cautions)
- [Usage](#usage)
  - [Register globally](#register-globally)
  - [Print group](#print-group)
  - [Print array](#print-array)
  - [Print buffer](#print-buffer)
- [Customize](#customize)
  - [Spinners](#spinners)
  - [Line numbers](#line-numbers)
  - [Step messages](#step-messages)
  - [Symbols](#symbols)

# Introduction

🌽☀
Pretty formatted numbered customizable JavaScript console library.

# Installation

```bash
npm install cornsol
# or
yarn add cornsol
```

# Cautions

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

# Usage

## Register globally

1. JavaScript

```ts
const cornsol = require("cornsol");

cornsol.register();
```

2. TypeScript

```ts
import * as cornsol from "cornsol";

cornsol.register();
```

## Print group

Example

```js
const cornsol = require("cornsol");

cornsol.register();

console.log("This is an example for print group");

cornsol.printGroupSync(
  () => {
    console.log("content");
  },
  () => console.log("group start"),
  () => console.log("group end")
);

// Open and close the group manually
cornsol.openPrintGroupSync(() => console.log("group start"));
console.log("content");
cornsol.closePrintGroupSync(() => console.log("close group"));
```

Result

```bash
➤ 0000: ─ This is an example for print group
➤ 0001: ┬ group start
        │ content
        └ group end
➤ 0002: ┬ group start
        │ content
        └ close group
```

## Print array

Example

```ts
const cornsol = require("cornsol");

cornsol.register();

cornsol.printArray(console.log, ["Item 1", "Item 2"]);
```

Result

```bash
➤ 0000: ┬ Item 1
        └ Item 2
```

## Print buffer

Example

```ts
const { printBuffer } = require("cornsol");
const { exec } = require("child_process");

const proc = exec("process_path");

proc.stdout.on("data", (chunk) => printBuffer(console.log, chunk));
```

# Customize

`cornsol` supports customizing.

### Spinners

`cornsol` use ASCII spinners on group print.

There are some presets for spinner.

```ts
// Built-in presets
export const spinners = [
  "⣾⣽⣻⢿⡿⣟⣯⣷",
  "←↖↑↗→↘↓↙",
  "⠁⠂⠄⡀⢀⠠⠐⠈",
  "▉▊▋▌▍▎▏▎▍▌▋▊▉",
  "▁▂▃▄▅▆▇█▇▆▅▄▃▁",
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

// Update config
cornsol.configure({
  spinner: {
    symbols: cornsol.spinners[4], // "▁▂▃▄▅▆▇█▇▆▅▄▃▁"
  },
});
```

### Line numbers

Example

```ts
const cornsol = require("../dist");

cornsol.register();

console.log("This is an example for customizing");

cornsol.configure({
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
const cornsol = require("../dist");

cornsol.register();

cornsol.configure({
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
➤ 0000: ┬ The cool step Test
        │ 0
        │ 1
        │ 2
        └ The cool step Test has been completed in 0s 1ms
```

### Symbols

Example

```ts
const cornsol = require("../dist");

cornsol.register();

cornsol.configure({
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

cornsol.printGroupSync(
  () => {
    console.log(1);
    console.log(2);
    console.log(3);
  },
  () => console.log(0),
  () => console.log(4)
);
```

Result

```bash
$ 0000: * 0
$ 0001: * 1
$ 0002: * 2
$ 0003: ┳ 0
        ┣ 1
        ┣ 2
        ┣ 3
        ┗ 4
```
