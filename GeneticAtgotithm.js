export default class GeneticAlgorithm {
  constructor(config) {
    this.populationSize = config.populationSize;
    this.mutationRate = config.mutationRate;
    this.crossoverRate = config.crossoverRate;
    this.TClass = config.TClass;

    this.population = [];
  }

  initializePopulation(val = 50) {
    this.population = [];
    for (let i = 0; i < this.populationSize; i++) {
      this.population.push(this.TClass.random(val));
    }
  }

  initializeFromIndividual(individual = null, val = 50) {
    this.population = [];
    for (let i = 0; i < this.populationSize; i++) {
      if (individual) {
        this.population.push(individual.mutation(val));
      } else {
        this.population.push(this.TClass.random(val));
      }
    }
  }

  fitness(population, data) {
    for (let individual of population) {
      individual.fitness(data);
    }
    return population;
  }

  selection(population) {
    return population
      .sort((a, b) => a.fit - b.fit)
      .slice(0, this.populationSize);
  }

  crossover(population) {
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
    population = this.crossover(population);
    population = this.mutate(population);
    population = this.fitness(population, data);
    population = this.selection(population);
    return population;
  }

  run(generations, data, onProgress = null) {
    for (let i = 0; i < generations; i++) {
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
