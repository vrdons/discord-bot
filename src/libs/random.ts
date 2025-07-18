import { Random, MersenneTwister19937 } from "random-js";
import { randomFillSync } from "crypto";

type WeightedItem<T> = { chance: number; item: T };

export class Randomizer {
  private static seedEngine(): MersenneTwister19937 {
    const cryptoSeed = new Uint32Array(8);
    randomFillSync(cryptoSeed);
    return MersenneTwister19937.seedWithArray(Array.from(cryptoSeed));
  }

  private static getRandomInstance(): Random {
    const engine = this.seedEngine();
    return new Random(engine);
  }

  static getRandom(min: number, max: number): number {
    return this.getRandomInstance().integer(min, max);
  }

  static shuffleArray<T>(array: T[]): T[] {
    return this.getRandomInstance().shuffle([...array]);
  }

  static getRandomFromArray<T>(array: T[]): T {
    if (array.length === 0) throw new Error("Array boş.");
    return this.getRandomInstance().pick(array);
  }

  static getRandomChance(chance: number): boolean {
    if (chance <= 0) return false;
    if (chance >= 100) return true;
    const rand = this.getRandom(1, 100);
    return rand <= chance;
  }

  static weightedRandom<T>(items: WeightedItem<T>[]): T {
    const total = items.reduce((acc, i) => acc + i.chance, 0);
    if (total <= 0) throw new Error("Toplam chance sıfır veya negatif olamaz.");

    const normalized = items.map((i) => ({
      chance: i.chance / total,
      item: i.item,
    }));

    const r = this.getRandomInstance().real(0, 1, false);

    let accum = 0;
    for (const i of normalized) {
      accum += i.chance;
      if (r <= accum) return i.item;
    }

    return normalized[normalized.length - 1].item;
  }
}
