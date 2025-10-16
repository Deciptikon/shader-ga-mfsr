const gpu = new GPU.GPU();

// Функция для создания ядра с конкретными размерами
function createSquaredDiffKernel(width, height) {
  return gpu
    .createKernel(function (imageA, imageB) {
      const x = this.thread.x;
      const y = this.thread.y;

      const rA = imageA[x][y][0];
      const gA = imageA[x][y][1];
      const bA = imageA[x][y][2];

      const rB = imageB[x][y][0];
      const gB = imageB[x][y][1];
      const bB = imageB[x][y][2];

      const diffR = rA - rB;
      const diffG = gA - gB;
      const diffB = bA - bB;

      return [diffR * diffR, diffG * diffG, diffB * diffB];
    })
    .setOutput([width, height]);
}

// Функция для вычисления SSD
export function calculateSSD(imageA, imageB, width, height) {
  const kernel = createSquaredDiffKernel(width, height);
  const squaredDiffs = kernel(imageA, imageB);

  let total = 0;
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const [r, g, b] = squaredDiffs[x][y];
      total += r + g + b;
    }
  }
  return total;
}

// Уменьшение разрешения изображения
function createDownscaleKernel(scaleFactor) {
  return gpu
    .createKernel(function (image) {
      const resultX = this.thread.x;
      const resultY = this.thread.y;

      let sumR = 0,
        sumG = 0,
        sumB = 0;
      const startX = resultX * scaleFactor;
      const startY = resultY * scaleFactor;

      // Суммируем блок scaleFactor x scaleFactor из оригинала
      for (let x = startX; x < startX + scaleFactor; x++) {
        for (let y = startY; y < startY + scaleFactor; y++) {
          const pixel = image[x][y];
          sumR += pixel[0];
          sumG += pixel[1];
          sumB += pixel[2];
        }
      }

      const pixelsCount = scaleFactor * scaleFactor;
      return [sumR / pixelsCount, sumG / pixelsCount, sumB / pixelsCount];
    })
    .setOutput([width / scaleFactor, height / scaleFactor]); // Выходные размеры
}

export function downscale(imageArray, scaleFactor = 2) {
  const width = imageArray.length;
  const height = imageArray[0].length;
  const downscaleKernel = createDownscaleKernel(scaleFactor).setOutput([
    width / scaleFactor,
    height / scaleFactor,
  ]);
  const smallImage = downscaleKernel(imageArray);
  return smallImage;
}

// Увеличение разрешения изображения
function createUpscaleKernel(scaleFactor, originalWidth, originalHeight) {
  return gpu
    .createKernel(function (image) {
      // this.thread.x и y - это координаты в УВЕЛИЧЕННОМ изображении
      const origX = Math.floor(this.thread.x / scaleFactor);
      const origY = Math.floor(this.thread.y / scaleFactor);

      const pixel = image[origX][origY];
      return [pixel[0], pixel[1], pixel[2]];
    })
    .setOutput([originalWidth * scaleFactor, originalHeight * scaleFactor]);
}

export function upscale(imageArray, scaleFactor = 2) {
  const width = imageArray.length;
  const height = imageArray[0].length;
  const upscaleKernel = createUpscaleKernel(scaleFactor).setOutput([
    width * scaleFactor,
    height * scaleFactor,
  ]);
  const bigImage = upscaleKernel(imageArray);
  return bigImage;
}

// Сдвиг изображения
function createShiftKernel(width, height, sx, sy) {
  return gpu
    .createKernel(function (image) {
      const origX = this.thread.x - this.constants.sx;
      const origY = this.thread.y - this.constants.sy;

      if (
        origX >= 0 &&
        origX < this.constants.width &&
        origY >= 0 &&
        origY < this.constants.height
      ) {
        return image[origX][origY];
      }

      return [0, 0, 0];
    })
    .setOutput([width, height])
    .setConstants({
      width: width,
      height: height,
      sx: sx,
      sy: sy,
    });
}

export function shift(imageArray, sx, sy) {
  const width = imageArray.length;
  const height = imageArray[0].length;
  const shiftKernel = createShiftKernel(width, height, sx, sy).setOutput([
    width,
    height,
  ]);
  const shiftImage = shiftKernel(imageArray);
  return shiftImage;
}

// Вырезание области
function createCropKernel(cropX, cropY, cropWidth, cropHeight) {
  return gpu
    .createKernel(function (image) {
      const origX = this.thread.x + this.constants.cropX;
      const origY = this.thread.y + this.constants.cropY;

      return image[origX][origY];
    })
    .setOutput([cropWidth, cropHeight])
    .setConstants({
      cropX: cropX,
      cropY: cropY,
    });
}

export function crop(imageArray, cropX, cropY, cropWidth, cropHeight) {
  const cropKernel = createCropKernel(
    cropX,
    cropY,
    cropWidth,
    cropHeight
  ).setOutput([cropWidth, cropHeight]);
  const cropImage = cropKernel(imageArray);
  return cropImage;
}
