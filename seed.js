const fs = require('fs');
const { MongoClient } = require('mongodb');

// Dynamically load .env file to extract connection string natively
if (fs.existsSync('.env')) {
    const envConfig = fs.readFileSync('.env', 'utf-8').split('\n');
    envConfig.forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            process.env[key] = value;
        }
    });
}

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error("❌ MONGODB_URI is missing. Please add it to your .env file!");
    process.exit(1);
}

// 1. Elements Data (36 objects, merged with previous detailed descriptions)
const elementsToInsert = [
    { symbol: 'H', name: 'Hydrogen', atomicNumber: 1, atomicMass: 1.008, uses: 'Rocket fuel, filling balloons, petroleum refining.' },
    { symbol: 'He', name: 'Helium', atomicNumber: 2, atomicMass: 4.0026, uses: 'Balloons, cooling superconducting magnets, deep-sea diving.' },
    { symbol: 'Li', name: 'Lithium', atomicNumber: 3, atomicMass: 6.94, uses: 'Batteries' },
    { symbol: 'Be', name: 'Beryllium', atomicNumber: 4, atomicMass: 9.01, uses: 'Alloys' },
    { symbol: 'B', name: 'Boron', atomicNumber: 5, atomicMass: 10.81, uses: 'Glass, detergents' },
    { symbol: 'C', name: 'Carbon', atomicNumber: 6, atomicMass: 12.011, uses: 'Steel manufacturing, plastics, filtration, basis of organic life.' },
    { symbol: 'N', name: 'Nitrogen', atomicNumber: 7, atomicMass: 14.007, uses: 'Fertilizers, nylon, dyes, explosives.' },
    { symbol: 'O', name: 'Oxygen', atomicNumber: 8, atomicMass: 15.999, uses: 'Respiration, steel production, water purification, oxidizer.' },
    { symbol: 'F', name: 'Fluorine', atomicNumber: 9, atomicMass: 19.00, uses: 'Toothpaste, chemicals' },
    { symbol: 'Ne', name: 'Neon', atomicNumber: 10, atomicMass: 20.18, uses: 'Lighting' },
    { symbol: 'Na', name: 'Sodium', atomicNumber: 11, atomicMass: 22.990, uses: 'Table salt, streetlights, heat exchanger.' },
    { symbol: 'Mg', name: 'Magnesium', atomicNumber: 12, atomicMass: 24.305, uses: 'Lightweight alloys, flares, fireworks, antacids.' },
    { symbol: 'Al', name: 'Aluminum', atomicNumber: 13, atomicMass: 26.982, uses: 'Cans, foil, kitchen utensils, window frames.' },
    { symbol: 'Si', name: 'Silicon', atomicNumber: 14, atomicMass: 28.085, uses: 'Semiconductors, computers, microelectronics, glass.' },
    { symbol: 'P', name: 'Phosphorus', atomicNumber: 15, atomicMass: 30.974, uses: 'Fertilizers, matches, steel production.' },
    { symbol: 'S', name: 'Sulfur', atomicNumber: 16, atomicMass: 32.07, uses: 'Acids, rubber' },
    { symbol: 'Cl', name: 'Chlorine', atomicNumber: 17, atomicMass: 35.45, uses: 'Water purification, disinfectants, bleach, PVC plastics.' },
    { symbol: 'Ar', name: 'Argon', atomicNumber: 18, atomicMass: 39.95, uses: 'Inert gas, welding' },
    { symbol: 'K', name: 'Potassium', atomicNumber: 19, atomicMass: 39.098, uses: 'Fertilizers, soaps, glass making, nerve functions.' },
    { symbol: 'Ca', name: 'Calcium', atomicNumber: 20, atomicMass: 40.078, uses: 'Cement, dietary supplements, plaster, bones.' },
    { symbol: 'Sc', name: 'Scandium', atomicNumber: 21, atomicMass: 44.96, uses: 'Alloys' },
    { symbol: 'Ti', name: 'Titanium', atomicNumber: 22, atomicMass: 47.87, uses: 'Aircraft, implants' },
    { symbol: 'V', name: 'Vanadium', atomicNumber: 23, atomicMass: 50.94, uses: 'Steel alloys' },
    { symbol: 'Cr', name: 'Chromium', atomicNumber: 24, atomicMass: 52.00, uses: 'Stainless steel' },
    { symbol: 'Mn', name: 'Manganese', atomicNumber: 25, atomicMass: 54.94, uses: 'Steel production' },
    { symbol: 'Fe', name: 'Iron', atomicNumber: 26, atomicMass: 55.845, uses: 'Steel construction, bridges, vehicles, blood hemoglobin.' },
    { symbol: 'Co', name: 'Cobalt', atomicNumber: 27, atomicMass: 58.93, uses: 'Batteries, magnets' },
    { symbol: 'Ni', name: 'Nickel', atomicNumber: 28, atomicMass: 58.69, uses: 'Coins, alloys' },
    { symbol: 'Cu', name: 'Copper', atomicNumber: 29, atomicMass: 63.546, uses: 'Electrical wiring, plumbing, coins, bronze alloys.' },
    { symbol: 'Zn', name: 'Zinc', atomicNumber: 30, atomicMass: 65.39, uses: 'Galvanization' },
    { symbol: 'Ga', name: 'Gallium', atomicNumber: 31, atomicMass: 69.72, uses: 'Semiconductors' },
    { symbol: 'Ge', name: 'Germanium', atomicNumber: 32, atomicMass: 72.61, uses: 'Electronics' },
    { symbol: 'As', name: 'Arsenic', atomicNumber: 33, atomicMass: 74.92, uses: 'Alloys, pesticides' },
    { symbol: 'Se', name: 'Selenium', atomicNumber: 34, atomicMass: 78.96, uses: 'Glass, electronics' },
    { symbol: 'Br', name: 'Bromine', atomicNumber: 35, atomicMass: 79.90, uses: 'Flame retardants' },
    { symbol: 'Kr', name: 'Krypton', atomicNumber: 36, atomicMass: 83.80, uses: 'Lighting' }
];

