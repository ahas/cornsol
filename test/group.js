const cornsol = require("../dist");

cornsol.register();

console.log("This is an example for print group");

cornsol.printGroupSync(
  () => {
    console.log("content");
  },
  () => console.log("group start"),
  () => console.log("group end"),
);

// Open and close group manually
cornsol.openPrintGroupSync(() => console.log("group start"));
console.log("content");
cornsol.closePrintGroupSync(() => console.log("close group"));