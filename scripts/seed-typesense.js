/**
 * Creates the products collection and uploads seed data to Typesense.
 *
 * Usage:
 *   1. Copy .env.example to .env and add your admin API key + host
 *   2. npm install
 *   3. npm run typesense:seed
 */
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const Typesense = require("typesense");

dotenv.config();

const host = process.env.TYPESENSE_HOST;
const adminApiKey = process.env.TYPESENSE_ADMIN_API_KEY;
const collectionName = process.env.TYPESENSE_COLLECTION || "products";

if (!host || !adminApiKey) {
    console.error(
        "Missing TYPESENSE_HOST or TYPESENSE_ADMIN_API_KEY in .env\n" +
            "Copy .env.example to .env and add your Typesense Cloud credentials."
    );
    process.exit(1);
}

const client = new Typesense.Client({
    nodes: [
        {
            host,
            port: process.env.TYPESENSE_PORT || "443",
            protocol: process.env.TYPESENSE_PROTOCOL || "https",
        },
    ],
    apiKey: adminApiKey,
    connectionTimeoutSeconds: 5,
});

const schema = {
    name: collectionName,
    fields: [
        { name: "name", type: "string" },
        { name: "vendor", type: "string" },
        { name: "description", type: "string", optional: true },
        { name: "category", type: "string", facet: true, optional: true },
        { name: "slug", type: "string", optional: true },
        { name: "image", type: "string", optional: true },
        { name: "price", type: "float" },
    ],
    default_sorting_field: "price",
};

const seedPath = path.join(__dirname, "..", "data", "products.seed.json");
const products = JSON.parse(fs.readFileSync(seedPath, "utf8"));

async function run() {
    try {
        await client.collections(collectionName).delete();
        console.log(`Deleted existing "${collectionName}" collection (if any).`);
    } catch (error) {
        if (error.httpStatus !== 404) {
            throw error;
        }
    }

    await client.collections().create(schema);
    console.log(`Created "${collectionName}" collection.`);

    const importResult = await client
        .collections(collectionName)
        .documents()
        .import(products, { action: "create" });

    const failures = importResult.filter((row) => !row.success);
    if (failures.length) {
        console.error("Some documents failed to import:", failures);
        process.exit(1);
    }

    console.log(`Imported ${products.length} products into Typesense.`);
    console.log("Next: copy config/typesense.public.example.js to config/typesense.public.js");
    console.log("       and add your search-only API key for the browser.");
}

run().catch((error) => {
    console.error("Typesense seed failed:", error.message || error);
    process.exit(1);
});
