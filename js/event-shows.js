/**
 * ON LOT — explicit event show panels + date rail (events page)
 */
(function () {
    const strips = document.querySelectorAll("[data-event-show-strip]");

    strips.forEach((strip) => {
        const panels = Array.from(strip.querySelectorAll("[data-show-panel]"));
        const tabs = Array.from(strip.querySelectorAll("[data-target-show]"));

        if (!panels.length || !tabs.length) {
            return;
        }

        function setActiveShow(targetId) {
            panels.forEach((panel) => {
                const isActive = panel.getAttribute("data-show-panel") === targetId;
                panel.classList.toggle("is-active", isActive);
                panel.hidden = !isActive;
                panel.setAttribute("aria-hidden", String(!isActive));
            });

            tabs.forEach((tab) => {
                const isActive = tab.getAttribute("data-target-show") === targetId;
                tab.classList.toggle("active", isActive);
                tab.setAttribute("aria-selected", String(isActive));
            });
        }

        tabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                setActiveShow(tab.getAttribute("data-target-show"));
            });
        });

        const activePanel = panels.find((panel) => panel.classList.contains("is-active")) || panels[0];
        setActiveShow(activePanel.getAttribute("data-show-panel"));
    });
})();
