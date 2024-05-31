const Jimp = require("jimp");

class CanvasWrapper {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.image = new Jimp(width, height);
    // console.log("CanvasWrapper created:", { width, height });
  }

  getContext(type) {
    if (type === "2d") {
      return new Context2D(this.image);
    }
    throw new Error("Only 2d context is supported");
  }

  async toDataURL() {
    // console.log("Converting canvas to data URL");
    return await this.image.getBase64Async(Jimp.MIME_PNG);
  }

  toBuffer(callback) {
    // console.log("Converting canvas to buffer");
    this.image.getBuffer(Jimp.MIME_PNG, callback);
  }
}

class Context2D {
  constructor(image) {
    this.image = image;
    // console.log("Context2D created");
  }

  drawImage(image, ...args) {
    // console.log("Drawing image with args:", args);
    if (args.length === 8) {
      const [sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight] = args;
      const cropped = image.image.clone().crop(sx, sy, sWidth, sHeight);
      cropped.resize(dWidth, dHeight);
      this.image.composite(cropped, dx, dy);
    } else {
      const [dx, dy] = args;
      this.image.composite(image.image, dx, dy);
    }
  }

  getImageData(sx, sy, sw, sh) {
    // console.log("Getting image data", { sx, sy, sw, sh });
    const croppedImage = this.image.clone().crop(sx, sy, sw, sh);
    return {
      data: croppedImage.bitmap.data,
      width: croppedImage.bitmap.width,
      height: croppedImage.bitmap.height,
    };
  }

  putImageData(imageData, dx, dy) {
    // console.log("Putting image data", { dx, dy });
    const img = new Jimp(imageData.width, imageData.height);
    img.bitmap.data = imageData.data;
    this.image.composite(img, dx, dy);
  }

  clearRect(x, y, width, height) {
    // console.log("Clearing rect", { x, y, width, height });
    const clearColor = new Jimp(width, height, 0x00000000);
    this.image.composite(clearColor, x, y);
  }

  fillRect(x, y, width, height) {
    // console.log("Filling rect", { x, y, width, height });
    const fillColor = new Jimp(width, height, 0xffffffff);
    this.image.composite(fillColor, x, y);
  }

  createImageData(width, height) {
    // console.log("Creating image data", { width, height });
    const imageData = new Jimp(width, height);
    return {
      data: imageData.bitmap.data,
      width: imageData.bitmap.width,
      height: imageData.bitmap.height,
    };
  }
}

class ImageWrapper {
  constructor() {
    this.image = null;
    this.onload = null;
    this.onerror = null;
  }

  async load(src) {
    // console.log("Loading image", src);
    try {
      this.image = await Jimp.read(src);
      // console.log("Image loaded successfully", src);
      if (this.onload) {
        this.onload(); // Trigger the onload event
      }
    } catch (err) {
      // console.error("Error loading image", src, err);
      if (this.onerror) {
        this.onerror(err); // Trigger the onerror event
      }
    }
    return this;
  }

  set src(src) {
    this.load(src);
  }

  get width() {
    if (this.image) {
      return this.image.bitmap.width;
    } else {
      // console.error("Attempting to access width before image is loaded");
      return 0;
    }
  }

  get height() {
    if (this.image) {
      return this.image.bitmap.height;
    } else {
      console.error("Attempting to access height before image is loaded");
      return 0;
    }
  }
}

module.exports = {
  CanvasWrapper,
  ImageWrapper,
};
