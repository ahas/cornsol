const cornsol = require("../dist");

cornsol.register();

(async () => {
  cornsol.printGroup(
    () =>
      new Promise((resolve) => {
        console.log("Spinning ~");
        console.log("Spinning ~");
        console.log("Spinning ~");
        console.log("Spinning ~");
        setTimeout(resolve, 5000);
      }),
    () => console.log("header"),
    () => console.log("footer"),
  );
})();
