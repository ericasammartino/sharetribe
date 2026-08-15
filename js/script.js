/**
 * event details carousel controls
 */
(function () {
    const carousels = document.querySelectorAll("[data-event-carousel]");

    carousels.forEach((carousel) => {
        const track = carousel.querySelector("[data-event-scroll-track]");
        const buttons = carousel.querySelectorAll("[data-event-scroll]");

        if (!track || !buttons.length) {
            return;
        }

        function getScrollAmount() {
            const card = track.querySelector(".event-row-details");
            if (!card) {
                return track.clientWidth * 0.8;
            }

            const gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
            return card.getBoundingClientRect().width + gap;
        }

        buttons.forEach((button) => {
            button.addEventListener("click", () => {
                const direction = button.getAttribute("data-event-scroll") === "prev" ? -1 : 1;
                track.scrollBy({
                    left: getScrollAmount() * direction,
                    behavior: "smooth",
                });
            });
        });
    });
})();

/**
 * homepage event thumb expand
 */
(function () {
    const thumbs = document.querySelectorAll("[data-event-thumb]");
    if (!thumbs.length) {
        return;
    }

    function closeExpanded(card) {
        if (!card) {
            return;
        }

        const panel = card.querySelector(".event-expanded");
        card.classList.remove("is-expanded");

        if (panel) {
            panel.hidden = true;
            panel.setAttribute("aria-hidden", "true");
        }
    }

    function openExpanded(thumb) {
        const card = thumb.closest(".events-card");
        const panel = card?.querySelector(".event-expanded");
        const expandedImg = card?.querySelector(".event-expanded-image");
        const img = thumb.querySelector("img");

        if (!card || !panel || !expandedImg || !img) {
            return;
        }

        expandedImg.src = img.src;
        expandedImg.alt = img.alt || thumb.getAttribute("aria-label") || "Expanded event poster";
        panel.hidden = false;
        panel.setAttribute("aria-hidden", "false");
        card.classList.add("is-expanded");
        card.querySelector(".event-expanded-close")?.focus();
    }

    thumbs.forEach((thumb) => {
        thumb.addEventListener("click", () => {
            openExpanded(thumb);
        });
    });

    document.querySelectorAll(".event-expanded-close").forEach((closeBtn) => {
        closeBtn.addEventListener("click", () => {
            closeExpanded(closeBtn.closest(".events-card"));
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") {
            return;
        }

        document.querySelectorAll(".events-card.is-expanded").forEach((card) => {
            closeExpanded(card);
        });
    });
})();


/**
 * event flyer popup modal (homepage + events page)
 */
(function () {
    const modal = document.querySelector("[data-event-flyer-modal]");
    const modalImage = modal?.querySelector(".event-flyer-modal__image");
    const thumbs = document.querySelectorAll("[data-event-thumb]");

    // Legacy inline expand lived inside .events-card — remove so only the modal is used
    document.querySelectorAll(".events-card .event-expanded").forEach((el) => {
        el.remove();
    });

    if (!modal || !modalImage || !thumbs.length) {
        return;
    }

    // Always mount on <body> so position:fixed centers in the viewport (where the user is looking)
    if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
    }

    const closeTriggers = modal.querySelectorAll("[data-event-flyer-close]");
    const closeButton = modal.querySelector(".event-flyer-modal__close");
    let lastFocusedThumb = null;

    function openModal(thumb) {
        const img = thumb.querySelector("img");
        if (!img?.src) {
            return;
        }

        lastFocusedThumb = thumb;
        modalImage.src = img.currentSrc || img.src;
        modalImage.alt = img.alt || thumb.getAttribute("aria-label") || "Event flyer";

        modal.hidden = false;
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("is-event-flyer-modal-open");
        closeButton?.focus();
    }

    function closeModal() {
        modal.classList.remove("is-open");
        modal.hidden = true;
        modal.setAttribute("aria-hidden", "true");
        modalImage.removeAttribute("src");
        modalImage.alt = "";
        document.body.classList.remove("is-event-flyer-modal-open");

        if (lastFocusedThumb) {
            lastFocusedThumb.focus();
            lastFocusedThumb = null;
        }
    }

    thumbs.forEach((thumb) => {
        thumb.addEventListener("click", (event) => {
            event.preventDefault();
            openModal(thumb);
        });
    });

    closeTriggers.forEach((trigger) => {
        trigger.addEventListener("click", (event) => {
            event.preventDefault();
            closeModal();
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("is-open")) {
            closeModal();
        }
    });
})();

/**
 * ON LOT — anchor scroll offset for sticky header (what is on lot? link)
 */
(function () {
    const HASH = "what-is-on-lot";

    function getScrollOffset() {
        const header = document.querySelector(".site-header");
        return (header?.offsetHeight ?? 0) + 16;
    }

    function isIndexPage(pathname) {
        return (
            pathname === "" ||
            pathname === "/" ||
            pathname.endsWith("/index.html")
        );
    }

    function scrollToTarget(behavior = "smooth") {
        const target = document.getElementById(HASH);
        if (!target) {
            return;
        }

        const top = target.getBoundingClientRect().top + window.scrollY - getScrollOffset();
        window.scrollTo({ top: Math.max(0, top), behavior });
    }

    document.addEventListener("click", (event) => {
        const link = event.target.closest("a[href]");
        if (!link) {
            return;
        }

        const url = new URL(link.href, window.location.href);
        if (url.hash !== `#${HASH}` || !isIndexPage(url.pathname)) {
            return;
        }

        if (!isIndexPage(window.location.pathname)) {
            return;
        }

        event.preventDefault();
        history.pushState(null, "", `#${HASH}`);
        scrollToTarget();
    });

    function handleInitialHash() {
        if (window.location.hash !== `#${HASH}`) {
            return;
        }

        scrollToTarget("auto");
    }

    if (document.readyState === "complete") {
        handleInitialHash();
    } else {
        window.addEventListener("load", handleInitialHash);
    }
})();
