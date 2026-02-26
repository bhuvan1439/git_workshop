function initDragEvent(cardEl) {
    cardEl.addEventListener("dragstart", e => {
        if (e.target.closest('.card-action-btn')) { e.preventDefault(); return; }
        AppState.dragState.dragging = true;
        AppState.dragState.cardId = cardEl.dataset.id;
        AppState.dragState.sourceCol = cardEl.closest(".card-list").dataset.colId;
        cardEl.classList.add("dragging");
        e.dataTransfer.setData("text/plain", AppState.dragState.cardId);
        e.dataTransfer.effectAllowed = "move";
        document.querySelectorAll(".card-list").forEach(list => list.classList.add("drop-target"));
    });
    cardEl.addEventListener("dragend", e => {
        cardEl.classList.remove("dragging");
        AppState.dragState.dragging = false;
        document.querySelectorAll(".card-list").forEach(list => {
            list.classList.remove("drop-target", "drag-over");
        });
    });
}
function setupBoardDragHandlers() {
    let board = document.getElementById("board");
    if (!board) return;
    board.addEventListener("dragover", e => {
        e.preventDefault();
        let list = e.target.closest(".card-list");
        if (list) list.classList.add("drag-over");
    });
    board.addEventListener("dragleave", e => {
        let list = e.target.closest(".card-list");
        if (list && !list.contains(e.relatedTarget)) list.classList.remove("drag-over");
    });
    board.addEventListener("drop", e => {
        e.preventDefault();
        let list = e.target.closest(".card-list");
        if (list) {
            let cardId = e.dataTransfer.getData("text/plain");
            let newColId = list.dataset.colId;
            let afterElement = getDragAfterElement(list, e.clientY);
            moveCard(cardId, newColId, afterElement ? afterElement.dataset.id : null);
        }
    });
}
function getDragAfterElement(container, y) {
    let draggableElements = [...container.querySelectorAll(".card:not(.dragging)")];
    return draggableElements.reduce((closest, child) => {
        let box = child.getBoundingClientRect();
        let offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}
function moveCard(cardId, targetColId, afterCardId) {
    let card = AppState.cards[cardId];
    if (!card) return;
    let oldCol = card.columnId;
    card.columnId = targetColId;
    reorderCards(oldCol);
    let targetCards = getCardsForColumn(targetColId).filter(c => c.id !== cardId);
    if (afterCardId) {
        let insertIndex = targetCards.findIndex(c => c.id === afterCardId);
        targetCards.splice(insertIndex, 0, card);
    } else {
        targetCards.push(card);
    }
    targetCards.forEach((c, index) => {
        AppState.cards[c.id].order = index;
    });
    if (oldCol !== targetColId) addActivity(`Moved card to new column`);
    autoSave();
    renderBoard();
}
