export class Parent {
  constructor(genes = {}, fit = null, age = 0) {
    this.genes = genes;
    this.fit = fit;
    this.age = age;
  }

  random(val = 100) {
    return new Parent({
      x: (2 * Math.random() - 1) * val,
      y: (2 * Math.random() - 1) * val,
    });
  }

  copy() {
    return new Parent({ ...this.genes }, this.fit, this.age);
  }

  crossover(parent, val = 0.5) {
    const { x: x1, y: y1 } = this.genes;
    const { x: x2, y: y2 } = parent.genes;
    const g = {
      x: Math.random() > val ? x1 : x2,
      y: Math.random() > val ? y1 : y2,
    };
    return new Parent(g);
  }

  mutation(val = 1) {
    const { x, y } = this.genes;
    const g = {
      x: (2 * Math.random() - 1) * val + x,
      y: (2 * Math.random() - 1) * val + y,
    };
    return new Parent(g);
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

export default class GeneticAlgorithm {
  constructor(config) {
    this.populationSize = config.populationSize;
    this.mutationRate = config.mutationRate;
    this.crossoverRate = config.crossoverRate;

    this.population = [];
  }

  initializePopulation(val = 50) {
    this.population = [];
    for (let i = 0; i < this.populationSize; i++) {
      this.population.push(new Parent().random(val));
    }
    //console.log("this.population", this.population);
  }

  initializeFromIndividual(individual = null, val = 50) {
    this.population = [];
    for (let i = 0; i < this.populationSize; i++) {
      if (individual) {
        this.population.push(individual.mutation(val));
      } else {
        this.population.push(new Parent().random(val));
      }
    }
  }

  fitness(population, data) {
    //console.log("fitness(population, data)");
    for (let individual of population) {
      individual.fitness(data);
    }
    return population;
  }

  selection(population) {
    //console.log("selection(population)");
    return population
      .sort((a, b) => a.fit - b.fit)
      .slice(0, this.populationSize);
  }

  crossover(population) {
    //console.log("crossover(population)");

    const populationSize = population.length;
    const crossList = [];

    for (const individual of population) {
      if (Math.random() < this.crossoverRate) {
        const r = Math.ceil(Math.random() * populationSize) - 1;
        crossList.push(individual.crossover(population[r]));
      }
    }

    return [...population, ...crossList];
  }

  mutate(population, val = 1) {
    //console.log("mutate(population, val = 1)");
    const mutList = [];

    for (const individual of population) {
      if (Math.random() < this.mutationRate) {
        mutList.push(individual.mutation(val));
      }
    }

    return [...population, ...mutList];
  }

  // Запуск одной итерации
  evolve(population, data) {
    console.log("evolve(population, data)");
    //console.log(population);
    population = this.crossover(population);
    //console.log(population);
    population = this.mutate(population);
    //console.log(population);
    population = this.fitness(population, data);
    //console.log(population);
    population = this.selection(population);
    //console.log(population);
    return population;
  }

  run(generations, data, onProgress = null) {
    console.log("run(generations, data, onProgress = null)");
    for (let i = 0; i < generations; i++) {
      console.log("");
      console.log(`----- ${i} -----------------`);
      this.population = this.evolve(this.population, data);

      if (onProgress) {
        onProgress(this.population[0].genes);
      }

      console.log(
        `Поколение ${i}: Лучший fitness = ${parseFloat(
          this.population[0].fit
        ).toFixed(4)}`
      );
    }

    return this.population[0];
  }
}
