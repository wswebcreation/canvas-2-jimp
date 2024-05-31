const async = require("async");
const resemble = require("resemble-jimp");
const fs = require("fs");

// let spinner;
const logFilePath = "run.jimp.txt";

const loadOra = async () => {
  const oraModule = await import("ora");
  return oraModule.default;
};
const loadHelpers = async () => {
  const helpersModule = await import("./helpers.js");
  return helpersModule;
};

const readImagesFromDirectory = async (directoryPath) => {
  const { readPngsFromFolder } = await loadHelpers();
  return readPngsFromFolder({ mainDir: directoryPath });
};

const compareImages = (image1, image2) => {
  // console.log("start compareImages");
  // console.log("image1 = ", image1);
  // console.log("image2 = ", image2);

  return new Promise((resolve, reject) => {
    resemble(image1)
      .compareTo(image2)
      .onComplete((data) => {
        // console.log("onComplete data = ", data);
        if (data) {
          // console.log("Comparison complete, data: ", data);
          resolve(data);
        } else {
          console.error("Comparison failed");
          reject(new Error("Comparison failed"));
        }
      });
  });
};

const performPerformanceTest = async (images, concurrency) => {
  let processedCount = 0;
  let failedCount = 0;
  const { logToFile } = await loadHelpers();

  const queue = async.queue(async (task) => {
    try {
      const actualPath = task;
      const baselinePath = actualPath.replace("actual", "baseline");

      if (!fs.existsSync(baselinePath)) {
        throw new Error(`Baseline image not found for ${actualPath}`);
      }

      const result = await compareImages(actualPath, baselinePath);
      // console.log("result = ", result);
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
      // spinner.stop();
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
  const { logToFile } = await loadHelpers();
  const images = await readImagesFromDirectory(imagesDirectory);
  // const images = [
  //   "./images/actual/android_googleapi_emulator/fullPage-EmulatorAndroidGoogleAPILandscapeChromeDriver10.0-640x384.png",
  // ];
  logToFile(
    logFilePath,
    `\nFound ${images.length} images. Starting performance test with concurrency level ${concurrency}.`
  );
  // const ora = await loadOra();
  // spinner = ora("Processing images...").start();
  const startTime = Date.now();
  try {
    await performPerformanceTest(images, concurrency);
  } catch (error) {
    console.error(error);
  }
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  logToFile(logFilePath, "Done Processing images");
  logToFile(logFilePath, `Performance test completed in ${duration} seconds.`);
};

main();
