const STORAGE_KEY = "kanban_board_data";
const THEME_KEY = "kanban_theme";

function saveToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            columns: AppState.columns,
            cards: AppState.cards,
            activityLog: AppState.activityLog
        }));
    } catch (e) {
        console.warn("Storage save failed:", e);
    }
}

function loadFromStorage() {
    try {
        let data = localStorage.getItem(STORAGE_KEY);
        if (!data) return false;
        let parsed = JSON.parse(data);
        if (parsed.columns && parsed.columns.length) AppState.columns = parsed.columns;
        if (parsed.cards) AppState.cards = parsed.cards;
        if (parsed.activityLog) AppState.activityLog = parsed.activityLog;
        return true;
    } catch (e) {
        console.warn("Storage load failed:", e);
        localStorage.removeItem(STORAGE_KEY);
        return false;
    }
}

function loadTheme() {
    let theme = localStorage.getItem(THEME_KEY);
    if (theme === "dark") {
        AppState.darkMode = true;
        document.documentElement.setAttribute("data-theme", "dark");
    } else {
        AppState.darkMode = false;
        document.documentElement.removeAttribute("data-theme");
    }
}

function saveTheme() {
    localStorage.setItem(THEME_KEY, AppState.darkMode ? "dark" : "light");
}

function clearStorage() {
    localStorage.removeItem(STORAGE_KEY);
}

const autoSave = debounce(() => saveToStorage(), 500);
