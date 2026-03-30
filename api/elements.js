const { getDb } = require('../utils/db');

module.exports = async function handler(req, res) {
    // We only accept GET requests for fetching elements
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
        // Retrieve the cached database connection
        const db = await getDb();
        
        // Access the "elements" collection
        const collection = db.collection('elements');
        
        // Fetch all documents from the collection (no pagination as requested)
        const elementsData = await collection.find({}).toArray();
        
        // Return the list of elements in JSON format
        return res.status(200).json({ elements: elementsData });
    } catch (error) {
        console.error('Error fetching elements from MongoDB:', error);
        return res.status(500).json({ error: 'Failed to fetch elements from the database' });
    }
};
