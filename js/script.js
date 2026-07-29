/**
 * ON LOT — site scripts (homepage hero CTA, etc.)
 */
(function () {
    const button = document.querySelector("[data-hero-cta]");
    if (!button) {
        return;
    }

    const navDelayMs = 450;
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
    button.addEventListener("touchstart", showActiveText, { passive: true });

    button.addEventListener("click", (event) => {
        event.preventDefault();
        isNavigating = true;
        showActiveText();

        window.setTimeout(() => {
            window.location.href = button.getAttribute("href");
        }, navDelayMs);
    });
})();
