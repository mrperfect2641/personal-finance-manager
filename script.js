// Supabase is initialized in config.js
// const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM Elements
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const transactionForm = document.getElementById("transactionForm");
const editTransactionForm = document.getElementById("editTransactionForm");
const transactionsTable = document.getElementById("transactionsTable");
const searchInput = document.getElementById("searchInput");
const logoutButton = document.getElementById("logoutButton");
const logoutDropdown = document.getElementById("logoutDropdown");

// after const supabase = ...
// Listen for auth changes (optional but useful)

// Listen for auth changes (optional but useful)
supabaseClient.auth.onAuthStateChange((event, session) => {
  if (!session) {
    window.location.href = "login.html";
  }
});

// Chart instances
let expenseChart = null;

// User session
let currentUser = null;

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  // Check authentication status
  checkAuth();

  // Setup event listeners
  setupEventListeners();
});

// Check authentication status
async function checkAuth() {
  console.log("Checking authentication status...");
  const {
    data: { session },
    error,
  } = await supabaseClient.auth.getSession();
  if (error || !session) {
    return (window.location.href = "login.html");
  }
  currentUser = session.user;

  // Fetch username from profiles table
  const { data: profile, error: profileErr } = await supabaseClient
    .from("profiles")
    .select("username")
    .eq("id", currentUser.id)
    .single();

  const displayName = profile && profile.username ? profile.username : currentUser.email;
  document.getElementById("usernameDisplay").textContent = displayName;

  loadTransactions();
}

// Settings button from dropdown
// Prevent double-initialization / stacked backdrops
function showLogoutModal() {
  const modalEl = document.getElementById("logoutModal");
  if (!modalEl) return console.warn("logoutModal element not found");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl); // reuses existing instance
  modal.show();
}

function setupEventListeners() {
  // Sidebar toggle for mobile
  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });

  // Transaction form submission
  transactionForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await addTransaction();
  });

  // Edit transaction form submission
  editTransactionForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await updateTransaction();
  });

  // Search functionality
  searchInput.addEventListener("input", () => {
    loadTransactions();
  });

  // Settings button from dropdown
  const settingsDropdown = document.getElementById("settingsDropdown");
  if (settingsDropdown) {
    settingsDropdown.addEventListener("click", (e) => {
      e.preventDefault();
      showSection('settings');
    });
  }

  // Logout buttons → show modal instead of logging out immediately
  const logoutBtn = document.getElementById("logoutButton");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showLogoutModal();
    });
  }

  const logoutDrop = document.getElementById("logoutDropdown");
  if (logoutDrop) {
    logoutDrop.addEventListener("click", (e) => {
      e.preventDefault();
      showLogoutModal();
    });
  }

  // Confirm logout
  document.getElementById("confirmLogoutBtn").addEventListener("click", async () => {
    console.log("Attempting to logout...");
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      return showNotification("Logout failed: " + error.message, "error");
    }
    window.location.href = "login.html";
  });
}


// Add transaction
async function addTransaction() {
  const amount = parseFloat(document.getElementById("amount").value);
  const description = document.getElementById("description").value;
  const category = document.getElementById("category").value;
  const type = document.getElementById("type").value;

  if (!amount || !description || !category || !type) {
    showNotification("Please fill all fields", "error");
    return;
  }

  const { data, error } = await supabaseClient.from("transactions").insert([
    {
      user_id: currentUser.id,
      amount,
      description,
      category,
      type,
      date: new Date().toISOString(),
    },
  ]);

  if (error) {
    showNotification("Error adding transaction: " + error.message, "error");
  } else {
    showNotification("Transaction added successfully!", "success");
    document.getElementById("transactionForm").reset();
    document.querySelector('[data-bs-dismiss="modal"]').click();
    loadTransactions();
  }
  console.log("Adding transaction for user", currentUser);
}

// Load transactions
async function loadTransactions() {
  console.log("Fetching transactions for user:", currentUser.id);
  let query = supabaseClient
    .from("transactions")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("date", { ascending: false });

  const searchTerm = searchInput.value.trim();
  if (searchTerm) {
    query = query.ilike("description", `%${searchTerm}%`);
  }

  const { data: transactions, error } = await query;

  if (error) {
    showNotification("Error loading transactions: " + error.message, "error");
    return;
  }

  // Update transactions table
  updateTransactionsTable(transactions);

  // Update summary cards
  updateSummaryCards(transactions);

  // Update expense chart
  updateExpenseChart(transactions);
}

