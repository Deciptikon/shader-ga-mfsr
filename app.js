import GeneticAlgorithm from "./GeneticAtgotithm.js";
import MultiImage from "./MultiImage.js";
import { calculateSSD } from "./Shaders.js";
import TwoImage from "./TwoImage.js";

console.log("twoGA");
const twoGA = new GeneticAlgorithm({
  populationSize: 10,
  mutationRate: 0.1,
  crossoverRate: 0.8,
  TClass: TwoImage,
});

twoGA.initializePopulation();

twoGA.run(100, { x: 7, y: 17 }, (result) => {
  console.log(result);
});

//--------------
console.log("multiGA");
const multiGA = new GeneticAlgorithm({
  populationSize: 10,
  mutationRate: 0.1,
  crossoverRate: 0.8,
  TClass: MultiImage,
});

multiGA.initializePopulation();

multiGA.run(1000, { x: 7, y: 17, z: -5.66666 }, (result) => {
  console.log(result);
});

// Создаем виртуальные тестовые изображения
function createTestImage(width, height, color) {
  const image = [];
  for (let x = 0; x < width; x++) {
    image[x] = [];
    for (let y = 0; y < height; y++) {
      image[x][y] = [...color]; // [R, G, B] в диапазоне 0-1
    }
  }
  return image;
}

// Параметры изображений
const width = 10; // Маленький размер для теста
const height = 10;

// Тестовые изображения
const imageA = createTestImage(width, height, [1.0, 0.0, 0.0]); // Красный
const imageB = createTestImage(width, height, [0.9, 0.1, 0.1]); // Почти красный

// Тестируем
console.log("Тест 1: Одинаковые изображения");
const ssd1 = calculateSSD(imageA, imageA, width, height);
console.log("SSD:", ssd1); // Должно быть ~0

console.log("\nТест 2: Похожие изображения");
const ssd2 = calculateSSD(imageA, imageB, width, height);
console.log("SSD:", ssd2); // Должно быть маленькое значение

console.log("\nТест 3: Совсем разные изображения");
const imageC = createTestImage(width, height, [0.0, 0.0, 1.0]); // Синий
const ssd3 = calculateSSD(imageA, imageC, width, height);
console.log("SSD:", ssd3); // Должно быть большое значение

// Проверяем вручную для одного пикселя
console.log("\nПроверка вручную для одного пикселя:");
const manualDiffR = (1.0 - 0.9) ** 2; // (1.0 - 0.9)^2 = 0.01
const manualDiffG = (0.0 - 0.1) ** 2; // (0.0 - 0.1)^2 = 0.01
const manualDiffB = (0.0 - 0.1) ** 2; // (0.0 - 0.1)^2 = 0.01
console.log(
  "Ожидаемая разница на пиксель:",
  manualDiffR + manualDiffG + manualDiffB
);
console.log(
  "Ожидаемая общая SSD:",
  (manualDiffR + manualDiffG + manualDiffB) * width * height
);
