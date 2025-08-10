// public/js/profile.js
const API_BASE = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", () => {
  // Elementos display
  const profileSection = document.getElementById("profile");
  const firstNameDisplay = document.getElementById("profileFirstNameDisplay");
  const lastNameDisplay = document.getElementById("profileLastNameDisplay");
  const emailDisplay = document.getElementById("profileEmailDisplay");
  const roleDisplay = document.getElementById("profileRoleDisplay");

  // Botones y modales
  const editBtn = document.getElementById("editProfileBtn");
  const deleteBtn = document.getElementById("deleteAccountBtn");

  const profileModal = document.getElementById("profileModal");
  const profileForm = document.getElementById("profileForm");
  const cancelProfileBtn = document.getElementById("cancelProfileBtn");

  const confirmDeleteModal = document.getElementById("confirmDeleteModal");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

  // Inputs modal editar
  const inputFirstName = document.getElementById("profileFirstName");
  const inputLastName = document.getElementById("profileLastName");
  const inputEmail = document.getElementById("profileEmail");
  const inputPassword = document.getElementById("profilePassword");
  const selectRole = document.getElementById("profileRole");

  // Funciones para mostrar/ocultar modales
  function showModal(modal) {
    modal.classList.remove("hidden");
  }
  function hideModal(modal) {
    modal.classList.add("hidden");
  }

  // Cargar perfil
  async function loadProfile() {
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        credentials: "include"
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error cargando perfil");
      }
      const data = await res.json();

      // Mostrar datos
      firstNameDisplay.textContent = data.firstName;
      lastNameDisplay.textContent = data.lastName;
      emailDisplay.textContent = data.email;
      roleDisplay.textContent = data.rol;

      // Ocultar contraseña en modal
      inputPassword.value = "";

      // Setear inputs del modal
      inputFirstName.value = data.firstName;
      inputLastName.value = data.lastName;
      inputEmail.value = data.email;
      selectRole.value = data.rol;

      // Mostrar sección
      profileSection.style.display = "block";

    } catch (error) {
      alert("Error cargando perfil: " + error.message);
      console.error(error);
    }
  }

  // Abrir modal editar
  editBtn.addEventListener("click", () => {
    showModal(profileModal);
  });

  // Cancelar edición
  cancelProfileBtn.addEventListener("click", () => {
    hideModal(profileModal);
  });

  // Guardar cambios
  profileForm.addEventListener("submit", async e => {
    e.preventDefault();

    try {
      // Actualizar perfil (nombre, apellido, email)
      const updatedProfile = {
        firstName: inputFirstName.value.trim(),
        lastName: inputLastName.value.trim(),
        email: inputEmail.value.trim()
      };

      let res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedProfile)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error actualizando perfil");
      }

      // Cambiar contraseña si se ingresó una nueva
      const newPassword = inputPassword.value.trim();
      if (newPassword.length > 0) {
        const currentPassword = prompt("Ingresa tu contraseña actual para confirmar cambio de contraseña:");
        if (!currentPassword) {
          alert("Cambio de contraseña cancelado.");
        } else {
          res = await fetch(`${API_BASE}/auth/profile/password`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              currentPassword,
              newPassword
            })
          });

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || "Error cambiando contraseña");
          }
          alert("Contraseña actualizada con éxito.");
        }
      }

      alert("Perfil actualizado correctamente.");
      hideModal(profileModal);
      loadProfile();

    } catch (error) {
      alert("Error: " + error.message);
      console.error(error);
    }
  });

  // Abrir modal confirmar eliminar
  deleteBtn.addEventListener("click", () => {
    showModal(confirmDeleteModal);
  });

  // Cancelar eliminar
  cancelDeleteBtn.addEventListener("click", () => {
    hideModal(confirmDeleteModal);
  });

  // Confirmar eliminar cuenta
  confirmDeleteBtn.addEventListener("click", async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error eliminando cuenta");
      }
      alert("Cuenta eliminada con éxito. Se cerrará sesión.");
      window.location.href = "/login.html"; // Cambia por la ruta correcta
    } catch (error) {
      alert("Error: " + error.message);
      console.error(error);
    }
  });

  // Inicializar
  loadProfile();
});
