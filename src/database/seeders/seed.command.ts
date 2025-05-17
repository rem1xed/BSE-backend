import { Command, CommandRunner } from 'nest-commander';
import { SubcategorySeeder } from './subcategory.seeders';

@Command({ name: 'seed' })
export class SeedCommand extends CommandRunner {
  constructor(private readonly subcategorySeeder: SubcategorySeeder) {
    super();
  }

  async run(passedParams: string[], options?: Record<string, any>): Promise<void> {
    await this.subcategorySeeder.seed();
    process.exit(0);
  }
}