// Update transactions table
function updateTransactionsTable(transactions) {
  transactionsTable.innerHTML = "";

  if (transactions.length === 0) {
    transactionsTable.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center">No transactions found</td>
                    </tr>
                `;
    return;
  }

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1
      }/${date.getFullYear()}`;

    const row = document.createElement("tr");
    row.innerHTML = `
                    <td>${formattedDate}</td>
                    <td>${transaction.description}</td>
                    <td>${transaction.category}</td>
                    <td>${transaction.type.charAt(0).toUpperCase() +
      transaction.type.slice(1)
      }</td>
                    <td class="${transaction.type === "income"
        ? "text-success"
        : "text-danger"
      }">
                        ${transaction.type === "income" ? "+" : "-"
      }₹${transaction.amount.toFixed(2)}
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-2 edit-btn" data-id="${transaction.id
      }">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${transaction.id
      }">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
    transactionsTable.appendChild(row);
  });

  // Add event listeners to action buttons
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => openEditModal(btn.dataset.id));
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => deleteTransaction(btn.dataset.id));
  });
}

// Open edit modal
async function openEditModal(id) {
  const { data: transaction, error } = await supabaseClient
    .from("transactions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    showNotification("Error loading transaction: " + error.message, "error");
    return;
  }

  document.getElementById("editId").value = transaction.id;
  document.getElementById("editAmount").value = transaction.amount;
  document.getElementById("editDescription").value = transaction.description;
  document.getElementById("editCategory").value = transaction.category;
  document.getElementById("editType").value = transaction.type;

  // Show modal
  const modal = new bootstrap.Modal(
    document.getElementById("editTransactionModal")
  );
  modal.show();
}

// Update transaction
async function updateTransaction() {
  const id = document.getElementById("editId").value;
  const amount = parseFloat(document.getElementById("editAmount").value);
  const description = document.getElementById("editDescription").value;
  const category = document.getElementById("editCategory").value;
  const type = document.getElementById("editType").value;

  if (!amount || !description || !category || !type) {
    showNotification("Please fill all fields", "error");
    return;
  }

  const { error } = await supabaseClient
    .from("transactions")
    .update({ amount, description, category, type })
    .eq("id", id);

  if (error) {
    showNotification("Error updating transaction: " + error.message, "error");
  } else {
    showNotification("Transaction updated successfully!", "success");
    document.getElementById("editTransactionForm").reset();
    document.querySelector('[data-bs-dismiss="modal"]').click();
    loadTransactions();
  }
}

// Delete transaction
async function deleteTransaction(id) {
  if (!confirm("Are you sure you want to delete this transaction?")) {
    return;
  }

  const { error } = await supabaseClient.from("transactions").delete().eq("id", id);

  if (error) {
    showNotification("Error deleting transaction: " + error.message, "error");
  } else {
    showNotification("Transaction deleted successfully!", "success");
    loadTransactions();
  }
}

// Update summary cards
function updateSummaryCards(transactions) {
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((transaction) => {
    if (transaction.type === "income") {
      totalIncome += transaction.amount;
    } else {
      totalExpense += transaction.amount;
    }
  });

  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  document.getElementById("totalIncome").textContent = `₹${totalIncome.toFixed(
    2
  )}`;
  document.getElementById(
    "totalExpense"
  ).textContent = `₹${totalExpense.toFixed(2)}`;
  document.getElementById("balance").textContent = `₹${balance.toFixed(2)}`;
  document.getElementById("savingsRate").textContent = `${savingsRate.toFixed(
    1
  )}%`;
}

// Update expense chart
function updateExpenseChart(transactions) {
  const expenseTransactions = transactions.filter((t) => t.type === "expense");
  const categories = [...new Set(expenseTransactions.map((t) => t.category))];

  const amounts = categories.map((category) => {
    return expenseTransactions
      .filter((t) => t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);
  });

  const ctx = document.getElementById("expenseChart").getContext("2d");

  // Destroy previous chart if exists
  if (expenseChart) {
    expenseChart.destroy();
  }

  expenseChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: categories,
      datasets: [
        {
          data: amounts,
          backgroundColor: [
            "#2C3E50",
            "#E74C3C",
            "#3498DB",
            "#2ECC71",
            "#F1C40F",
            "#9B59B6",
            "#1ABC9C",
            "#34495E",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.label}: ₹${context.raw.toFixed(2)}`;
            },
          },
        },
      },
    },
  });
}

// Logout
async function logout() {
  console.log("Logout function called directly");
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    return showNotification("Logout failed: " + error.message, "error");
  }
  window.location.href = "login.html";
}

