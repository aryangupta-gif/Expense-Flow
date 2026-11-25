
// ==================================
// 1. GET HTML ELEMENTS
// ==================================

const openForm = document.getElementById("openForm");
const closeForm = document.getElementById("closeForm");

const modal = document.getElementById("transactionModal");
const transactionForm = document.getElementById("transactionForm");

const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

const balanceElement = document.getElementById("balance");
const incomeElement = document.getElementById("income");
const expenseElement = document.getElementById("expense");

const transactionList = document.getElementById("transactionList");
const emptyMessage = document.getElementById("emptyMessage");

const searchInput = document.getElementById("search");
const filterInput = document.getElementById("filter");


// ==================================
// 2. LOCAL STORAGE
// ==================================

let transactions = [];

try {
    const savedData = JSON.parse(
        localStorage.getItem("expenseTransactions")
    );

    transactions = Array.isArray(savedData) ? savedData : [];
} catch (error) {
    transactions = [];
}

// Save transactions in browser
function saveData() {
    localStorage.setItem(
        "expenseTransactions",
        JSON.stringify(transactions)
    );
}


// ==================================
// 3. FORMAT CURRENCY AND DATE
// ==================================

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(amount);
}

function formatDate(date) {
    return new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function setTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    dateInput.value = `${year}-${month}-${day}`;
}


// ==================================
// 4. OPEN AND CLOSE MODAL
// ==================================

openForm.addEventListener("click", () => {
    modal.classList.add("show");
    setTodayDate();
});

closeForm.addEventListener("click", () => {
    modal.classList.remove("show");
});

modal.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.classList.remove("show");
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        modal.classList.remove("show");
    }
});


// ==================================
// 5. ADD NEW TRANSACTION
// ==================================

transactionForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const title = titleInput.value.trim();
    const amount = Number(amountInput.value);
    const type = typeInput.value;
    const category = categoryInput.value;
    const date = dateInput.value;

    if (!title || !Number.isFinite(amount) || amount <= 0 || !date) {
        alert("Please enter valid transaction details.");
        return;
    }

    const newTransaction = {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        title: title,
        amount: amount,
        type: type,
        category: category,
        date: date
    };

    // Add transaction to array
    transactions.push(newTransaction);

    // Save and update dashboard
    saveData();
    renderTransactions();
    updateDashboard();

    // Reset form
    transactionForm.reset();
    setTodayDate();

    // Close modal
    modal.classList.remove("show");

    alert("Transaction added successfully!");
});


// ==================================
// 6. UPDATE DASHBOARD
// ==================================

function updateDashboard() {

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((transaction) => {

        if (transaction.type === "income") {
            totalIncome += Number(transaction.amount);
        } else if (transaction.type === "expense") {
            totalExpense += Number(transaction.amount);
        }

    });

    const balance = totalIncome - totalExpense;

    balanceElement.textContent = formatCurrency(balance);
    incomeElement.textContent = formatCurrency(totalIncome);
    expenseElement.textContent = formatCurrency(totalExpense);
}


// ==================================
// 7. DISPLAY TRANSACTIONS
// ==================================

function renderTransactions() {

    transactionList.innerHTML = "";

    const searchText = searchInput.value.toLowerCase();
    const selectedFilter = filterInput.value;

    // Search and filter
    const filteredTransactions = transactions.filter((transaction) => {

        const matchesSearch =
            transaction.title.toLowerCase().includes(searchText) ||
            transaction.category.toLowerCase().includes(searchText);

        const matchesFilter =
            selectedFilter === "all" ||
            transaction.type === selectedFilter;

        return matchesSearch && matchesFilter;

    });

    // Sort by newest date
    filteredTransactions.sort((a, b) => {
        return b.date.localeCompare(a.date) || b.id.localeCompare(a.id);
    });

    // Empty state
    emptyMessage.style.display =
        filteredTransactions.length === 0 ? "block" : "none";

    // Create transaction rows
    filteredTransactions.forEach((transaction) => {

        const row = document.createElement("tr");

        const titleCell = document.createElement("td");
        titleCell.textContent = transaction.title;

        const categoryCell = document.createElement("td");
        const categoryBadge = document.createElement("span");
        categoryBadge.className = "category-badge";
        categoryBadge.textContent = transaction.category;
        categoryCell.appendChild(categoryBadge);

        const dateCell = document.createElement("td");
        dateCell.textContent = formatDate(transaction.date);

        const amountCell = document.createElement("td");
        amountCell.className =
            transaction.type === "income"
                ? "amount-income"
                : "amount-expense";

        const sign = transaction.type === "income" ? "+" : "-";
        amountCell.textContent =
            sign + formatCurrency(Number(transaction.amount));

        const actionCell = document.createElement("td");

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", () => {
            deleteTransaction(transaction.id);
        });

        actionCell.appendChild(deleteButton);

        row.append(
            titleCell,
            categoryCell,
            dateCell,
            amountCell,
            actionCell
        );

        transactionList.appendChild(row);

    });
}


// ==================================
// 8. DELETE TRANSACTION
// ==================================

function deleteTransaction(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this transaction?"
    );

    if (!confirmDelete) {
        return;
    }

    transactions = transactions.filter((transaction) => {
        return transaction.id !== id;
    });

    saveData();
    renderTransactions();
    updateDashboard();
}


// ==================================
// 9. SEARCH AND FILTER
// ==================================

searchInput.addEventListener("input", renderTransactions);

filterInput.addEventListener("change", renderTransactions);


// ==================================
// 10. INITIALIZE APPLICATION
// ==================================

setTodayDate();
renderTransactions();
updateDashboard();
