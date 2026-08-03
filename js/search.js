/**
 * ON LOT — Typesense search + shop filters (shop.html)
 * Requires config/typesense.public.js and Typesense CDN on the page.
 */
(function () {
    const config = window.ON_LOT_TYPESENSE;
    const inputs = document.querySelectorAll("[data-typesense-search-input]");
    const forms = document.querySelectorAll("[data-typesense-search-form]");
    const statusEl = document.querySelector("[data-search-status]");
    const resultsEl = document.querySelector("[data-search-results]");
    const titleEl = document.querySelector("[data-search-query-label]");
    const shopMain = document.querySelector("main.shop-page");
    const isShopPage = Boolean(shopMain);
    const filterForm = document.querySelector("[data-shop-filter-form]");
    const filterPanel = document.getElementById("shop-filters");
    const filterToggle = document.querySelector(".shop-filter-btn");
    const filterClearBtn = document.querySelector("[data-shop-filter-clear]");
    const bandSelect = document.querySelector("[data-shop-filter-band]");
    const categoryInputs = document.querySelectorAll("[data-shop-filter-category]");

    const browseSelectors = "main.shop-page .shop-sections";

    const BAND_LABELS = {
        "billy-strings": "Billy Strings",
        phish: "Phish",
        "grateful-dead": "Grateful Dead",
        "widespread-panic": "Widespread Panic",
        goose: "Goose",
    };

    const CATEGORY_LABELS = {
        pins: "pins",
        clothing: "clothing",
        jewelry: "jewelry",
        housewares: "housewares",
        "handmade-art": "handmade art",
    };

    function getBrowseElements() {
        return document.querySelectorAll(browseSelectors);
    }

    function getResultsWraps() {
        return document.querySelectorAll("[data-shop-search-results], main.shop-page .shop-search-results");
    }

    function setStatus(message) {
        if (statusEl) {
            statusEl.textContent = message;
        }
    }

    function setResultsMode(isActive) {
        getBrowseElements().forEach((el) => {
            el.style.display = isActive ? "none" : "";
            el.hidden = isActive;
        });

        getResultsWraps().forEach((el) => {
            el.style.display = isActive ? "" : "none";
            el.hidden = !isActive;
        });

        if (shopMain) {
            shopMain.classList.toggle("is-search-mode", isActive);
        }
    }

    function syncInputs(value) {
        inputs.forEach((input) => {
            input.value = value;
        });
    }

    function readSearchQuery(sourceForm) {
        if (sourceForm) {
            const formInput = sourceForm.querySelector("[data-typesense-search-input]");
            const formValue = formInput ? formInput.value.trim() : "";
            if (formValue) {
                return formValue;
            }
        }

        for (const input of inputs) {
            const value = input.value.trim();
            if (value) {
                return value;
            }
        }

        const fromUrl = new URLSearchParams(window.location.search).get("q");
        return fromUrl ? fromUrl.trim() : "";
    }

    function readSelectedCategories() {
        return Array.from(categoryInputs)
            .filter((input) => input.checked)
            .map((input) => input.value);
    }

    function readSelectedBand() {
        return bandSelect ? bandSelect.value.trim() : "";
    }

    function applyFiltersToForm(categories, band) {
        categoryInputs.forEach((input) => {
            input.checked = categories.includes(input.value);
        });

        if (bandSelect) {
            bandSelect.value = band;
        }
    }

    function readFiltersFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const categories = params.getAll("category").filter(Boolean);
        const band = params.get("band") || "";
        return { categories, band };
    }

    function writeUrl(query, categories, band) {
        const url = new URL(window.location.href);
        url.search = "";

        if (query) {
            url.searchParams.set("q", query);
        }

        categories.forEach((category) => {
            url.searchParams.append("category", category);
        });

        if (band) {
            url.searchParams.set("band", band);
        }

        window.history.replaceState({}, "", url);
    }

    function buildFilterBy(categories, band) {
        const parts = [];

        if (categories.length) {
            const categoryFilter = categories
                .map((category) => `category:=${category}`)
                .join(" || ");
            parts.push(`(${categoryFilter})`);
        }

        if (band) {
            parts.push(`band:=${band}`);
        }

        return parts.join(" && ");
    }

    function formatPrice(value) {
        if (typeof value !== "number") {
            return "";
        }
        return `$${value.toFixed(value % 1 === 0 ? 0 : 2)}`;
    }

    function buildResultsTitle(query, categories, band) {
        if (!isShopPage) {
            return query ? `Results for “${query}”` : "Search";
        }

        const parts = [];

        if (band && BAND_LABELS[band]) {
            parts.push(BAND_LABELS[band]);
        }

        if (categories.length) {
            parts.push(
                categories
                    .map((category) => CATEGORY_LABELS[category] || category)
                    .join(", ")
            );
        }

        if (query) {
            parts.push(`“${query}”`);
        }

        if (!parts.length) {
            return "Shop";
        }

        return `Shop — ${parts.join(" · ")}`;
    }

    function renderResults(hits, query, categories, band) {
        const trimmed = (query || "").trim();
        const hasFilters = categories.length > 0 || Boolean(band);
        const isActive = Boolean(trimmed) || hasFilters;

        if (titleEl) {
            titleEl.textContent = buildResultsTitle(trimmed, categories, band);
        }

        if (!isActive) {
            if (resultsEl) {
                resultsEl.innerHTML = "";
            }
            setResultsMode(false);
            if (!isShopPage) {
                setStatus("Enter a search term above.");
            }
            return;
        }

        setResultsMode(true);

        if (!hits.length) {
            if (resultsEl) {
                resultsEl.innerHTML = "";
            }
            setStatus("No products found. Try adjusting your filters or search.");
            return;
        }

        setStatus(`${hits.length} result${hits.length === 1 ? "" : "s"}`);

        if (!resultsEl) {
            return;
        }

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

    async function runSearch(query, categories, band) {
        const trimmed = (query || "").trim();
        const hasFilters = categories.length > 0 || Boolean(band);

        if (!trimmed && !hasFilters) {
            renderResults([], "", [], "");
            return;
        }

        if (!config || !config.apiKey || !config.host) {
            setResultsMode(true);
            setStatus("Search config missing. Create config/typesense.public.js with your search-only API key.");
            if (resultsEl) {
                resultsEl.innerHTML = "";
            }
            return;
        }

        if (config.apiKey.includes("your_search_only")) {
            setResultsMode(true);
            setStatus("Replace the placeholder API key in config/typesense.public.js.");
            if (resultsEl) {
                resultsEl.innerHTML = "";
            }
            return;
        }

        if (!window.Typesense) {
            setResultsMode(true);
            setStatus("Typesense library failed to load. Check your internet connection.");
            return;
        }

        setResultsMode(true);
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

        const searchParams = {
            q: trimmed || "*",
            query_by: "name,vendor,description,category,band",
            per_page: 48,
            drop_tokens_threshold: 0,
            typo_tokens_threshold: 0,
        };

        const filterBy = buildFilterBy(categories, band);
        if (filterBy) {
            searchParams.filter_by = filterBy;
        }

        try {
            const result = await client
                .collections(config.collection || "products")
                .documents()
                .search(searchParams);

            renderResults(result.hits || [], trimmed, categories, band);
        } catch (error) {
            console.error("Typesense search error:", error);
            setStatus(`Search failed: ${error.message || error}`);
            if (resultsEl) {
                resultsEl.innerHTML = "";
            }
        }
    }

    function bindFilterPanel() {
        if (!filterToggle || !filterPanel) {
            return;
        }

        filterToggle.addEventListener("click", () => {
            const isOpen = filterToggle.getAttribute("aria-expanded") === "true";
            filterToggle.setAttribute("aria-expanded", String(!isOpen));
            filterPanel.hidden = isOpen;
        });
    }

    function refreshFromState(sourceForm) {
        const query = readSearchQuery(sourceForm);
        const categories = readSelectedCategories();
        const band = readSelectedBand();
        syncInputs(query);
        writeUrl(query, categories, band);
        runSearch(query, categories, band);
    }

    function bindSearchForm(form) {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            refreshFromState(form);
        });
    }

    forms.forEach(bindSearchForm);

    if (isShopPage) {
        shopMain.querySelectorAll(".shop-search-form, .search-form").forEach((form) => {
            if (!form.hasAttribute("data-typesense-search-form")) {
                form.setAttribute("data-typesense-search-form", "");
                const input = form.querySelector('input[type="search"], input[name="q"]');
                if (input && !input.hasAttribute("data-typesense-search-input")) {
                    input.setAttribute("data-typesense-search-input", "");
                }
                bindSearchForm(form);
            }
        });
    }

    if (filterForm) {
        filterForm.addEventListener("submit", (event) => {
            event.preventDefault();
            refreshFromState();
        });
    }

    if (filterClearBtn) {
        filterClearBtn.addEventListener("click", () => {
            applyFiltersToForm([], "");
            syncInputs("");
            writeUrl("", [], "");
            runSearch("", [], "");
        });
    }

    bindFilterPanel();

    if (resultsEl || isShopPage) {
        const initialFilters = readFiltersFromUrl();
        applyFiltersToForm(initialFilters.categories, initialFilters.band);
        const initialQuery = readSearchQuery();
        syncInputs(initialQuery);
        runSearch(initialQuery, initialFilters.categories, initialFilters.band);
    }
})();
