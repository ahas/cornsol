import * as corn from "../dist";
import { exec } from "child_process";

corn.register();

corn.printDivider("color test");

console.log("Log");
console.info("Information");
console.error("Error message");
console.warn("Warning");
console.debug("Debugging");

corn.printDivider("printStep function test");

(async () => {
  await corn.printStep(
    "Processing",
    () =>
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

  const proc = exec("ls");
  proc.stdout?.on("data", (chunk) => {
    corn.printDivider("Print current directory files");
    corn.printBufferSync(console.log, chunk);
    corn.printDivider("done");
  });

  corn.printDivider("Depth test");
  corn.openPrintGroupSync(() => console.log("depth 1 -- open"));
  console.log("Group content 1");
  console.log("Group content 1");
  corn.openPrintGroupSync(() => console.log("depth 2 -- open"));
  console.log("Group content 2");
  console.log("Group content 2");
  console.log("Group content 2");
  corn.openPrintGroupSync(() => console.log("depth 3 -- open"));
  console.log("Group content 3");
  corn.openPrintGroupSync(() => console.log("depth 4 -- open"));
  console.log("Group content 4");
  corn.closePrintGroupSync(() => console.log("depth 4 -- close"));
  console.log("Group content 3");
  corn.closePrintGroupSync(() => console.log("depth 3 -- close"));
  console.log("Group content 2");
  console.log("Group content 2");
  corn.openPrintGroupSync(() => console.log("depth 3 -- open"));
  console.log("Group content 3");
  corn.closePrintGroupSync(() => console.log("depth 3 -- close"));
  console.log("Group content 2");
  corn.closePrintGroupSync(() => console.log("depth 2 -- close"));
  console.log("Group content 1");
  console.log("Group content 1");
  corn.closePrintGroupSync(() => console.log("depth 1 -- close"));
  corn.printDivider("Depth test -- done");
})();
