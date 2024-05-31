import async from "async";
import resemble from "resemblejs";
import ora from "ora";
import { logToFile, readPngsFromFolder } from "./helpers.js";
import fs from "fs";

let spinner;
const logFilePath = "run.canvas.txt";

const readImagesFromDirectory = (directoryPath) => {
  return readPngsFromFolder({ mainDir: directoryPath });
};

const compareImages = (image1, image2) => {
  return new Promise((resolve, reject) => {
    resemble(image1)
      .compareTo(image2)
      .onComplete((data) => {
        if (data) resolve(data);
        else reject(new Error("Comparison failed"));
      });
  });
};

const performPerformanceTest = async (images, concurrency) => {
  let processedCount = 0;
  let failedCount = 0;

  const queue = async.queue(async (task) => {
    try {
      const actualPath = task;
      const baselinePath = actualPath.replace("actual", "baseline");

      if (!fs.existsSync(baselinePath)) {
        throw new Error(`Baseline image not found for ${actualPath}`);
      }

      const result = await compareImages(actualPath, baselinePath);
      processedCount++;
    } catch (error) {
      failedCount++;
      logToFile(logFilePath, `Error comparing ${task}: ${error.message}`);
    }
  }, concurrency);

  images.forEach((imagePath) => {
    queue.push(imagePath);
  });

  return new Promise((resolve) => {
    queue.drain(() => {
      spinner.stop();
      logToFile(
        logFilePath,
        `All image comparisons are done. 
Processed: ${processedCount}, 
Failed: ${failedCount}`
      );
      resolve();
    });
  });
};

const main = async () => {
  const imagesDirectory = "./images/actual";
  const concurrency = 10;
  const images = readImagesFromDirectory(imagesDirectory);
  // const images = [
  //   "./images/actual/android_googleapi_emulator/fullPage-EmulatorAndroidGoogleAPILandscapeChromeDriver10.0-640x384.png",
  // ];
  logToFile(
    logFilePath,
    `\nFound ${images.length} images. Starting performance test with concurrency level ${concurrency}.`
  );
  spinner = ora("Processing images...").start();
  const startTime = Date.now();
  await performPerformanceTest(images, concurrency);
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  logToFile(logFilePath, "Done Processing images");
  logToFile(logFilePath, `Performance test completed in ${duration} seconds.`);
};

main();
