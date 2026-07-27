/**
 * Copy this file to `config/typesense.public.js` and fill in your values.
 * Use the SEARCH-ONLY API key from Typesense Cloud (safe for the browser).
 *
 *   cp config/typesense.public.example.js config/typesense.public.js
 */
window.ON_LOT_TYPESENSE = {
    host: "xxx.a1.typesense.net",
    port: 443,
    protocol: "https",
    apiKey: "your_search_only_api_key_here",
    collection: "products",
};
