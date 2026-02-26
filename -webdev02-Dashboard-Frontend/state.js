let AppState = {
    columns: [],
    cards: {},
    activityLog: [],
    darkMode: false,
    searchQuery: "",
    dragState: { dragging: false, cardId: null, sourceCol: null, ghostEl: null },
    editingCard: null,
    editingColumn: null,
    editingCardColId: null,
    confirmCallback: null
};
function generateId() { return "_" + Math.random().toString(36).substr(2, 9) + Date.now().toString(36); }
function getDefaultColumns() {
    return [
        { id: generateId(), title: "Backlog", color: "#6366f1", order: 0 },
        { id: generateId(), title: "In Progress", color: "#f59e0b", order: 1 },
        { id: generateId(), title: "Review", color: "#ec4899", order: 2 },
        { id: generateId(), title: "Done", color: "#10b981", order: 3 }
    ];
}
function getDefaultCards(cols) {
    let cards = {}, c1 = cols[0].id, c2 = cols[1].id, c3 = cols[2].id;
    cards[generateId()] = { title: "Set up project structure", description: "Initialize the repository and configure the build pipeline for the frontend application.", priority: "high", assignee: "Alex", color: "#6366f1", columnId: c1, order: 0, created: Date.now() - 864e5 };
    cards[generateId()] = { title: "Design system tokens", description: "Define typography, colors, spacing, and other design tokens.", priority: "medium", assignee: "Sara", color: "#ec4899", columnId: c1, order: 1, created: Date.now() - 72e6 };
    cards[generateId()] = { title: "Implement drag and drop", description: "Add drag and drop functionality for cards between columns.", priority: "high", assignee: "Mike", color: "#14b8a6", columnId: c2, order: 0, created: Date.now() - 5e7 };
    cards[generateId()] = { title: "Write unit tests", description: "Add test coverage for core utility functions and state management.", priority: "low", assignee: "Alex", color: "#f59e0b", columnId: c2, order: 1, created: Date.now() - 4e7 };
    cards[generateId()] = { title: "API integration review", description: "Review the REST API integration layer for consistency and error handling.", priority: "medium", assignee: "Sara", color: "#8b5cf6", columnId: c3, order: 0, created: Date.now() - 3e7 };
    return cards;
}
function addActivity(text) {
    AppState.activityLog.unshift({ id: generateId(), text, timestamp: Date.now() });
    if (AppState.activityLog.length > 50) AppState.activityLog = AppState.activityLog.slice(0, 50);
    updateActivityBadge();
    let ap = document.getElementById("activityPanel");
    if (ap && ap.classList.contains("open")) renderActivityLog();
}
function updateActivityBadge() {
    let badge = document.getElementById("activityBadge");
    if (!badge) return;
    let count = AppState.activityLog.length;
    badge.textContent = count > 99 ? "99+" : count;
    badge.style.display = count > 0 ? "flex" : "none";
}
function getCardsForColumn(colId) {
    return Object.keys(AppState.cards)
        .map(key => Object.assign({ id: key }, AppState.cards[key]))
        .filter(card => card.columnId === colId)
        .sort((a, b) => a.order - b.order);
}
