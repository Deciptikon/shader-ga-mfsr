export function showImage(imageArray, canvasElement) {
  const ctx = canvasElement.getContext("2d");
  const width = imageArray.length;
  const height = imageArray[0].length;
  canvasElement.width = width;
  canvasElement.height = height;

  const imageData = ctx.createImageData(width, height);

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const index = (y * width + x) * 4;
      const pixel = imageArray[x][y];
      imageData.data[index] = pixel[0] * 255;
      imageData.data[index + 1] = pixel[1] * 255;
      imageData.data[index + 2] = pixel[2] * 255;
      imageData.data[index + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

export function imageToArray(img) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, img.width, img.height);
  const array = [];

  for (let x = 0; x < img.width; x++) {
    array[x] = [];
    for (let y = 0; y < img.height; y++) {
      const index = (y * img.width + x) * 4;
      array[x][y] = [
        imageData.data[index] / 255, //     R 0-1
        imageData.data[index + 1] / 255, // G 0-1
        imageData.data[index + 2] / 255, // B 0-1
      ];
    }
  }

  return array;
}

export function loadImg(listURLs, onload) {
  const images = [];
  let loadedCount = 0;

  listURLs.forEach((url, index) => {
    const img = new Image();
    img.onload = () => {
      images[index] = img;
      loadedCount++;
      if (loadedCount === listURLs.length) {
        onload(images);
      }
    };
    img.src = url;
  });
}

export function randomImage(width, height) {
  const array = [];

  for (let x = 0; x < width; x++) {
    array[x] = [];
    for (let y = 0; y < height; y++) {
      // Генерируем случайные значения для RGB в диапазоне [0, 1]
      array[x][y] = [
        Math.random(), // R
        Math.random(), // G
        Math.random(), // B
      ];
    }
  }

  return array;
}
