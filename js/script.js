/**
 * ON LOT — site scripts (homepage hero CTA, etc.)
 */
(function () {
    const button = document.querySelector("[data-hero-cta]");
    if (!button) {
        return;
    }

    const navDelayMs = 800;
    let isNavigating = false;

    function showActiveText() {
        button.classList.add("is-active");
    }

    function showDefaultText() {
        if (!isNavigating) {
            button.classList.remove("is-active");
        }
    }

    button.addEventListener("mouseenter", showActiveText);
    button.addEventListener("mouseleave", showDefaultText);
    button.addEventListener("focus", showActiveText);
    button.addEventListener("blur", showDefaultText);
    button.addEventListener("mousedown", (event) => {
        event.preventDefault();
    });
    button.addEventListener("touchstart", showActiveText, { passive: true });
    button.addEventListener("touchend", () => {
        if (!isNavigating) {
            window.setTimeout(showDefaultText, 350);
        }
    }, { passive: true });

    button.addEventListener("click", (event) => {
        event.preventDefault();
        isNavigating = true;
        showActiveText();

        window.setTimeout(() => {
            window.location.href = button.getAttribute("href");
        }, navDelayMs);
    });
})();

/**
 * ON LOT — homepage event thumb expand
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
            const card = thumb.closest(".events-card");
            if (card?.classList.contains("is-expanded")) {
                closeExpanded(card);
            } else {
                openExpanded(thumb);
            }
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
