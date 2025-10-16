export function showImage(imageArray, container, canvasId = "preview") {
  let canvas = document.getElementById(canvasId);

  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = canvasId;
    container.appendChild(canvas);
  }

  const ctx = canvas.getContext("2d");
  const width = imageArray.length;
  const height = imageArray[0].length;
  canvas.width = width;
  canvas.height = height;

  const imageData = ctx.createImageData(width, height);

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const index = (y * width + x) * 4;
      const pixel = imageArray[x][y];
      imageData.data[index] = pixel[0] * 255; // R
      imageData.data[index + 1] = pixel[1] * 255; // G
      imageData.data[index + 2] = pixel[2] * 255; // B
      imageData.data[index + 3] = 255; // A
    }
  }

  ctx.putImageData(imageData, 0, 0);
  container.appendChild(canvas);
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
        imageData.data[index] / 255, // R 0-1
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
