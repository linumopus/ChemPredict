const { getDb } = require('../utils/db');

module.exports = async function handler(req, res) {
    // Only accept POST requests as required
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    try {
        // Extract the user's requested reaction string (e.g. "HCl + NaOH")
        // We will default to an empty string to prevent crashes if it is missing
        const userInput = req.body && req.body.input ? req.body.input : '';

        if (!userInput.trim()) {
            return res.status(400).json({ message: 'No input provided' });
        }

        // Initialize/Retrieve the MongoDB connection
        const db = await getDb();
        const collection = db.collection('reactions');

        // Normalize the user input: lowercase, strip all spaces, split by '+', and alphabetize.
        // E.g. "NaOH + HCl" -> ['hcl', 'naoh']
        const normalizedInputArr = userInput.toLowerCase().replace(/\s+/g, '').split('+').sort();

        // Fetch all configured reactions gracefully from the database
        const allReactions = await collection.find({}).toArray();

        // Perform the matching check against all MongoDB predefined reactions.
        // We do this matching cleanly in JS to handle reverse ordering (NaOH + HCl vs HCl + NaOH)
        const foundReaction = allReactions.find(reaction => {
            if (!reaction.input) return false;
            
            // Normalize the database's specified input string using the identical logic
            const normalizedDbInputArr = reaction.input.toLowerCase().replace(/\s+/g, '').split('+').sort();
            
            if (normalizedInputArr.length !== normalizedDbInputArr.length) return false;
            
            // Return true if all reactants precisely match
            return normalizedInputArr.every((part, i) => part === normalizedDbInputArr[i]);
        });

        if (foundReaction) {
            // Found it! Return the clean response payload format requested.
            return res.status(200).json({
                product: foundReaction.product,
                balanced: foundReaction.balanced,
                type: foundReaction.type
            });
        } else {
            // Standard not found message formatting exactly as requested
            return res.status(404).json({ message: "Reaction not found" });
        }

    } catch (error) {
        console.error('Error querying MongoDB for reaction predictor:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
