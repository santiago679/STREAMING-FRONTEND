// clients.js (frontend) - usa el patrón dataset.initialized y toggles de clase .hidden
window.loadClientsSection = function () {
  const clientsSection = document.getElementById("clients");
  if (!clientsSection) return;

  // Si la sección no existe o ya fue inicializada, comportamiento distinto:
  if (!clientsSection.dataset.initialized) {
    // Montamos el HTML (tabla + modal) dentro de #clients
    clientsSection.innerHTML = `
      <div class="section-header">
        <h2>👥 Gestión de Clientes</h2>
        <button id="add-client-btn" class="submit-btn">➕ Añadir cliente</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="clientsTable"></tbody>
      </table>

      <!-- Modal (sin dependencia de Bootstrap) -->
      <div id="client-modal" class="modal hidden">
        <div class="modal-content">
          <h3 id="client-modal-title">Añadir cliente</h3>
          <form id="client-form">
            <input type="hidden" id="clientId" value="">

            <label>Nombre:</label>
            <input type="text" id="firstName" required>

            <label>Apellido:</label>
            <input type="text" id="lastName" required>

            <label>Correo:</label>
            <input type="email" id="email" required>

            <label>Contraseña: <small id="password-note">(requerida al crear, opcional al editar)</small></label>
            <input type="password" id="password">

            <label>Rol:</label>
            <select id="rol" required>
              <option value="CLIENTE">CLIENTE</option>
              <option value="VENDEDOR">VENDEDOR</option>
              <option value="ADMIN">ADMIN</option>
            </select>

            <div class="form-actions">
              <button type="submit" class="submit-btn">💾 Guardar</button>
              <button type="button" id="cancel-client-btn" class="cancel-btn">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Elementos
    const clientsTable = document.getElementById("clientsTable");
    const addClientBtn = document.getElementById("add-client-btn");
    const clientModal = document.getElementById("client-modal");
    const clientForm = document.getElementById("client-form");
    const cancelClientBtn = document.getElementById("cancel-client-btn");
    const modalTitle = document.getElementById("client-modal-title");

    let editingId = null; // si null => crear, si tiene id => editar

    // Mostrar modal
    const openModal = (isEdit = false) => {
      if (isEdit) {
        modalTitle.textContent = "Editar cliente";
        document.getElementById("password-note").textContent = "(opcional, solo si quieres cambiarla)";
      } else {
        modalTitle.textContent = "Añadir cliente";
        document.getElementById("password-note").textContent = "(requerida al crear, opcional al editar)";
      }
      clientModal.classList.remove("hidden");
    };

    // Cerrar modal
    const closeModal = () => {
      clientModal.classList.add("hidden");
    };

    // Vaciar form
    const resetForm = () => {
      clientForm.reset();
      document.getElementById("clientId").value = "";
      editingId = null;
    };

    // Evento Añadir
    addClientBtn.addEventListener("click", () => {
      resetForm();
      openModal(false);
    });

    // Cancel modal
    cancelClientBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal();
    });

    // Fetch y render clientes
    async function fetchClients() {
      try {
        const res = await fetch("http://localhost:3000/api/clients", { credentials: "include" });
        if (!res.ok) {
          console.error("Error al obtener clientes", res.status);
          clientsTable.innerHTML = `<tr><td colspan="5">Error al cargar clientes</td></tr>`;
          return;
        }
        const clients = await res.json();
        if (!Array.isArray(clients)) {
          clientsTable.innerHTML = `<tr><td colspan="5">No hay clientes</td></tr>`;
          return;
        }

        clientsTable.innerHTML = clients.map(c => `
          <tr>
            <td>${escapeHtml(c.firstName || "")}</td>
            <td>${escapeHtml(c.lastName || "")}</td>
            <td>${escapeHtml(c.email || "")}</td>
            <td>${escapeHtml(c.rol || "")}</td>
            <td>
              <button class="edit-btn" data-id="${c._id}">✏️</button>
              <button class="delete-btn" data-id="${c._id}">🗑</button>
            </td>
          </tr>
        `).join("");

        // Delegación de eventos sobre la tabla
        clientsTable.querySelectorAll(".edit-btn").forEach(btn => {
          btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            await openEditModal(id);
          });
        });

        clientsTable.querySelectorAll(".delete-btn").forEach(btn => {
          btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            if (!confirm("¿Seguro que quieres eliminar este cliente?")) return;
            try {
              const res = await fetch(`http://localhost:3000/api/clients/${id}`, {
                method: "DELETE",
                credentials: "include"
              });
              if (!res.ok) throw new Error("Error eliminando cliente");
              await fetchClients();
            } catch (err) {
              console.error(err);
              alert("Error al eliminar cliente");
            }
          });
        });

      } catch (err) {
        console.error("fetchClients error:", err);
        clientsTable.innerHTML = `<tr><td colspan="5">Error al cargar clientes</td></tr>`;
      }
    }

    // Abrir edición (llenar formulario)
    async function openEditModal(id) {
      try {
        const res = await fetch(`http://localhost:3000/api/clients/${id}`, { credentials: "include" });
        if (!res.ok) throw new Error("No se pudo cargar cliente");
        const client = await res.json();

        document.getElementById("clientId").value = client._id || "";
        document.getElementById("firstName").value = client.firstName || "";
        document.getElementById("lastName").value = client.lastName || "";
        document.getElementById("email").value = client.email || "";
        document.getElementById("password").value = ""; // vacía para que no se sobrescriba por accidente
        document.getElementById("rol").value = client.rol || "CLIENTE";

        editingId = client._id;
        openModal(true);
      } catch (err) {
        console.error("openEditModal error:", err);
        alert("No se pudo cargar los datos del cliente");
      }
    }

    // Submit (crear o actualizar)
    clientForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const id = document.getElementById("clientId").value || null;
      const payload = {
        firstName: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        email: document.getElementById("email").value.trim(),
        rol: document.getElementById("rol").value
      };

      const passwordVal = document.getElementById("password").value;
      if (!id && !passwordVal) {
        alert("La contraseña es obligatoria al crear un cliente.");
        return;
      }
      // sólo enviar password si tiene valor
      if (passwordVal) payload.password = passwordVal;

      try {
        const url = id ? `http://localhost:3000/api/clients/${id}` : "http://localhost:3000/api/clients";
        const method = id ? "PUT" : "POST";

        const res = await fetch(url, {
          method,
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errText = await res.text().catch(()=>null);
          console.error("Error al guardar cliente:", res.status, errText);
          const msg = errText || "Error al guardar cliente";
          alert(msg);
          return;
        }

        closeModal();
        resetForm();
        await fetchClients();
      } catch (err) {
        console.error("submit clientForm error:", err);
        alert("Error al guardar cliente");
      }
    });

    // Mark as initialized
    clientsSection.dataset.initialized = "true";

    // Carga inicial
    fetchClients();
  } else {
    // Si ya fue inicializado, solo refrescamos la lista
    // La función fetchClients fue definida en la rama anterior; la volvemos a declarar aquí por seguridad
    async function fetchClientsOnly() {
      try {
        const res = await fetch("http://localhost:3000/api/clients", { credentials: "include" });
        if (!res.ok) {
          console.error("Error al obtener clientes", res.status);
          return;
        }
        const clients = await res.json();
        const clientsTable = document.getElementById("clientsTable");
        clientsTable.innerHTML = clients.map(c => `
          <tr>
            <td>${escapeHtml(c.firstName || "")}</td>
            <td>${escapeHtml(c.lastName || "")}</td>
            <td>${escapeHtml(c.email || "")}</td>
            <td>${escapeHtml(c.rol || "")}</td>
            <td>
              <button class="edit-btn" data-id="${c._id}">✏️</button>
              <button class="delete-btn" data-id="${c._1d}">🗑</button>
            </td>
          </tr>
        `).join("");
      } catch (err) {
        console.error(err);
      }
    }
    fetchClientsOnly();
  }

  // Small helper to escape HTML when rendering user input
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
};
