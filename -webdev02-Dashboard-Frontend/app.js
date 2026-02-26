document.addEventListener("DOMContentLoaded", initApp);
function initApp() {
    loadTheme();
    if (!loadFromStorage()) {
        AppState.columns = getDefaultColumns();
        AppState.cards = getDefaultCards(AppState.columns);
        AppState.activityLog = [];
        addActivity("Initialized new board");
    }
    setupEventListeners();
    setupModalHandlers();
    setupBoardDragHandlers();
    renderBoard();
    updateActivityBadge();
}
function setupEventListeners() {
    let searchInput = document.getElementById("searchInput");
    searchInput.addEventListener("input", e => {
        AppState.searchQuery = e.target.value;
        renderBoard();
    });
    document.getElementById("darkModeToggle").addEventListener("click", () => {
        AppState.darkMode = !AppState.darkMode;
        if (AppState.darkMode) {
            document.documentElement.setAttribute("data-theme", "dark");
        } else {
            document.documentElement.removeAttribute("data-theme");
        }
        saveTheme();
    });
    let activityPanel = document.getElementById("activityPanel");
    document.getElementById("activityToggle").addEventListener("click", () => {
        activityPanel.classList.toggle("open");
        if (activityPanel.classList.contains("open")) {
            renderActivityLog();
        }
    });
    document.getElementById("closeActivity").addEventListener("click", () => {
        activityPanel.classList.remove("open");
    });
    document.getElementById("clearActivity").addEventListener("click", () => {
        AppState.activityLog = [];
        updateActivityBadge();
        renderActivityLog();
        autoSave();
    });
    document.getElementById("addColumnBtn").addEventListener("click", () => {
        openColumnModal();
    });
}
window.onresize = function () { renderBoard() };
