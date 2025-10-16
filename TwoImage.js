export default class TwoImage {
  constructor(genes = {}, fit = null, age = 0) {
    this.genes = genes;
    this.fit = fit;
    this.age = age;
  }

  static random(val = 100) {
    return new TwoImage({
      x: (2 * Math.random() - 1) * val,
      y: (2 * Math.random() - 1) * val,
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
      x: (2 * Math.random() - 1) * val + x,
      y: (2 * Math.random() - 1) * val + y,
    };
    return new TwoImage(g);
  }

  fitness(data) {
    if (this.fit !== null) {
      return this.fit;
    }

    const { x, y } = this.genes;
    this.fit = Math.pow(x - data.x, 2) + Math.pow(y - data.y, 2);
    return this.fit;
  }
}
