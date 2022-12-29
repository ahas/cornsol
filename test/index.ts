import * as corn from "../dist";
import { exec } from "child_process";

corn.register();

console.div("color test");

console.log("Log");
console.info("Information");
console.error("Error message");
console.warn("Warning");
console.debug("Debugging");
console.dir({ dir: 1 });
console.table({ a: 1, b: 2, c: 3 });
console.trace();

console.div("printStep function test");

(async () => {
  // Synchronous
  const result = console.step("Step title", () => {
    console.log("Process 1");
    console.log("Process 2");

    return 1;
  });
  console.log(result);

  await console.step.async(
    "Processing",
    new Promise<void>((resolve) => {
      let counter = 0;
      console.log("Processing - %d", counter++);

      const interval = setInterval(() => {
        console.log("Processing - %d", counter++);

        if (counter === 3) {
          clearInterval(interval);
          resolve();
        }
      }, 2000);
    })
  );

  const proc1 = exec("ls");
  proc1.stdout?.on("data", (chunk) => {
    console.div("Print current directory files");
    console.chunk(chunk);
    console.div("done");
  });

  // Print tree
  /**/ console.div("Depth test");
  /**/ console.group("depth 1");
  /*--*/ console.log("Group content 1");
  /*--*/ console.log("Group content 1");
  /*--*/ console.group("depth 2");
  /*----*/ console.log("Group content 2");
  /*----*/ console.log("Group content 2");
  /*----*/ console.log("Group content 2");
  /*----*/ console.group("depth 3");
  /*------*/ console.log("Group content 3");
  /*------*/ console.group("depth 4");
  /*--------*/ console.log("Group content 4");
  /*------*/ console.groupEnd("depth 4");
  /*------*/ console.log("Group content 3");
  /*----*/ console.groupEnd("depth 3");
  /*----*/ console.log("Group content 2");
  /*----*/ console.log("Group content 2");
  /*----*/ console.group("depth 3");
  /*------*/ console.log("Group content 3");
  /*----*/ console.groupEnd("depth 3");
  /*----*/ console.log("Group content 2");
  /*--*/ console.groupEnd("depth 2");
  /*--*/ console.log("Group content 1");
  /*--*/ console.log("Group content 1");
  /**/ console.groupEnd("depth 1");
  /**/ console.div("Depth test -- done");

  // Print error
  console.log(new Error("Unexpected error").stack);
  console.log(undefined);

  // Print array
  console.array([1, 2, 3]);
  console.array.async([1, (async () => 2)(), (async () => 3)()]);
})();
