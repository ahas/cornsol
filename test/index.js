const {
  printStep,
  printGroup,
  openPrintGroup,
  closePrintGroup,
  printStepSync,
  openPrintGroupSync,
  closePrintGroupSync,
  printGroupSync,
  configure,
  printArray,
  ...cornsol
} = require("../dist");

console.log("before register test");

cornsol.register();

console.log("after register test");
console.info("info test");
console.error("error test");
console.warn("warn test");
console.debug("debug test");

printStepSync("Sync Step test", () => {});
printStepSync("Sync Step test", () => {
  console.log("Sync step test");
});
printStepSync("Sync Step test", () => {
  console.log("Sync step test");
  console.log("Sync step test");
  console.log("Sync step test");
});
printStepSync("Sync Step test", () => {
  console.log("Sync step test");
  console.log("Sync step test");
  console.log("Sync step test");
  console.log("Sync step test");
  console.log("Sync step test");
});
openPrintGroupSync(() => console.log("Sync group test"));
closePrintGroupSync(() => console.log("Sync group test"));

openPrintGroupSync(() => console.log("Sync group test"));
console.log("Sync group test");
closePrintGroupSync(() => console.log("Sync group test"));

openPrintGroupSync(() => console.log("Sync group test"));
console.log("Sync group test");
console.log("Sync group test");
console.log("Sync group test");
closePrintGroupSync(() => console.log("Sync group test"));

printGroupSync(
  () => {
    console.log("Sync printGroup test");
  },
  () => console.log("1. Sync printGroup open test"),
  () => console.log("Sync printGroup close test"),
);
printGroupSync(
  () => {
    console.log("Sync printGroup test");
  },
  () => console.log("2. Sync printGroup open test"),
);

(async () => {
  console.log("single line test");

  await printStep("Step test", () => {});
  await printStep("Step test", () => {
    console.log("step test");
  });
  await printStep("Step test", () => {
    console.log("step test");
    console.log("step test");
    console.log("step test");
  });
  await printStep("Step test", () => {
    console.log("step test");
    console.log("step test");
    console.log("step test");
    console.log("step test");
    console.log("step test");
  });
  await openPrintGroup(() => console.log("group test"));
  await closePrintGroup(() => console.log("group test"));

  await openPrintGroup(() => console.log("group test"));
  console.log("group test");
  await closePrintGroup(() => console.log("group test"));

  await openPrintGroup(() => console.log("group test"));
  console.log("group test");
  console.log("group test");
  console.log("group test");
  await closePrintGroup(() => console.log("group test"));

  await printGroup(
    () => {
      console.log("printGroup test");
    },
    () => console.log("1. printGroup open test"),
    () => console.log("printGroup close test"),
  );
  await printGroup(
    () => {
      console.log("printGroup test");
    },
    () => console.log("2. printGroup open test"),
  );
  console.log(`New line Test ${new Array(process.stdout.columns * 3).join("0")}`);

  await printGroup(
    () => console.log(`New line Test ${new Array(process.stdout.columns * 3).join("0")}`),
    () => console.log(`New line Test ${new Array(process.stdout.columns * 3).join("0")}`),
    () => console.log(`New line Test ${new Array(process.stdout.columns * 3).join("0")}`),
  );

  await printArray(console.log, ["Item 1", "Item 2"]);

  console.log("Customize test");
  configure({
    symbols: {
      prefix: "p",
    },
  });
  console.log("Customize test");

  console.log("Customize line number");
  configure({
    formatters: { lineNumber: ({ lineNo }) => String(lineNo).padStart(5, "x") },
  });
  console.log("Customize test");
})();
