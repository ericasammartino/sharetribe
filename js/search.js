/**
 * ON LOT — Typesense search (browser)
 * Requires config/typesense.public.js and Typesense CDN on the page.
 */
(function () {
    const config = window.ON_LOT_TYPESENSE;
    const form = document.querySelector("[data-typesense-search-form]");
    const input = document.querySelector("[data-typesense-search-input]");
    const statusEl = document.querySelector("[data-search-status]");
    const resultsEl = document.querySelector("[data-search-results]");
    const titleEl = document.querySelector("[data-search-query-label]");

    if (!form || !input || !resultsEl) {
        return;
    }

    function setStatus(message) {
        if (statusEl) {
            statusEl.textContent = message;
        }
    }

    function formatPrice(value) {
        if (typeof value !== "number") {
            return "";
        }
        return `$${value.toFixed(value % 1 === 0 ? 0 : 2)}`;
    }

    function renderResults(hits, query) {
        if (titleEl) {
            titleEl.textContent = query ? `Results for “${query}”` : "Search";
        }

        if (!hits.length) {
            resultsEl.innerHTML = "";
            setStatus(query ? "No products found. Try another search." : "Enter a search term above.");
            return;
        }

        setStatus(`${hits.length} result${hits.length === 1 ? "" : "s"}`);

        resultsEl.innerHTML = hits
            .map((hit) => {
                const doc = hit.document;
                const href = doc.slug ? `product.html?slug=${encodeURIComponent(doc.slug)}` : "#";
                const image = doc.image
                    ? `<img src="${doc.image}" alt="">`
                    : `<span class="search-result-placeholder" aria-hidden="true"></span>`;

                return `
                    <a href="${href}" class="product-card search-result-card">
                        <div class="product-image-well">${image}</div>
                        <div class="product-card-info">
                            <div class="product-meta">
                                <span class="product-name">${doc.name}</span>
                                <span class="product-price">${formatPrice(doc.price)}</span>
                            </div>
                            ${doc.vendor ? `<span class="product-vendor">${doc.vendor}</span>` : ""}
                        </div>
                    </a>
                `;
            })
            .join("");
    }

    async function runSearch(query) {
        if (!config || !config.apiKey || !config.host) {
            setStatus(
                "Search is not configured yet. Copy config/typesense.public.example.js to config/typesense.public.js and add your Typesense keys."
            );
            resultsEl.innerHTML = "";
            return;
        }

        if (!window.Typesense) {
            setStatus("Typesense library failed to load.");
            return;
        }

        const trimmed = (query || "").trim();
        if (!trimmed) {
            renderResults([], "");
            return;
        }

        setStatus("Searching…");

        const client = new window.Typesense.Client({
            nodes: [
                {
                    host: config.host,
                    port: String(config.port || 443),
                    protocol: config.protocol || "https",
                },
            ],
            apiKey: config.apiKey,
            connectionTimeoutSeconds: 5,
        });

        try {
            const result = await client
                .collections(config.collection || "products")
                .documents()
                .search({
                    q: trimmed,
                    query_by: "name,vendor,description,category",
                    per_page: 24,
                });

            renderResults(result.hits || [], trimmed);
        } catch (error) {
            console.error(error);
            setStatus("Search failed. Check your Typesense config and API keys.");
            resultsEl.innerHTML = "";
        }
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const query = input.value.trim();
        const url = new URL(window.location.href);
        if (query) {
            url.searchParams.set("q", query);
        } else {
            url.searchParams.delete("q");
        }
        window.history.replaceState({}, "", url);
        runSearch(query);
    });

    const initialQuery = new URLSearchParams(window.location.search).get("q") || "";
    if (initialQuery) {
        input.value = initialQuery;
    }

    runSearch(initialQuery);
})();
