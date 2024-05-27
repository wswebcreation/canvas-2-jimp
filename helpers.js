import { appendFileSync, readdirSync, statSync } from "fs";
import { extname, join } from "path";

export function readPngsFromFolder({ mainDir }) {
  const subDirs = readdirSync(mainDir);
  const images = [];

  subDirs.forEach((subDir) => {
    const subDirPath = join(mainDir, subDir);
    if (statSync(subDirPath).isDirectory()) {
      const files = readdirSync(subDirPath);
      files.forEach((file) => {
        const filePath = join(subDirPath, file);
        if (statSync(filePath).isFile() && extname(file) === ".png") {
          images.push(join(mainDir, subDir, file));
        }
      });
    }
  });

  return images;
}

export function printElapsedTime(startTime) {
  const diff = process.hrtime(startTime);
  const elapsed = (diff[0] * 1e9 + diff[1]) / 1e6;
  const minutes = Math.floor(elapsed / 60000)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor((elapsed % 60000) / 1000)
    .toString()
    .padStart(2, "0");
  const milliseconds = Math.floor(elapsed % 1000)
    .toString()
    .padStart(3, "0");
  console.log(`\n\nElapsed time: ${minutes}:${seconds}:${milliseconds}`);
}

export function logToFile(path, message) {
  console.log(message);
  appendFileSync(path, message + "\n");
}
