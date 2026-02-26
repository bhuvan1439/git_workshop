function openCardModal(cardId = null, colId = null) {
    AppState.editingCard = cardId;
    let titleEl = document.getElementById("cardTitle");
    let descEl = document.getElementById("cardDesc");
    let assigneeEl = document.getElementById("cardAssignee");
    let modalTitle = document.getElementById("modalTitle");
    if (cardId && AppState.cards[cardId]) {
        let card = AppState.cards[cardId];
        modalTitle.textContent = "Edit Card";
        titleEl.value = card.title;
        descEl.value = card.description || "";
        assigneeEl.value = card.assignee || "";
        document.querySelectorAll("#colorOptions .color-swatch").forEach(el => {
            el.classList.toggle("active", el.dataset.color === card.color);
        });
        document.querySelectorAll('input[name="priority"]').forEach(el => {
            el.checked = (el.value === card.priority);
        });
    } else {
        modalTitle.textContent = "Add Card";
        titleEl.value = "";
        descEl.value = "";
        assigneeEl.value = "";
        let medPri = document.querySelector('input[name="priority"][value="medium"]');
        if (medPri) medPri.checked = true;
        document.querySelectorAll("#colorOptions .color-swatch").forEach((el, index) => {
            el.classList.toggle("active", index === 0);
        });
        AppState.editingCardColId = colId || null;
    }
    document.getElementById("modalOverlay").classList.add("active");
    titleEl.focus();
}
function closeCardModal() {
    document.getElementById("modalOverlay").classList.remove("active");
    AppState.editingCard = null;
    AppState.editingCardColId = null;
}
function openColumnModal(colId = null) {
    AppState.editingColumn = colId;
    let titleEl = document.getElementById("columnName");
    let modalTitle = document.getElementById("columnModalTitle");
    if (colId) {
        let col = AppState.columns.find(c => c.id === colId);
        if (!col) return;
        modalTitle.textContent = "Edit Column";
        titleEl.value = col.title;
        document.querySelectorAll("#columnColorOptions .color-swatch").forEach(el => {
            el.classList.toggle("active", el.dataset.color === col.color);
        });
    } else {
        modalTitle.textContent = "Add Column";
        titleEl.value = "";
        document.querySelectorAll("#columnColorOptions .color-swatch").forEach((el, index) => {
            el.classList.toggle("active", index === 0);
        });
    }
    document.getElementById("columnModalOverlay").classList.add("active");
    titleEl.focus();
}
function closeColumnModal() {
    document.getElementById("columnModalOverlay").classList.remove("active");
    AppState.editingColumn = null;
}
function confirmDelete(msg, callback) {
    document.getElementById("confirmMessage").textContent = msg;
    document.getElementById("confirmModalOverlay").classList.add("active");
    AppState.confirmCallback = callback;
}
function closeConfirmModal() {
    document.getElementById("confirmModalOverlay").classList.remove("active");
    AppState.confirmCallback = null;
}
function setupModalHandlers() {
    document.getElementById("closeModal").addEventListener("click", closeCardModal);
    document.getElementById("cancelModal").addEventListener("click", closeCardModal);
    document.getElementById("closeColumnModal").addEventListener("click", closeColumnModal);
    document.getElementById("cancelColumnModal").addEventListener("click", closeColumnModal);
    document.getElementById("confirmCancel").addEventListener("click", closeConfirmModal);
    document.getElementById("confirmOk").addEventListener("click", () => {
        if (AppState.confirmCallback) AppState.confirmCallback();
        closeConfirmModal();
    });
    document.getElementById("saveCard").addEventListener("click", () => {
        let title = document.getElementById("cardTitle").value.trim();
        if (!title) return showToast("Title is required");
        let desc = document.getElementById("cardDesc").value.trim();
        let assignee = document.getElementById("cardAssignee").value.trim();
        let priEl = document.querySelector('input[name="priority"]:checked');
        let priority = priEl ? priEl.value : 'medium';
        let colorEl = document.querySelector("#colorOptions .color-swatch.active");
        let color = colorEl ? colorEl.dataset.color : "#6366f1";
        if (AppState.editingCard) {
            let card = AppState.cards[AppState.editingCard];
            if (card) {
                card.title = title;
                card.description = desc;
                card.assignee = assignee;
                card.priority = priority;
                card.color = color;
                addActivity(`Updated card: ${title}`);
            }
        } else {
            let colId = AppState.editingCardColId || (AppState.columns[0] ? AppState.columns[0].id : null);
            if (!colId) return showToast("Create a column first!");
            let id = generateId();
            let cardsInCol = getCardsForColumn(colId);
            AppState.cards[id] = {
                title, description: desc, assignee, priority, color, columnId: colId,
                order: cardsInCol.length, created: Date.now()
            };
            addActivity(`Added card: ${title}`);
        }
        autoSave();
        closeCardModal();
        renderBoard();
    });
    document.getElementById("saveColumn").addEventListener("click", () => {
        let title = document.getElementById("columnName").value.trim();
        if (!title) return showToast("Name is required");
        let colorEl = document.querySelector("#columnColorOptions .color-swatch.active");
        let color = colorEl ? colorEl.dataset.color : "#6366f1";
        if (AppState.editingColumn) {
            let col = AppState.columns.find(c => c.id === AppState.editingColumn);
            if (col) {
                col.title = title;
                col.color = color;
                addActivity("Updated column");
            }
        } else {
            AppState.columns.push({
                id: generateId(), title, color, order: AppState.columns.length
            });
            addActivity(`Added column: ${title}`);
        }
        autoSave();
        closeColumnModal();
        renderBoard();
    });
    document.querySelectorAll(".color-options").forEach(group => {
        group.addEventListener("click", e => {
            let swatch = e.target.closest(".color-swatch");
            if (swatch) {
                group.querySelectorAll(".color-swatch").forEach(el => el.classList.remove("active"));
                swatch.classList.add("active");
            }
        });
    });
}
