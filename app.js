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

let uploadedImages = [];
let pos = {
  x: 100,
  y: 100,
};
let delta = {
  x: 0,
  y: 0,
};

let isDragging = false;
let lastX, lastY;
let offsetX = 0,
  offsetY = 0;

let listImg = [];
const SCALE = 4;

let STATE = "load";
let needUpdate = true;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
setupCanvas();

const W = canvas.width;
const H = canvas.height;
console.log(W, H);

const numSizeInput = document.getElementById("numSize");
const numScaleInput = document.getElementById("numScale");
const numPreviewScale = document.getElementById("numPreviewScale");

let previewScale = parseInt(numPreviewScale.textContent);

let w = 10;
let h = 10;
let k = 0;

startUpdateLoop();

function startUpdateLoop() {
  const interval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (STATE === "load") {
      step_load();
    } else {
      step_process();
    }
  }, 100);
}

function step_load() {
  console.log("step_load()");
  const numSizeValue = parseInt(numSizeInput.value);
  const numScaleValue = parseInt(numScaleInput.value); // получить значение
  //console.log("numSizeValue  =", numSizeValue);
  //console.log("numScaleValue =", numScaleValue);

  if (needUpdate) {
    //drawRect();
    if (uploadedImages.length > 0) {
      const image = uploadedImages[k % uploadedImages.length];

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        image,
        0,
        0,
        image.width,
        image.height,
        W / 2 - (image.width / 2 + pos.x - offsetX) * previewScale,
        H / 2 - (image.height / 2 + pos.y - offsetY) * previewScale,
        image.width * previewScale,
        image.height * previewScale
      );

      drawRect(
        W / 2,
        H / 2,
        2 * numSizeValue * previewScale,
        2 * numSizeValue * previewScale
      );
      k++;
    }
  }
}

function drawRect(x, y, w, h) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#ff0000";
  ctx.strokeRect(x - w / 2, y - h / 2, w, h);
}

function step_process() {
  console.log("step_process()");
}

loadImg(listURLImg, (images) => {
  images.forEach((img) => {
    listImg.push(imageToArray(img));
  });

  const w = listImg[0][0].length;
  const h = listImg[0].length;

  const KERNELS = compileKernels(w, h, SCALE);

  //showImage(listImg[0], document.body);
  //console.log("w=", listImg[0][0].length, "h=", listImg[0].length);

  //const sc0 = cropKer(listImg[0], 7, 7, KERNELS.crop);
  //console.log("w=", sc0[0].length, "h=", sc0.length);
  //showImage(sc0, document.body);

  const data = {
    baseImg: upscaleKer(listImg[0], KERNELS.upscale),
    secondImg: upscaleKer(listImg[1], KERNELS.upscale),
  };

  //showImage(data.baseImg, document.body);
  //console.log("baseImg");

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
  }, 1000000);

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

// открываем изображения и настраиваем их позиционирование и размеры области
function step_1() {
  loadImg(listURLImg, (images) => {
    images.forEach((img) => {
      listImg.push(imageToArray(img));
    });
  });
}

// Обработчик загрузки изображений
document.getElementById("imageUpload").addEventListener("change", function (e) {
  const files = e.target.files;
  uploadedImages = [];

  for (let file of files) {
    const img = new Image();
    img.onload = function () {
      uploadedImages.push(img); // Записываем только когда готово
    };
    img.src = URL.createObjectURL(file);
  }
});

function drawImageToCanvas(image, canvas) {
  const ctx = canvas.getContext("2d");
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
}

function startProcessing() {
  setInterval(() => {
    console.log("processing");
  }, 1000);
}

function setupCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const width = document.documentElement.clientWidth;

  canvas.width = width * dpr;
  canvas.height = 500 * dpr;
  canvas.style.width = width + "px";
  canvas.style.height = "500px";

  ctx.scale(dpr, dpr);
}

document
  .getElementById("switchToProcessing")
  .addEventListener("click", function () {
    if (uploadedImages.length === 0) {
      alert("Загрузите хотя бы одно изображение");
      return;
    }

    document.getElementById("setupScreen").classList.remove("active");
    document.getElementById("processingScreen").classList.add("active");

    STATE = "processing";
    startProcessing();
  });

document.getElementById("zoomIn").addEventListener("click", function () {
  previewScale *= 2;
  if (previewScale > 32) previewScale = 32;
  numPreviewScale.textContent = `${previewScale}`;
});

document.getElementById("zoomOut").addEventListener("click", function () {
  previewScale /= 2;
  if (previewScale < 1 / 4) previewScale = 1 / 4;
  numPreviewScale.textContent = `${previewScale}`;
});

canvas.addEventListener("mousedown", (e) => {
  isDragging = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  const deltaX = e.offsetX - lastX;
  const deltaY = e.offsetY - lastY;

  offsetX += deltaX / previewScale;
  offsetY += deltaY / previewScale;

  lastX = e.offsetX;
  lastY = e.offsetY;
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
  pos.x -= offsetX;
  pos.y -= offsetY;
  offsetX = 0;
  offsetY = 0;

  console.log("pos =", pos);
});

canvas.addEventListener("mouseleave", () => {
  isDragging = false;
  pos.x -= offsetX;
  pos.y -= offsetY;
  offsetX = 0;
  offsetY = 0;

  console.log("pos =", pos);
});
