import { randomImage } from "./Image.js";

export default class MultiImage {
  constructor(genes = {}, fit = null, age = 0) {
    this.genes = genes;
    this.fit = fit;
    this.age = age;
  }

  static random(val = 100) {
    return new MultiImage({
      x: (2 * Math.random() - 1) * val,
      y: (2 * Math.random() - 1) * val,
      arr: randomImage(64, 64),
    });
  }

  copy() {
    return new MultiImage({ ...this.genes }, this.fit, this.age);
  }

  crossover(parent, val = 0.5) {
    const { x: x1, y: y1, z: z1 } = this.genes;
    const { x: x2, y: y2, z: z2 } = parent.genes;
    const g = {
      x: Math.random() > val ? x1 : x2,
      y: Math.random() > val ? y1 : y2,
      z: Math.random() > val ? z1 : z2,
    };
    return new MultiImage(g);
  }

  mutation(val = 1) {
    const { x, y, z } = this.genes;
    const g = {
      x: (2 * Math.random() - 1) * val + x,
      y: (2 * Math.random() - 1) * val + y,
      z: (2 * Math.random() - 1) * val + z,
    };
    return new MultiImage(g);
  }

  fitness(data) {
    if (this.fit !== null) {
      return this.fit;
    }

    const { x, y, z } = this.genes;
    this.fit =
      Math.pow(x - data.x, 2) +
      Math.pow(y - data.y, 2) +
      Math.pow(z - data.z, 2);
    return this.fit;
  }
}
