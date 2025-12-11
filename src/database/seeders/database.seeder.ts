import { Injectable } from '@nestjs/common';
import { AdminSeeder } from './admin.seeder';
import { CourseDepartmentSeeder } from './course-department.seeder';

@Injectable()
export class DatabaseSeeder {

  constructor(
    private readonly adminSeeder: AdminSeeder,
    private readonly courseDepartmentSeeder: CourseDepartmentSeeder
  ) { }


  async seed(): Promise<void> {
    console.log('Starting database seeding...');

    try {
      await this.adminSeeder.seed();
      await this.courseDepartmentSeeder.seed();
      console.log('Database seeding completed successfully!');
    } catch (error) {
      console.error('Database seeding failed:', error.message);
      throw error;
    }
  }

  
  async drop(): Promise<void> {
    console.log('Starting database cleanup...');

    try {
      await this.adminSeeder.drop();
      await this.adminSeeder.drop();
      console.log('Database cleanup completed successfully!');
    } catch (error) {
      console.error('Database cleanup failed:', error.message);
      throw error;
    }
  }
}