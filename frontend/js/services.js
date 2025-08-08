const servicesSection = document.getElementById("services");
const servicesTableBody = servicesSection.querySelector("tbody");
const createServiceBtn = document.getElementById("create-service-btn");
const serviceModal = document.getElementById("service-modal");
const serviceForm = document.getElementById("service-form");
const cancelServiceBtn = document.getElementById("cancel-service-btn");
const formTitle = document.getElementById("form-title");

let editingServiceId = null;

const API_URL = "http://localhost:3000/api/entities";

// 📦 Mostrar todos los servicios
async function fetchServices() {
  try {
    const res = await fetch(API_URL, { credentials: 'include' });
    const data = await res.json();

    servicesTableBody.innerHTML = "";

    data.forEach((service, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${service.name}</td>
        <td>${service.description}</td>
        <td><a href="${service.link}" target="_blank">Ver</a></td>
        <td>${service.maxUsers}</td>
        <td>$${service.price}</td>
        <td>
          <button onclick="editService('${service._id}')">✏️</button>
          <button onclick="deleteService('${service._id}')">🗑️</button>
        </td>
      `;
      servicesTableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error al obtener servicios:", error);
  }
}

// ➕ Abrir modal para crear servicio
createServiceBtn.addEventListener("click", () => {
  serviceForm.reset();
  editingServiceId = null;
  formTitle.textContent = "Nuevo servicio";
  serviceModal.classList.remove("hidden");
});

// ❌ Cancelar operación y cerrar modal
cancelServiceBtn.addEventListener("click", () => {
  serviceForm.reset();
  editingServiceId = null;
  serviceModal.classList.add("hidden");
});

// 📤 Enviar formulario (crear o editar)
serviceForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(serviceForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const method = editingServiceId ? "PUT" : "POST";
    const url = editingServiceId ? `${API_URL}/${editingServiceId}` : API_URL;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Error al guardar servicio");

    await fetchServices();
    serviceForm.reset();
    serviceModal.classList.add("hidden");
    editingServiceId = null;
  } catch (error) {
    console.error(error);
  }
});

// ✏️ Editar servicio
window.editService = async (_id) => {
  try {
    const res = await fetch(`${API_URL}/${_id}`, { credentials: 'include' });
    const service = await res.json();

    serviceForm.name.value = service.name;
    serviceForm.description.value = service.description;
    serviceForm.link.value = service.link;
    serviceForm.maxUsers.value = service.maxUsers;
    serviceForm.price.value = service.price;

    editingServiceId = _id;
    formTitle.textContent = "Editar servicio";
    serviceModal.classList.remove("hidden");
  } catch (error) {
    console.error("Error al editar servicio:", error);
  }
};

// 🗑️ Eliminar servicio
window.deleteService = async (_id) => {
  if (!confirm("¿Estás seguro de eliminar este servicio?")) return;

  try {
    await fetch(`${API_URL}/${_id}`, {
      method: "DELETE",
      credentials: 'include',
    });
    await fetchServices();
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
  }
};

// 🚀 Inicializar al cargar
document.addEventListener("DOMContentLoaded", fetchServices);