// 2. Reactions Data (Over 40 diverse reactions restricted to the 15 elements above)
const reactionsToInsert = [
    // Neutralizations and Double Displacements
    { input: "HCl + NaOH", product: "NaCl + H₂O", balanced: "HCl + NaOH → NaCl + H₂O", type: "Neutralization" },
    { input: "HCl + KOH", product: "KCl + H₂O", balanced: "HCl + KOH → KCl + H₂O", type: "Neutralization" },
    { input: "Mg(OH)2 + HCl", product: "MgCl₂ + H₂O", balanced: "Mg(OH)₂ + 2HCl → MgCl₂ + 2H₂O", type: "Neutralization" },
    { input: "Al(OH)3 + HCl", product: "AlCl₃ + H₂O", balanced: "Al(OH)₃ + 3HCl → AlCl₃ + 3H₂O", type: "Neutralization" },
    { input: "CuO + HCl", product: "CuCl₂ + H₂O", balanced: "CuO + 2HCl → CuCl₂ + H₂O", type: "Neutralization (Oxide + Acid)" },
    { input: "CaCl2 + Na2CO3", product: "CaCO₃ + NaCl", balanced: "CaCl₂ + Na₂CO₃ → CaCO₃ + 2NaCl", type: "Double Displacement" },

    // Single Displacements
    { input: "K + H2O", product: "KOH + H₂", balanced: "2K + 2H₂O → 2KOH + H₂", type: "Single Displacement" },
    { input: "Na + H2O", product: "NaOH + H₂", balanced: "2Na + 2H₂O → 2NaOH + H₂", type: "Single Displacement" },
    { input: "Ca + H2O", product: "Ca(OH)₂ + H₂", balanced: "Ca + 2H₂O → Ca(OH)₂ + H₂", type: "Single Displacement" },
    { input: "Mg + HCl", product: "MgCl₂ + H₂", balanced: "Mg + 2HCl → MgCl₂ + H₂", type: "Single Displacement" },
    { input: "Al + HCl", product: "AlCl₃ + H₂", balanced: "2Al + 6HCl → 2AlCl₃ + 3H₂", type: "Single Displacement" },
    { input: "Fe + HCl", product: "FeCl₂ + H₂", balanced: "Fe + 2HCl → FeCl₂ + H₂", type: "Single Displacement" },

    // Syntheses / Combinations
    { input: "H2 + O2", product: "H₂O", balanced: "2H₂ + O₂ → 2H₂O", type: "Combination (Combustion)" },
    { input: "C + O2", product: "CO₂", balanced: "C + O₂ → CO₂", type: "Combination (Combustion)" },
    { input: "CO + O2", product: "CO₂", balanced: "2CO + O₂ → 2CO₂", type: "Combination" },
    { input: "CH4 + O2", product: "CO₂ + H₂O", balanced: "CH₄ + 2O₂ → CO₂ + 2H₂O", type: "Combustion" },
    { input: "Fe + O2", product: "Fe₂O₃", balanced: "4Fe + 3O₂ → 2Fe₂O₃", type: "Combination (Oxidation)" },
    { input: "Mg + O2", product: "MgO", balanced: "2Mg + O₂ → 2MgO", type: "Combination (Oxidation)" },
    { input: "Cu + O2", product: "CuO", balanced: "2Cu + O₂ → 2CuO", type: "Combination (Oxidation)" },
    { input: "Al + O2", product: "Al₂O₃", balanced: "4Al + 3O₂ → 2Al₂O₃", type: "Combination (Oxidation)" },
    { input: "Si + O2", product: "SiO₂", balanced: "Si + O₂ → SiO₂", type: "Combination (Oxidation)" },
    { input: "P + O2", product: "P₄O₁₀", balanced: "4P + 5O₂ → P₄O₁₀", type: "Combination (Synthesis)" },
    { input: "Na + Cl2", product: "NaCl", balanced: "2Na + Cl₂ → 2NaCl", type: "Combination (Synthesis)" },
    { input: "K + Cl2", product: "KCl", balanced: "2K + Cl₂ → 2KCl", type: "Combination (Synthesis)" },
    { input: "Mg + Cl2", product: "MgCl₂", balanced: "Mg + Cl₂ → MgCl₂", type: "Combination (Synthesis)" },
    { input: "Al + Cl2", product: "AlCl₃", balanced: "2Al + 3Cl₂ → 2AlCl₃", type: "Combination (Synthesis)" },
    { input: "Si + Cl2", product: "SiCl₄", balanced: "Si + 2Cl₂ → SiCl₄", type: "Combination (Synthesis)" },
    { input: "P + Cl2", product: "PCl₃", balanced: "2P + 3Cl₂ → 2PCl₃", type: "Combination (Synthesis)" },
    { input: "Fe + Cl2", product: "FeCl₃", balanced: "2Fe + 3Cl₂ → 2FeCl₃", type: "Combination (Synthesis)" },
    { input: "Cu + Cl2", product: "CuCl₂", balanced: "Cu + Cl₂ → CuCl₂", type: "Combination (Synthesis)" },
    { input: "N2 + H2", product: "NH₃", balanced: "N₂ + 3H₂ → 2NH₃", type: "Combination (Synthesis - Haber Process)" },
    { input: "NH3 + HCl", product: "NH₄Cl", balanced: "NH₃ + HCl → NH₄Cl", type: "Combination (Synthesis)" },
    
    // Aqueous Anhydride Syntheses
    { input: "Na2O + H2O", product: "NaOH", balanced: "Na₂O + H₂O → 2NaOH", type: "Combination" },
    { input: "K2O + H2O", product: "KOH", balanced: "K₂O + H₂O → 2KOH", type: "Combination" },
    { input: "CaO + H2O", product: "Ca(OH)₂", balanced: "CaO + H₂O → Ca(OH)₂", type: "Combination" },
    { input: "CO2 + H2O", product: "H₂CO₃", balanced: "CO₂ + H₂O → H₂CO₃", type: "Combination (Acid Formation)" },
    { input: "P4O10 + H2O", product: "H₃PO₄", balanced: "P₄O₁₀ + 6H₂O → 4H₃PO₄", type: "Combination (Acid Formation)" },

    // Gas Generating & Reductions
    { input: "CaCO3 + HCl", product: "CaCl₂ + H₂O + CO₂", balanced: "CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂", type: "Acid-Carbonate Reaction" },
    { input: "NaOH + CO2", product: "Na₂CO₃ + H₂O", balanced: "2NaOH + CO₂ → Na₂CO₃ + H₂O", type: "Base-Anhydride Reaction" },
    { input: "KOH + CO2", product: "K₂CO₃ + H₂O", balanced: "2KOH + CO₂ → K₂CO₃ + H₂O", type: "Base-Anhydride Reaction" },
    { input: "Fe2O3 + C", product: "Fe + CO₂", balanced: "2Fe₂O₃ + 3C → 4Fe + 3CO₂", type: "Single Displacement (Reduction)" },
    
    // Decompositions
    { input: "CaCO3", product: "CaO + CO₂", balanced: "CaCO₃ → CaO + CO₂", type: "Decomposition (Thermal)" },
    { input: "KClO3", product: "KCl + O₂", balanced: "2KClO₃ → 2KCl + 3O₂", type: "Decomposition" },

    // Additional Reactions for Missed & Transition Elements
    { input: "Zn + HCl", product: "ZnCl₂ + H₂", balanced: "Zn + 2HCl → ZnCl₂ + H₂", type: "Single Displacement" },
    { input: "Li + H2O", product: "LiOH + H₂", balanced: "2Li + 2H₂O → 2LiOH + H₂", type: "Single Displacement" },
    { input: "H2 + F2", product: "HF", balanced: "H₂ + F₂ → 2HF", type: "Combination (Synthesis)" },
    { input: "S + O2", product: "SO₂", balanced: "S + O₂ → SO₂", type: "Combination (Combustion)" },
    { input: "Zn + S", product: "ZnS", balanced: "Zn + S → ZnS", type: "Combination (Synthesis)" },
    { input: "Fe + S", product: "FeS", balanced: "Fe + S → FeS", type: "Combination (Synthesis)" },
    { input: "TiCl4 + Mg", product: "Ti + MgCl₂", balanced: "TiCl₄ + 2Mg → Ti + 2MgCl₂", type: "Single Displacement (Kroll Process)" },
    { input: "MnO2 + HCl", product: "MnCl₂ + H₂O + Cl₂", balanced: "MnO₂ + 4HCl → MnCl₂ + 2H₂O + Cl₂", type: "Redox" },
    { input: "K + Br2", product: "KBr", balanced: "2K + Br₂ → 2KBr", type: "Combination (Synthesis)" },
    { input: "Ni + O2", product: "NiO", balanced: "2Ni + O₂ → 2NiO", type: "Combination (Oxidation)" },
    { input: "Cr2O3 + Al", product: "Cr + Al₂O₃", balanced: "Cr₂O₃ + 2Al → 2Cr + Al₂O₃", type: "Single Displacement (Thermite)" }
];

async function seedDatabase() {
    // Establishing the SINGLE connection instance per requirements
    const client = new MongoClient(uri);

    try {
        console.log("⏳ Connecting to MongoDB Atlas cluster...");
        await client.connect();
        
        const db = client.db('ChemPredict'); 
        
        console.log(`\n🧹 Clearing old data...`);
        // Clear old data
        await db.collection("elements").deleteMany({});
        await db.collection("reactions").deleteMany({});

        console.log(`🌱 Inserting new data...`);
        // Insert new data
        const elementsResult = await db.collection("elements").insertMany(elementsToInsert);
        const reactionsResult = await db.collection("reactions").insertMany(reactionsToInsert);

        console.log(`✅ Success! Inserted ${elementsResult.insertedCount} elements & ${reactionsResult.insertedCount} reactions.`);

    } catch (error) {
        console.error("\n❌ Failed to seed the databases:", error);
    } finally {
        // Closes connection explicitly upon completion per requirements
        await client.close();
        console.log("\n🔌 Database connection cleanly safely closed.");
    }
}

// Execute the async script
seedDatabase();
