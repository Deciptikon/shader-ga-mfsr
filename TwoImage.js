import { calculateSSDKer, shiftKer } from "./Shaders.js";

export default class TwoImage {
  constructor(genes = {}, fit = null, age = 0) {
    this.genes = genes;
    this.fit = fit;
    this.age = age;
  }

  static random(val = 100) {
    return new TwoImage({
      x: Math.ceil((2 * Math.random() - 1) * val - 0.5),
      y: Math.ceil((2 * Math.random() - 1) * val - 0.5),
    });
  }

  copy() {
    return new TwoImage({ ...this.genes }, this.fit, this.age);
  }

  crossover(parent, val = 0.5) {
    const { x: x1, y: y1 } = this.genes;
    const { x: x2, y: y2 } = parent.genes;
    const g = {
      x: Math.random() > val ? x1 : x2,
      y: Math.random() > val ? y1 : y2,
    };
    return new TwoImage(g);
  }

  mutation(val = 1) {
    const { x, y } = this.genes;
    const g = {
      x: Math.ceil((2 * Math.random() - 1) * val + x - 0.5),
      y: Math.ceil((2 * Math.random() - 1) * val + y - 0.5),
    };
    return new TwoImage(g);
  }

  fitness(data, kernels) {
    if (this.fit !== null) {
      return this.fit;
    }

    const { x, y } = this.genes;
    const { baseImg, secondImg } = data;
    //console.log("-------", x, y);

    const shiftImg = shiftKer(secondImg, -x, -y, kernels.shift);
    this.fit = calculateSSDKer(baseImg, shiftImg, kernels.ssd);

    return this.fit;
  }
}
