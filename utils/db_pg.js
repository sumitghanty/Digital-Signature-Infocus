const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log("Attempting to connect with URL:", process.env.DATABASE_URL);

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/digisign', {
    dialect: 'postgres',
    logging: false, // Set to console.log to see SQL queries
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ PostgreSQL Connection established successfully.');
        // Sync models
        await sequelize.sync({ alter: true }); // Updates table schema to match models
        console.log('✅ All models were synchronized successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
    }
};

module.exports = { sequelize, connectDB };
