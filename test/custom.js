const cornsol = require("../dist");

cornsol.register();

console.log("This is an example for customizing");

// Line number
cornsol.configure({
  formatters: {
    // lineNumber: (context) => `${String(context.lineNo).padStart(2, "0")} [${new Date().toISOString()}]:`,
    stepStart: (context, name) => `The cool step ${name}`,
    stepEnd: (context, name, duration) => `The cool step ${name} has been completed in ${context.duration(duration)}`,
  },
});

printNumbers();

// Symbols
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

printNumbers();

function printNumbers() {
  for (let i = 0; i < 3; i++) {
    console.log(i);
  }

  cornsol.printGroupSync(() => {
    for (let i = 0; i < 3; i++) {
      console.log(i);
    }
  });

  cornsol.printStepSync("Test", () => {
    for (let i = 0; i < 3; i++) {
      console.log(i);
    }
  });

  cornsol.printStepSync("Test", () => {
    for (let i = 0; i < 3; i++) {
      console.log(new Array(30).join(i));
    }
  });
}
