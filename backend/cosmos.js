const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;

if (!endpoint || !key) {
  throw new Error("Missing COSMOS_ENDPOINT or COSMOS_KEY in .env");
}

const client = new CosmosClient({ endpoint, key });

module.exports = { client };