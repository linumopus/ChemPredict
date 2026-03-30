const { MongoClient } = require('mongodb');

// Extract connection string from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.warn('⚠️ Please define the MONGODB_URI environment variable inside .env');
}

/**
 * Global variables to hold the cached connection.
 * Essential for Serverless environments (like Vercel) where 
 * database connections need to be reused across function invocations 
 * to prevent exhausting the database connection pool.
 */
let cachedClient = null;
let cachedDb = null;

async function getDb() {
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is undefined. Check your environment variables.');
    }

    // Step 1: If we established a connection previously, reuse it.
    if (cachedClient && cachedDb) {
        return cachedDb;
    }

    // Step 2: Otherwise, establish a new connection.
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        
        // Define your default database name here if you wish (e.g. client.db('chem_project'))
        const db = client.db('chem_project');

        // Cache the newly established client and DB instance
        cachedClient = client;
        cachedDb = db;

        return db;
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        throw error;
    }
}

module.exports = {
    getDb
};
