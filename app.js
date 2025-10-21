import GeneticAlgorithm from "./GeneticAtgotithm.js";
import { imageToArray, loadImg, showImage } from "./Image.js";
import {
  calculateSSDKer,
  compileKernels,
  cropKer,
  shiftKer,
  upscaleKer,
} from "./Shaders.js";
import TwoImage from "./TwoImage.js";
import MultiImage from "./MultiImage.js";

const listURLImg = ["./images/img0.png", "./images/img1.png"];
let listImg = [];

const SCALE = 4;

loadImg(listURLImg, (images) => {
  images.forEach((img) => {
    listImg.push(imageToArray(img));
  });

  const w = listImg[0][0].length;
  const h = listImg[0].length;

  const KERNELS = compileKernels(w, h, SCALE);

  showImage(listImg[0], document.body);
  console.log("w=", listImg[0][0].length, "h=", listImg[0].length);

  //const sc0 = cropKer(listImg[0], 7, 7, KERNELS.crop);
  //console.log("w=", sc0[0].length, "h=", sc0.length);
  //showImage(sc0, document.body);

  const data = {
    baseImg: upscaleKer(listImg[0], KERNELS.upscale),
    secondImg: upscaleKer(listImg[1], KERNELS.upscale),
  };

  showImage(data.baseImg, document.body);
  console.log("baseImg");

  //const shiftImg = shiftKer(data.secondImg, -10, -20, KERNELS.shift);
  //showImage(shiftImg, document.body);
  //console.log(KERNELS.shift);

  //const difff = calculateSSDKer(data.baseImg, shiftImg, KERNELS.ssd);
  //console.log("SSD=", difff);

  setTimeout(() => {
    console.log("twoGA");
    const twoGA = new GeneticAlgorithm({
      populationSize: 10,
      mutationRate: 1.0,
      crossoverRate: 1.0,
      TClass: TwoImage,
    });

    twoGA.initializePopulation(30);

    const rez = twoGA.run(25, data, KERNELS, (result) => {
      console.log(result);
    });

    const { x, y } = rez.genes;
    console.log("shiftImg", x, y);
    const shiftImg = shiftKer(data.secondImg, -x, -y, KERNELS.shift);
    showImage(shiftImg, document.body);
  }, 1000);

  //--------------
});

//console.log(img0);

/** 
console.log("multiGA");
const multiGA = new GeneticAlgorithm({
  populationSize: 10,
  mutationRate: 0.1,
  crossoverRate: 0.8,
  TClass: MultiImage,
});

multiGA.initializePopulation();

multiGA.run(10, { x: 7, y: 17, z: -5.66666 }, (result) => {
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
const ssd1 = calculateSSD(imageA, imageA);
console.log("SSD:", ssd1); // Должно быть ~0

console.log("\nТест 2: Похожие изображения");
const ssd2 = calculateSSD(imageA, imageB);
console.log("SSD:", ssd2); // Должно быть маленькое значение

console.log("\nТест 3: Совсем разные изображения");
const imageC = createTestImage(width, height, [0.0, 0.0, 1.0]); // Синий
const ssd3 = calculateSSD(imageA, imageC);
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
*/