// Show notification
function showNotification(message, type = "success") {
  // Remove any existing notifications
  document.querySelectorAll(".notification").forEach((el) => el.remove());

  const notification = document.createElement("div");
  notification.className = `notification alert-${type}`;
  notification.innerHTML = `
                <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"
    }"></i>
                <span>${message}</span>
            `;

  document.body.appendChild(notification);

  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.classList.add("hide");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
// ==========================================
function showSection(section) {
  const dashboardSection = document.getElementById("dashboardSection");
  const settingsSection = document.getElementById("settingsSection");

  // Toggle visibility
  if (section === "dashboard") {
    dashboardSection.classList.remove("d-none");
    settingsSection.classList.add("d-none");
    setActiveNav("navDashboard");
  } else if (section === "settings") {
    dashboardSection.classList.add("d-none");
    settingsSection.classList.remove("d-none");
    setActiveNav("navSettings");
    loadUserSettings(); // Optional: Load existing username/email
  }
}

function setActiveNav(activeId) {
  document.querySelectorAll(".sidebar-nav li").forEach((li) => {
    li.classList.remove("active");
  });
  const activeNav = document.getElementById(activeId);
  if (activeNav) activeNav.classList.add("active");
}

function loadUserSettings() {
  const user = JSON.parse(localStorage.getItem("userProfile"));
  if (user) {
    document.getElementById("currentUsername").value = user.username || "";
    document.getElementById("currentEmail").value = user.email || "";
  }
}

// 1️⃣ Populate current username & email
async function loadSettings() {
  // fetch auth user
  const {
    data: { user },
    error: userErr,
  } = await supabaseClient.auth.getUser();
  if (userErr) {
    console.error("Error fetching user:", userErr);
    return;
  }

  // put email into your existing <input id="currentEmail">
  document.getElementById("currentEmail").value = user.email;

  // fetch username from your profiles table
  const { data: profile, error: profErr } = await supabaseClient
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();
  if (profErr) {
    console.error("Error fetching profile:", profErr);
    return;
  }

  // put username into your existing <input id="currentUsername">
  document.getElementById("currentUsername").value = profile.username;
}

// call it on page load
window.addEventListener("DOMContentLoaded", loadSettings);

async function updateUsername() {
  const newU = document.getElementById("newUsername").value.trim();
  if (!newU) return alert("Please enter a new username.");

  // get current user ID
  const {
    data: { user },
    error: userErr,
  } = await supabaseClient.auth.getUser();
  if (userErr) return alert("Error fetching user: " + userErr.message);
  const userId = user.id;

  // 1️⃣ Check if username is already taken by someone else
  const { count, error: countErr } = await supabaseClient
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("username", newU)
    .neq("id", userId);
  if (countErr) {
    return alert("Could not verify username availability: " + countErr.message);
  }
  if (count > 0) {
    return alert("That username is already taken. Please choose another.");
  }

  // 2️⃣ Proceed with update
  const { error: updErr } = await supabaseClient
    .from("profiles")
    .update({ username: newU })
    .eq("id", userId);
  if (updErr) {
    return alert("Username update failed: " + updErr.message);
  }

  // 3️⃣ Reflect change and notify
  document.getElementById("currentUsername").value = newU;
  alert("Username updated successfully!");
}

async function updateEmail() {
  const newE = document.getElementById("newEmail").value.trim();
  if (!newE) return alert("Please enter a new email.");

  const { error } = await supabaseClient.auth.updateUser({ email: newE });
  if (error) return alert("Email update failed: " + error.message);

  document.getElementById("currentEmail").value = newE;
  document.getElementById("newEmail").value = "";
  alert("Email updated! Check your inbox to verify.");
}

// ============new password section============
async function updatePassword() {
  const email = document.getElementById("currentEmail").value;
  const currentPwd = document.getElementById("currentPassword").value;
  const newPwd = document.getElementById("newPassword").value;
  const confirmPwd = document.getElementById("confirmPassword").value;

  // 1. Basic client-side validation
  if (!currentPwd || !newPwd || !confirmPwd)
    return alert("Please fill in all password fields.");
  if (newPwd !== confirmPwd) return alert("New passwords do not match.");

  // 2. Re-authenticate with the old password
  const { data: signInData, error: signInErr } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password: currentPwd,
    });
  if (signInErr) {
    return alert("Current password is incorrect.");
  }

  // 3. Now safe to update
  const { error: updateErr } = await supabaseClient.auth.updateUser({
    password: newPwd,
  });
  if (updateErr) {
    return alert("Password update failed: " + updateErr.message);
  }

  // 4. Clean up UI & confirm
  ["currentPassword", "newPassword", "confirmPassword"].forEach(
    (id) => (document.getElementById(id).value = "")
  );
  alert("Password updated successfully!");
}

// =================== account deletation ===================
function confirmDeleteAccount() {
  if (!confirm("This will permanently delete your account. Continue?")) return;
  deleteAccount();
}

// 2️⃣ The actual deletion logic:
async function deleteAccount() {
  try {
    // ▶️ Get the current user
    const {
      data: { user },
      error: userErr,
    } = await supabaseClient.auth.getUser();
    if (userErr) throw userErr;
    const userId = user.id;

    // ▶️ Call your Edge Function to delete the Auth user
    const resp = await fetch("/functions/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const { error: fnError } = await resp.json();
    if (fnError) throw new Error(fnError);

    // ▶️ Clean up the profiles table
    const { error: delProfErr } = await supabaseClient
      .from("profiles")
      .delete()
      .eq("id", userId);
    if (delProfErr)
      console.warn("Profile deletion failed:", delProfErr.message);

    // ▶️ Sign out & redirect
    await supabaseClient.auth.signOut();
    alert("Your account has been deleted.");
    window.location.href = "/login.html";
  } catch (err) {
    alert("Error deleting account: " + err.message);
    console.error(err);
  }
}
