function debounce(fn, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
    };
}
function throttle(fn, delay) {
    let lastCall = 0;
    return function (...args) {
        let now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            fn.apply(this, args);
        }
    };
}
function escapeHtml(str) {
    if (!str) return "";
    let div = document.createElement("div");
    div.innerText = str;
    return div.innerHTML;
}
function formatTime(timestamp) {
    let diff = Date.now() - timestamp;
    if (diff < 6e4) return "just now";
    if (diff < 36e5) return Math.floor(diff / 6e4) + "m ago";
    if (diff < 864e5) return Math.floor(diff / 36e5) + "h ago";
    if (diff < 6048e5) return Math.floor(diff / 864e5) + "d ago";
    return new Date(timestamp).toLocaleDateString();
}
function getInitials(name) {
    if (!name) return "?";
    let parts = name.trim().split(/\s+/);
    return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
function showToast(msg, duration = 3000) {
    let container = document.getElementById("toastContainer");
    if (!container) return;
    let toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> ${escapeHtml(msg)}`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add("leaving"), duration);
    setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, duration + 300);
}
function matchesSearch(card, query) {
    if (!query) return true;
    let q = query.toLowerCase();
    return (card.title || "").toLowerCase().includes(q) ||
        (card.description || "").toLowerCase().includes(q) ||
        (card.assignee || "").toLowerCase().includes(q);
}
function reorderCards(colId) {
    let cards = getCardsForColumn(colId);
    cards.forEach((card, index) => {
        AppState.cards[card.id].order = index;
    });
}
