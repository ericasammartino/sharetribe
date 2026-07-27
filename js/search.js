/**
 * ON LOT — Typesense search (search.html + shop.html)
 * Requires config/typesense.public.js and Typesense CDN on the page.
 */
(function () {
    const config = window.ON_LOT_TYPESENSE;
    const inputs = document.querySelectorAll("[data-typesense-search-input]");
    const forms = document.querySelectorAll("[data-typesense-search-form]");
    const statusEl = document.querySelector("[data-search-status]");
    const resultsEl = document.querySelector("[data-search-results]");
    const titleEl = document.querySelector("[data-search-query-label]");
    const browseEl = document.querySelector("[data-shop-browse]");
    const searchResultsWrap = document.querySelector("[data-shop-search-results]");

    if (!resultsEl) {
        return;
    }

    function setStatus(message) {
        if (statusEl) {
            statusEl.textContent = message;
        }
    }

    function setBrowseMode(isBrowsing) {
        if (browseEl) {
            browseEl.hidden = !isBrowsing;
        }
        if (searchResultsWrap) {
            searchResultsWrap.hidden = isBrowsing;
        }
    }

    function syncInputs(value) {
        inputs.forEach((input) => {
            input.value = value;
        });
    }

    function formatPrice(value) {
        if (typeof value !== "number") {
            return "";
        }
        return `$${value.toFixed(value % 1 === 0 ? 0 : 2)}`;
    }

    function renderResults(hits, query) {
        const trimmed = (query || "").trim();

        if (titleEl && browseEl) {
            titleEl.textContent = trimmed ? `Shop — “${trimmed}”` : "Shop";
        } else if (titleEl) {
            titleEl.textContent = trimmed ? `Results for “${trimmed}”` : "Search";
        }

        if (!trimmed) {
            resultsEl.innerHTML = "";
            setBrowseMode(true);
            if (!browseEl) {
                setStatus("Enter a search term above.");
            }
            return;
        }

        setBrowseMode(false);

        if (!hits.length) {
            resultsEl.innerHTML = "";
            setStatus("No products found. Try another search.");
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
        const trimmed = (query || "").trim();

        if (!trimmed) {
            renderResults([], "");
            return;
        }

        if (!config || !config.apiKey || !config.host) {
            setBrowseMode(false);
            setStatus("Search config missing. Create config/typesense.public.js with your search-only API key.");
            resultsEl.innerHTML = "";
            return;
        }

        if (config.apiKey.includes("your_search_only")) {
            setBrowseMode(false);
            setStatus("Replace the placeholder API key in config/typesense.public.js.");
            resultsEl.innerHTML = "";
            return;
        }

        if (!window.Typesense) {
            setBrowseMode(false);
            setStatus("Typesense library failed to load. Check your internet connection.");
            return;
        }

        setBrowseMode(false);
        setStatus("Searching…");

        const client = new window.Typesense.Client({
            nodes: [
                {
                    host: config.host,
                    port: Number(config.port || 443),
                    protocol: config.protocol || "https",
                },
            ],
            apiKey: config.apiKey,
            connectionTimeoutSeconds: 10,
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
            console.error("Typesense search error:", error);
            setStatus(`Search failed: ${error.message || error}`);
            resultsEl.innerHTML = "";
        }
    }

    forms.forEach((form) => {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const input = form.querySelector("[data-typesense-search-input]");
            const query = input ? input.value.trim() : "";
            syncInputs(query);

            const url = new URL(window.location.href);
            if (query) {
                url.searchParams.set("q", query);
            } else {
                url.searchParams.delete("q");
            }
            window.history.replaceState({}, "", url);
            runSearch(query);
        });
    });

    const initialQuery = new URLSearchParams(window.location.search).get("q") || "";
    syncInputs(initialQuery);
    runSearch(initialQuery);
})();
