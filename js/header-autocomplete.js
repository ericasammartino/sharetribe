/**
 * ON LOT — header search autocomplete (all pages)
 * Requires config/typesense.public.js and Typesense CDN on the page.
 */
(function () {
    const config = window.ON_LOT_TYPESENSE;
    const SEARCH_PAGE = "shop.html";
    const MIN_CHARS = 2;
    const DEBOUNCE_MS = 200;
    const MAX_SUGGESTIONS = 5;

    const headerForms = document.querySelectorAll(".site-header .search-form");
    if (!headerForms.length) {
        return;
    }

    let client = null;
    let debounceTimer = null;

    function getClient() {
        if (!config || !config.apiKey || !config.host || config.apiKey.includes("your_search_only")) {
            return null;
        }

        if (!window.Typesense) {
            return null;
        }

        if (!client) {
            client = new window.Typesense.Client({
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
        }

        return client;
    }

    function formatPrice(value) {
        if (typeof value !== "number") {
            return "";
        }
        return `$${value.toFixed(value % 1 === 0 ? 0 : 2)}`;
    }

    function buildSearchUrl(query) {
        const url = new URL(SEARCH_PAGE, window.location.href);
        url.searchParams.set("q", query);
        return `${url.pathname}${url.search}`;
    }

    function productUrl(slug) {
        return slug ? `product.html?slug=${encodeURIComponent(slug)}` : "#";
    }

    function createAutocompleteState(form) {
        const field = form.querySelector(".search-form-field");
        const input = form.querySelector('input[type="search"], input[name="q"]');
        if (!field || !input) {
            return null;
        }

        const listbox = document.createElement("div");
        listbox.className = "search-autocomplete";
        listbox.hidden = true;
        listbox.id = `search-autocomplete-${Math.random().toString(36).slice(2, 9)}";

        input.setAttribute("aria-autocomplete", "list");
        input.setAttribute("aria-expanded", "false");
        input.setAttribute("aria-controls", listbox.id);

        field.appendChild(listbox);

        return {
            form,
            field,
            input,
            listbox,
            activeIndex: -1,
        };
    }

    function hideAutocomplete(state) {
        state.listbox.hidden = true;
        state.listbox.innerHTML = "";
        state.input.setAttribute("aria-expanded", "false");
        state.input.removeAttribute("aria-activedescendant");
        state.activeIndex = -1;
    }

    function updateActiveItem(state) {
        const items = state.listbox.querySelectorAll(".search-autocomplete-item");
        items.forEach((item, index) => {
            item.classList.toggle("is-active", index === state.activeIndex);
            item.setAttribute("aria-selected", index === state.activeIndex ? "true" : "false");
        });

        if (state.activeIndex >= 0 && items[state.activeIndex]) {
            const activeId = items[state.activeIndex].id || `search-option-${state.activeIndex}`;
            items[state.activeIndex].id = activeId;
            state.input.setAttribute("aria-activedescendant", activeId);
        } else {
            state.input.removeAttribute("aria-activedescendant");
        }
    }

    function showSuggestions(state, hits, query) {
        if (!hits.length) {
            hideAutocomplete(state);
            return;
        }

        const productItems = hits
            .map((hit, index) => {
                const doc = hit.document;
                const thumb = doc.image
                    ? `<img src="${doc.image}" alt="">`
                    : `<span class="search-autocomplete-thumb-placeholder" aria-hidden="true"></span>`;

                return `
                    <a
                        href="${productUrl(doc.slug)}"
                        class="search-autocomplete-item"
                        role="option"
                        id="search-option-${index}"
                        data-index="${index}"
                    >
                        <span class="search-autocomplete-thumb">${thumb}</span>
                        <span class="search-autocomplete-text">
                            <span class="search-autocomplete-name">${doc.name}</span>
                            ${doc.vendor ? `<span class="search-autocomplete-vendor">${doc.vendor}</span>` : ""}
                        </span>
                        <span class="search-autocomplete-price">${formatPrice(doc.price)}</span>
                    </a>
                `;
            })
            .join("");

        const viewAllIndex = hits.length;
        const viewAllItem = `
            <a
                href="${buildSearchUrl(query)}"
                class="search-autocomplete-item search-autocomplete-all"
                role="option"
                id="search-option-${viewAllIndex}"
                data-index="${viewAllIndex}"
            >
                View all results for “${query}”
            </a>
        `;

        state.listbox.innerHTML = productItems + viewAllItem;
        state.listbox.hidden = false;
        state.input.setAttribute("aria-expanded", "true");
        state.activeIndex = -1;
        updateActiveItem(state);
    }

    async function fetchSuggestions(query) {
        const typesense = getClient();
        if (!typesense) {
            return [];
        }

        const result = await typesense
            .collections(config.collection || "products")
            .documents()
            .search({
                q: query,
                query_by: "name,vendor,category",
                prefix: true,
                per_page: MAX_SUGGESTIONS,
                drop_tokens_threshold: 0,
                typo_tokens_threshold: 0,
            });

        return result.hits || [];
    }

    function onInput(state) {
        const query = state.input.value.trim();
        clearTimeout(debounceTimer);

        if (query.length < MIN_CHARS) {
            hideAutocomplete(state);
            return;
        }

        debounceTimer = setTimeout(async () => {
            const currentQuery = state.input.value.trim();
            if (currentQuery.length < MIN_CHARS) {
                hideAutocomplete(state);
                return;
            }

            try {
                const hits = await fetchSuggestions(currentQuery);
                if (state.input.value.trim() !== currentQuery) {
                    return;
                }
                showSuggestions(state, hits, currentQuery);
            } catch (error) {
                console.error("Header autocomplete error:", error);
                hideAutocomplete(state);
            }
        }, DEBOUNCE_MS);
    }

    function onKeydown(event, state) {
        if (state.listbox.hidden) {
            return;
        }

        const items = state.listbox.querySelectorAll(".search-autocomplete-item");
        if (!items.length) {
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            state.activeIndex = Math.min(state.activeIndex + 1, items.length - 1);
            updateActiveItem(state);
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            state.activeIndex = Math.max(state.activeIndex - 1, -1);
            updateActiveItem(state);
        } else if (event.key === "Escape") {
            hideAutocomplete(state);
        } else if (event.key === "Enter" && state.activeIndex >= 0) {
            event.preventDefault();
            items[state.activeIndex].click();
        }
    }

    function onSubmit(event, state) {
        const query = state.input.value.trim();
        hideAutocomplete(state);

        if (!query) {
            return;
        }

        if (state.form.hasAttribute("data-typesense-search-form")) {
            return;
        }

        event.preventDefault();
        window.location.href = buildSearchUrl(query);
    }

    const states = headerForms
        .map(createAutocompleteState)
        .filter(Boolean);

    states.forEach((state) => {
        state.input.addEventListener("input", () => onInput(state));
        state.input.addEventListener("keydown", (event) => onKeydown(event, state));
        state.input.addEventListener("blur", () => {
            setTimeout(() => hideAutocomplete(state), 150);
        });
        state.form.addEventListener("submit", (event) => onSubmit(event, state));
        state.listbox.addEventListener("mousedown", (event) => {
            if (event.target.closest(".search-autocomplete-item")) {
                event.preventDefault();
            }
        });
    });

    document.addEventListener("click", (event) => {
        states.forEach((state) => {
            if (!state.field.contains(event.target)) {
                hideAutocomplete(state);
            }
        });
    });
})();
