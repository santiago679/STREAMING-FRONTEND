document.addEventListener("DOMContentLoaded", () => {
  const profileSection = document.getElementById("profile");

  // Crear estructura del perfil (formulario + botones)
  profileSection.innerHTML = `
    <div class="profile-container">
      <form id="profile-form">
        <label>Nombre:</label>
        <input type="text" id="firstName" name="firstName" required>

        <label>Apellido:</label>
        <input type="text" id="lastName" name="lastName" required>

        <label>Email:</label>
        <input type="email" id="email" name="email" required>

        <label>Rol:</label>
        <input type="text" id="rol" name="rol" disabled>

        <div class="form-actions">
          <button type="submit" class="submit-btn">💾 Guardar cambios</button>
          <button type="button" id="change-pass-btn" class="secondary-btn">🔑 Cambiar contraseña</button>
          <button type="button" id="delete-account-btn" class="danger-btn hidden">🗑 Eliminar cuenta</button>
        </div>
      </form>
    </div>

    <!-- Modal Cambiar contraseña -->
    <div id="password-modal" class="modal hidden">
      <div class="modal-content">
        <h3>Cambiar contraseña</h3>
        <form id="password-form">
          <input type="password" name="currentPassword" placeholder="Contraseña actual" required>
          <input type="password" name="newPassword" placeholder="Nueva contraseña" required>
          <input type="password" name="confirmPassword" placeholder="Confirmar nueva contraseña" required>
          <div class="form-actions">
            <button type="submit" class="submit-btn">Guardar</button>
            <button type="button" id="cancel-pass-btn" class="cancel-btn">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const profileForm = document.getElementById("profile-form");
  const passwordModal = document.getElementById("password-modal");
  const changePassBtn = document.getElementById("change-pass-btn");
  const cancelPassBtn = document.getElementById("cancel-pass-btn");
  const deleteAccountBtn = document.getElementById("delete-account-btn");

  let userRol = "";

  // Cargar datos del perfil
  async function loadProfile() {
    try {
      const res = await fetch("http://localhost:3000/api/profile", { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar perfil");
      const user = await res.json();

      document.getElementById("firstName").value = user.firstName || "";
      document.getElementById("lastName").value = user.lastName || "";
      document.getElementById("email").value = user.email || "";
      document.getElementById("rol").value = user.rol || "";

      userRol = user.rol;
      if (userRol === "CLIENTE") {
        deleteAccountBtn.classList.remove("hidden");
      }
    } catch (err) {
      console.error(err);
    }
  }

  loadProfile();

  // Guardar cambios de perfil
  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = {
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      email: document.getElementById("email").value
    };

    try {
      const res = await fetch("http://localhost:3000/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      alert(data.message || "Perfil actualizado");
    } catch (err) {
      console.error(err);
    }
  });

  // Abrir modal cambiar contraseña
  changePassBtn.addEventListener("click", () => {
    passwordModal.classList.remove("hidden");
  });

  // Cerrar modal cambiar contraseña
  cancelPassBtn.addEventListener("click", () => {
    passwordModal.classList.add("hidden");
  });

  // Guardar nueva contraseña
  document.getElementById("password-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const currentPassword = e.target.currentPassword.value;
    const newPassword = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (newPassword !== confirmPassword) {
      alert("La nueva contraseña y la confirmación no coinciden");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      alert(data.message || "Contraseña cambiada");
      passwordModal.classList.add("hidden");
    } catch (err) {
      console.error(err);
    }
  });

  // Eliminar cuenta (solo CLIENTE)
  deleteAccountBtn.addEventListener("click", async () => {
    if (!confirm("¿Seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer.")) return;

    try {
      const res = await fetch("http://localhost:3000/api/profile", {
        method: "DELETE",
        credentials: "include"
      });

      const data = await res.json();
      alert(data.message || "Cuenta eliminada");
      window.location.href = "login.html";
    } catch (err) {
      console.error(err);
    }
  });
});
