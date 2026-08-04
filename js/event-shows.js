/**
 * ON LOT — horizontal event show strip (events page)
 */
(function () {
    const strips = document.querySelectorAll("[data-event-show-strip]");

    strips.forEach((strip) => {
        const card = strip.querySelector("[data-event-show-card]");
        const tabsContainer = strip.querySelector("[data-event-show-tabs]");
        const vendorsPanel = strip.querySelector("[data-event-show-vendors]");
        const vendorList = strip.querySelector("[data-event-show-vendor-list]");
        const spine = strip.querySelector("[data-event-show-spine]");
        const spineText = strip.querySelector("[data-event-show-spine-text]");
        const flyerImg = strip.querySelector("[data-event-show-flyer-img]");
        const flyerBtn = strip.querySelector("[data-event-show-flyer-btn]");
        const panels = Array.from(strip.querySelectorAll("[data-show-panel]"));

        if (!card || !tabsContainer || !panels.length) {
            return;
        }

        let activeId = panels[0].getAttribute("data-show-panel");

        function getPanel(id) {
            return panels.find((panel) => panel.getAttribute("data-show-panel") === id);
        }

        function setVendorsOpen(isOpen) {
            card.classList.toggle("is-open", isOpen);
            card.classList.toggle("is-closed", !isOpen);

            if (vendorsPanel) {
                vendorsPanel.hidden = !isOpen;
            }

            if (spine) {
                spine.setAttribute("aria-expanded", String(isOpen));
            }
        }

        function renderActiveShow() {
            const panel = getPanel(activeId);
            if (!panel) {
                return;
            }

            const label = panel.getAttribute("data-label") || "";
            const flyer = panel.getAttribute("data-flyer") || "";
            const vendorSource = panel.querySelector(".event-show-vendor-list");

            if (spineText) {
                spineText.textContent = label;
            }

            if (spine) {
                spine.setAttribute("aria-label", `${label} — toggle vendors`);
            }

            if (flyerImg && flyer) {
                flyerImg.src = flyer;
            }

            if (flyerBtn) {
                flyerBtn.setAttribute("aria-label", `${label} event poster, click to expand`);
            }

            if (vendorList && vendorSource) {
                vendorList.innerHTML = vendorSource.innerHTML;
            }

            tabsContainer.innerHTML = "";

            panels.forEach((tabPanel) => {
                const id = tabPanel.getAttribute("data-show-panel");
                if (id === activeId) {
                    return;
                }

                const tabLabel = tabPanel.getAttribute("data-label") || "";
                const tab = document.createElement("button");
                tab.type = "button";
                tab.className = "event-show-tab";
                tab.setAttribute("role", "tab");
                tab.setAttribute("aria-selected", "false");
                tab.setAttribute("data-event-show-tab", "");
                tab.setAttribute("data-show-panel", id);
                tab.setAttribute("aria-label", tabLabel);
                tab.textContent = tabLabel;
                tabsContainer.appendChild(tab);
            });
        }

        renderActiveShow();
        setVendorsOpen(false);

        tabsContainer.addEventListener("click", (event) => {
            const tab = event.target.closest("[data-event-show-tab]");
            if (!tab) {
                return;
            }

            activeId = tab.getAttribute("data-show-panel");
            setVendorsOpen(false);
            renderActiveShow();
        });

        if (spine) {
            spine.addEventListener("click", () => {
                const isOpen = card.classList.contains("is-open");
                setVendorsOpen(!isOpen);
            });
        }
    });
})();
