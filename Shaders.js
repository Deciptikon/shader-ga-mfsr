const gpu = new GPU.GPU();

// Функция для создания ядра с конкретными размерами
export function createSquaredDiffKernel(width, height) {
  return gpu
    .createKernel(function (imageA, imageB) {
      const x = this.thread.x;
      const y = this.thread.y;

      const rA = imageA[y][x][0];
      const gA = imageA[y][x][1];
      const bA = imageA[y][x][2];

      const rB = imageB[y][x][0];
      const gB = imageB[y][x][1];
      const bB = imageB[y][x][2];

      const diffR = rA - rB;
      const diffG = gA - gB;
      const diffB = bA - bB;

      return [diffR * diffR, diffG * diffG, diffB * diffB];
    })
    .setOutput([width, height]);
}

// Функция для вычисления SSD
export function calculateSSD(imageA, imageB) {
  const width = imageA.length;
  const height = imageA[0].length;
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

export function calculateSSDKer(imageA, imageB, kernel) {
  const squaredDiffs = kernel(imageA, imageB);

  let total = 0;
  for (let x = 0; x < squaredDiffs.length; x++) {
    const row = squaredDiffs[x];

    if (!row) continue;

    for (let y = 0; y < row.length; y++) {
      const pixel = row[y];
      if (pixel) {
        const [r, g, b] = pixel;
        total += r + g + b;
      }
    }
  }
  return total;
}

// Уменьшение разрешения изображения
export function createDownscaleKernel(width, height, scale) {
  return gpu
    .createKernel(function (image) {
      const resultX = this.thread.x;
      const resultY = this.thread.y;
      const scale = this.constants.scale;
      const count = this.constants.count;

      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      const startX = Math.floor(resultX * scale);
      const startY = Math.floor(resultY * scale);

      // Суммируем блок scale x scale из оригинала
      if (scale < 16) {
        for (let i = 0; i < scale; i++) {
          for (let j = 0; j < scale; j++) {
            const x = startX + j;
            const y = startY + i;
            sumR += image[y][x][0] / count;
            sumG += image[y][x][1] / count;
            sumB += image[y][x][2] / count;
          }
        }
        return [sumR, sumG, sumB];
      } else {
        for (let i = 0; i < scale; i++) {
          for (let j = 0; j < scale; j++) {
            const x = startX + j;
            const y = startY + i;
            sumR += image[y][x][0];
            sumG += image[y][x][1];
            sumB += image[y][x][2];
          }
        }
        return [sumR / count, sumG / count, sumB / count];
      }
    })
    .setOutput([Math.floor(width / scale), Math.floor(height / scale)])
    .setConstants({
      scale: scale,
      count: scale * scale,
    });
}

export function downscale(imageArray, scale = 2) {
  const width = imageArray.length;
  const height = imageArray[0].length;
  const downscaleKernel = createDownscaleKernel(width, height, scale);
  const smallImage = downscaleKernel(imageArray);
  return smallImage;
}

export function downscaleKer(imageArray, downscaleKernel) {
  const smallImage = downscaleKernel(imageArray);
  return smallImage;
}

//---------------------------------------------------------------
// Функция для создания ядра с конкретными размерами
export function createUpscaleKernel(width, height, scale) {
  return gpu
    .createKernel(function (image) {
      const x = Math.floor(this.thread.x / this.constants.scale);
      const y = Math.floor(this.thread.y / this.constants.scale);

      const r = image[y][x][0];
      const g = image[y][x][1];
      const b = image[y][x][2];

      return [r, g, b];
    })
    .setOutput([Math.floor(width * scale), Math.floor(height * scale)])
    .setConstants({
      scale: scale,
    });
}

export function upscale(imageArray, scale) {
  console.log("upscale");

  const width = imageArray.length;
  const height = imageArray[0].length;
  const kernel = createUpscaleKernel(width, height, scale);
  const rez = kernel(imageArray);

  return rez;
}

export function upscaleKer(imageArray, kernel) {
  const rez = kernel(imageArray);

  return rez;
}
//---------------------------------------------------------------

// Сдвиг изображения
export function createShiftKernel(width, height) {
  return gpu
    .createKernel(function (image, sx, sy) {
      const x = this.thread.x - sx;
      const y = this.thread.y - sy;

      if (
        x >= 0 &&
        x < this.constants.width &&
        y >= 0 &&
        y < this.constants.height
      ) {
        const r = image[y][x][0];
        const g = image[y][x][1];
        const b = image[y][x][2];
        return [r, g, b];
      }

      return [0, 0, 0];
    })
    .setOutput([width, height])
    .setConstants({
      width: width,
      height: height,
    });
}

export function shift(imageArray, sx, sy) {
  const width = imageArray.length;
  const height = imageArray[0].length;
  const shiftKernel = createShiftKernel(width, height);
  const shiftImage = shiftKernel(imageArray, sx, sy);
  return shiftImage;
}

export function shiftKer(imageArray, sx, sy, shiftKernel) {
  const shiftImage = shiftKernel(imageArray, sx, sy);
  return shiftImage;
}

// Вырезание области
export function createCropKernel(
  cropWidth,
  cropHeight,
  originalWidth,
  originalHeight
) {
  return gpu
    .createKernel(function (image, cropX, cropY) {
      const x = this.thread.x + cropX;
      const y = this.thread.y + cropY;

      // Проверка границ для безопасности
      if (
        x >= 0 &&
        x < this.constants.originalWidth &&
        y >= 0 &&
        y < this.constants.originalHeight
      ) {
        const r = image[y][x][0];
        const g = image[y][x][1];
        const b = image[y][x][2];
        return [r, g, b];
      }
      return [0, 0, 0];
    })
    .setOutput([cropWidth, cropHeight])
    .setConstants({
      originalWidth: originalWidth,
      originalHeight: originalHeight,
    });
}

export function crop(imageArray, cropX, cropY, cropWidth, cropHeight) {
  const originalWidth = imageArray.length;
  const originalHeight = imageArray[0].length;
  const cropKernel = createCropKernel(
    cropWidth,
    cropHeight,
    originalWidth,
    originalHeight
  );
  const cropImage = cropKernel(imageArray, cropX, cropY);
  return cropImage;
}

export function cropKer(imageArray, cropX, cropY, cropKernel) {
  const cropImage = cropKernel(imageArray, cropX, cropY);
  return cropImage;
}

export function compileKernels(width, height, scale, padding) {
  const minWidth = width * scale,
    minHeight = height * scale,
    maxWidth = (width + 2) * scale,
    maxHeight = (height + 2) * scale;

  return {
    shift: createShiftKernel(width * scale, height * scale), //big
    ssd: createSquaredDiffKernel(width * scale, height * scale),
    crop: null,
    upscale: createUpscaleKernel(width, height, scale),
    downscale: createDownscaleKernel(width * scale, height * scale, scale),
  };

  return {
    shift: createShiftKernel(maxWidth, maxHeight),
    ssd: createSquaredDiffKernel(minWidth, minHeight),
    crop: createCropKernel(minWidth, minHeight, maxWidth, maxHeight),
    upscale: createUpscaleKernel(width, height, scale),
    downscale: createDownscaleKernel(minWidth, minHeight, scale),
  };
}
