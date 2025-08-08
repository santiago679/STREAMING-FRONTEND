const accountsSection = document.getElementById("accounts");
const accountsTableBody = accountsSection.querySelector("tbody");
const createAccountBtn = document.getElementById("create-account-btn");
const accountModal = document.getElementById("account-modal");
const accountForm = document.getElementById("account-form");
const cancelAccountBtn = document.getElementById("cancel-account-btn");
const accountFormTitle = document.getElementById("account-form-title");

let editingAccountId = null;

const ACCOUNTS_API_URL = "http://localhost:3000/api/products";
const ENTITIES_API_URL = "http://localhost:3000/api/entities";

// 📦 Mostrar todas las cuentas
async function fetchAccounts() {
  try {
    const res = await fetch(ACCOUNTS_API_URL, { credentials: "include" });
    const data = await res.json();

    accountsTableBody.innerHTML = "";

    data.forEach((account, index) => {
      const soldTo = account.soldTo?.name || "Disponible";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${account.email}</td>
        <td>${account.password}</td>
        <td>${soldTo}</td>
        <td>${account.entity?.name || "Sin servicio"}</td>
        <td>
          <button onclick="editAccount('${account._id}')">✏️</button>
          <button onclick="deleteAccount('${account._id}')">🗑️</button>
        </td>
      `;
      accountsTableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error al obtener cuentas:", error);
  }
}

// ➕ Abrir modal para crear cuenta
createAccountBtn.addEventListener("click", async () => {
  accountForm.reset();
  editingAccountId = null;
  accountFormTitle.textContent = "Nueva cuenta";

  await populateEntityOptions();
  accountModal.classList.remove("hidden");
});

// ❌ Cancelar y cerrar modal
cancelAccountBtn.addEventListener("click", () => {
  accountForm.reset();
  editingAccountId = null;
  accountModal.classList.add("hidden");
});

// 📤 Enviar formulario (crear o editar)
accountForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(accountForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const method = editingAccountId ? "PUT" : "POST";
    const url = editingAccountId
      ? `${ACCOUNTS_API_URL}/${editingAccountId}`
      : ACCOUNTS_API_URL;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Error al guardar cuenta");

    await fetchAccounts();
    accountForm.reset();
    accountModal.classList.add("hidden");
    editingAccountId = null;
  } catch (error) {
    console.error(error);
  }
});

// ✏️ Editar cuenta
window.editAccount = async (_id) => {
  try {
    const res = await fetch(`${ACCOUNTS_API_URL}/${_id}`, {
      credentials: "include",
    });
    const account = await res.json();

    await populateEntityOptions();

    accountForm.email.value = account.email;
    accountForm.password.value = account.password;
    accountForm.entity.value = account.entity?._id || account.entity;

    editingAccountId = _id;
    accountFormTitle.textContent = "Editar cuenta";
    accountModal.classList.remove("hidden");
  } catch (error) {
    console.error("Error al editar cuenta:", error);
  }
};

// 🗑️ Eliminar cuenta
window.deleteAccount = async (_id) => {
  if (!confirm("¿Estás seguro de eliminar esta cuenta?")) return;

  try {
    await fetch(`${ACCOUNTS_API_URL}/${_id}`, {
      method: "DELETE",
      credentials: "include",
    });
    await fetchAccounts();
  } catch (error) {
    console.error("Error al eliminar cuenta:", error);
  }
};

// 🧩 Llenar select de servicios
async function populateEntityOptions() {
  try {
    const res = await fetch(ENTITIES_API_URL, { credentials: "include" });
    const services = await res.json();

    const select = accountForm.entity;
    select.innerHTML = '<option value="">Seleccione un servicio</option>';

    services.forEach((service) => {
      const option = document.createElement("option");
      option.value = service._id;
      option.textContent = service.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error al obtener servicios:", error);
  }
}

// 🚀 Inicializar
document.addEventListener("DOMContentLoaded", fetchAccounts);
