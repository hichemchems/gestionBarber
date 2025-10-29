import sequelize from './index.js';
import { User, Package } from './associations.js';
import { hashPassword } from '../lib/auth.js';

const resetDatabase = async () => {
  try {
    console.log('Resetting database...');

    // Drop all tables
    await sequelize.drop();

    // Sync all models
    await sequelize.sync({ force: true });

    console.log('Database reset successfully.');

    // Seed initial data
    await seedInitialData();

  } catch (error) {
    console.error('Error resetting database:', error);
  }
};

const seedInitialData = async () => {
  try {
    console.log('Seeding initial data...');

    // Create default packages
    const packages = [
      { name: 'Barbe', price: 7.00 },
      { name: 'Coupe de cheveux', price: 12.00 },
      { name: 'Coupe de cheveux sans contour', price: 16.00 },
      { name: 'Coupe de cheveux avec contour', price: 19.00 },
      { name: 'Coupe de cheveux enfant', price: 10.00 },
      { name: 'Service personnalisé', price: 0.00 }, // Can be customized
    ];

    for (const pkg of packages) {
      await Package.create(pkg);
    }

    console.log('Initial data seeded successfully.');

  } catch (error) {
    console.error('Error seeding initial data:', error);
  }
};

resetDatabase();
