/**
 * ON LOT — homepage event flyer popup modal
 */
(function () {
    const modal = document.querySelector("[data-event-flyer-modal]");
    const modalImage = modal?.querySelector(".event-flyer-modal__image");
    const thumbs = document.querySelectorAll("[data-event-thumb]");

    if (!modal || !modalImage || !thumbs.length) {
        return;
    }

    const closeTriggers = modal.querySelectorAll("[data-event-flyer-close]");
    const closeButton = modal.querySelector(".event-flyer-modal__close");
    let lastFocusedThumb = null;

    function openModal(thumb) {
        const img = thumb.querySelector("img");
        if (!img) {
            return;
        }

        lastFocusedThumb = thumb;
        modalImage.src = img.src;
        modalImage.alt = img.alt || thumb.getAttribute("aria-label") || "Event flyer";

        modal.hidden = false;
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("is-event-flyer-modal-open");
        closeButton?.focus();
    }

    function closeModal() {
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
        thumb.addEventListener("click", () => {
            openModal(thumb);
        });
    });

    closeTriggers.forEach((trigger) => {
        trigger.addEventListener("click", () => {
            closeModal();
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !modal.hidden) {
            closeModal();
        }
    });
})();
