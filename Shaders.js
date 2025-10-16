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
