console.log("1. Hello");
console.log("2. Hello");
process.stdout.write("3. Hello");

setTimeout(() => {
  process.stdout.write("\n");
  process.stdout.moveCursor(0, -1);
  process.stdout.clearLine(0);

  process.stdout.moveCursor(0, -1);
  process.stdout.clearLine(0);
}, 1000);
