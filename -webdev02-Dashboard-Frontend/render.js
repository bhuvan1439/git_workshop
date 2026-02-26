function renderBoard() {
    let board = document.getElementById("board");
    if (!board) return;
    board.innerHTML = "";
    [...AppState.columns].sort((a, b) => a.order - b.order).forEach(col => {
        board.appendChild(createColumnElement(col));
    });
    let addColGhost = document.createElement("div");
    addColGhost.style.width = "1px";
    board.appendChild(addColGhost);
    updateActivityBadge();
}
function createColumnElement(col) {
    let colEl = document.createElement("div");
    colEl.className = "column";
    colEl.dataset.id = col.id;
    let cards = getCardsForColumn(col.id).filter(c => matchesSearch(c, AppState.searchQuery));
    colEl.innerHTML = `
        <div class="column-header">
            <div class="column-title-group">
                <div class="column-color-dot" style="background: ${col.color || '#6366f1'}"></div>
                <h3 class="column-title">${escapeHtml(col.title)}</h3>
                <span class="column-count">${cards.length}</span>
            </div>
            <div class="column-actions">
                <button class="column-action-btn edit-col" title="Edit Column">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </button>
                <button class="column-action-btn delete-col" title="Delete Column">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        </div>
        <div class="card-list" data-col-id="${col.id}"></div>
        <button class="add-card-btn" data-col-id="${col.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>Add Card
        </button>
    `;
    let list = colEl.querySelector(".card-list");
    if (cards.length === 0 && !AppState.searchQuery) {
        list.innerHTML = `<div class="empty-state">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="9" x2="15" y2="9"></line>
                <line x1="9" y1="13" x2="15" y2="13"></line>
                <line x1="9" y1="17" x2="13" y2="17"></line>
            </svg>
            <p>No cards yet</p>
        </div>`;
    } else {
        cards.forEach(card => list.appendChild(createCardElement(card)));
    }
    attachColumnListeners(colEl, col.id);
    return colEl;
}
function createCardElement(card) {
    let el = document.createElement("div");
    el.className = "card";
    el.dataset.id = card.id;
    el.draggable = true;
    el.innerHTML = `
        <div class="card-color-bar" style="background: ${card.color || '#6366f1'}"></div>
        <div class="card-content">
            <h4 class="card-title">${escapeHtml(card.title)}</h4>
            ${card.description ? `<p class="card-description">${escapeHtml(card.description)}</p>` : ''}
            <div class="card-meta">
                <div class="card-badges">
                    <span class="priority-badge ${card.priority}">${card.priority}</span>
                </div>
                ${card.assignee ? `<div class="card-assignee"><div class="assignee-avatar">${getInitials(card.assignee)}</div><span>${escapeHtml(card.assignee)}</span></div>` : ''}
            </div>
        </div>
        <div class="card-actions">
            <button class="card-action-btn edit-card"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg></button>
            <button class="card-action-btn delete-card"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
        </div>
    `;
    el.addEventListener("click", e => {
        if (!e.target.closest(".card-action-btn")) openCardModal(card.id);
    });
    el.querySelector(".edit-card").addEventListener("click", e => {
        e.stopPropagation();
        openCardModal(card.id);
    });
    el.querySelector(".delete-card").addEventListener("click", e => {
        e.stopPropagation();
        confirmDelete("Are you sure you want to delete this card?", () => {
            delete AppState.cards[card.id];
            reorderCards(card.columnId);
            addActivity(`Deleted card: ${card.title}`);
            autoSave();
            renderBoard();
        });
    });
    if (typeof initDragEvent === 'function') initDragEvent(el);
    return el;
}
function renderActivityLog() {
    let list = document.getElementById("activityList");
    if (!list) return;
    list.innerHTML = "";
    [...AppState.activityLog].forEach(log => {
        let li = document.createElement("li");
        li.className = "activity-item";
        li.innerHTML = `
            <div class="activity-dot"></div>
            <div class="activity-content">
                <div class="activity-text">${escapeHtml(log.text)}</div>
                <div class="activity-time">${formatTime(log.timestamp)}</div>
            </div>
        `;
        list.appendChild(li);
    });
}
function attachColumnListeners(colEl, colId) {
    colEl.querySelector(".add-card-btn").addEventListener("click", () => openCardModal(null, colId));
    colEl.querySelector(".edit-col").addEventListener("click", () => openColumnModal(colId));
    colEl.querySelector(".delete-col").addEventListener("click", () => {
        confirmDelete("Delete this column and all its cards?", () => {
            getCardsForColumn(colId).forEach(c => delete AppState.cards[c.id]);
            AppState.columns = AppState.columns.filter(c => c.id !== colId);
            AppState.columns.forEach((c, i) => c.order = i);
            addActivity("Deleted column");
            autoSave();
            renderBoard();
        });
    });
}
