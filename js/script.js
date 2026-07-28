/**
 * ON LOT — site scripts (homepage hero CTA, etc.)
 */
(function () {
    const button = document.querySelector("[data-hero-cta]");
    if (!button) {
        return;
    }

    const defaultText = button.textContent.trim();
    const activeText = "come poke around";
    const navDelayMs = 450;
    let isNavigating = false;

    function setText(text) {
        button.textContent = text;
    }

    function showActiveText() {
        setText(activeText);
    }

    function showDefaultText() {
        if (!isNavigating) {
            setText(defaultText);
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
