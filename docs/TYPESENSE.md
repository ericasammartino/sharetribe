# Typesense search setup

ON LOT uses [Typesense Cloud](https://cloud.typesense.org) for product search.

## 1. Install dependencies

```bash
npm install
```

## 2. Add your admin credentials (server-side only)

Copy the example env file and fill in values from the Typesense Cloud dashboard:

```bash
cp .env.example .env
```

Edit `.env`:

| Variable | Where to find it |
|----------|------------------|
| `TYPESENSE_HOST` | Cluster → **Nodes** (hostname only, e.g. `abc123.a1.typesense.net`) |
| `TYPESENSE_ADMIN_API_KEY` | **API Keys** → Admin API key |
| `TYPESENSE_SEARCH_ONLY_API_KEY` | **API Keys** → Generate a **Search-only** key |

Never commit `.env` or put the admin key in the browser.

## 3. Seed the products collection

```bash
npm run typesense:seed
```

This creates a `products` collection and uploads sample listings from `data/products.seed.json`.

## 4. Add the search-only key for the website

```bash
cp config/typesense.public.example.js config/typesense.public.js
```

Edit `config/typesense.public.js` with your **search-only** API key and host. This file is gitignored.

## 5. Try search

Open `search.html` in a browser (or use a local server). The header search on `index.html` goes to `search.html?q=your query`.

Try searching: `phish`, `jewelry`, `Lucy's Pins`.

## Updating products later

1. Edit `data/products.seed.json` (or build export from your database).
2. Run `npm run typesense:seed` again to recreate the collection.

When you have a live database, replace the seed script with a sync job that runs on deploy or when listings change.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Search is not configured` | Create `config/typesense.public.js` from the example file |
| `Search failed` | Confirm search-only key, host, and that you ran `npm run typesense:seed` |
| CORS errors | Typesense Cloud allows browser search by default with search-only keys |
| 404 on `config/typesense.public.js` | Expected until you create the file from the example |

## Files

- `scripts/seed-typesense.js` — admin script to create collection + import data
- `config/typesense.public.js` — your search-only config (local, not committed)
- `js/search.js` — browser search on `search.html`
- `data/products.seed.json` — sample product data
