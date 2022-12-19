# Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Cautions](#cautions)
- [Usage](#usage)
  - [Register globally](#register-globally)
  - [Print group](#print-group)
  - [Print array](#print-array)
  - [Print buffer](#print-buffer)

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
  () => console.log("group end"),
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
