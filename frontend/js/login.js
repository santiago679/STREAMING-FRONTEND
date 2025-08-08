const api = 'http://localhost:3000/api'; // URL de tu backend

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const errorMessage = document.getElementById('error-message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = {
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value
    };

    try {
      const response = await fetch(`${api}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // ⬅️ IMPORTANTE para enviar/recibir cookies
        body: JSON.stringify(user)
      });

      if (!response.ok) {
        const errorData = await response.json();
        errorMessage.textContent = errorData.message || 'Error al iniciar sesión.';
        return;
      }

      // ✅ Redirigir al dashboard si todo sale bien
      window.location.href = 'dashboard.html';
    } catch (err) {
      console.error('Error:', err);
      errorMessage.textContent = 'Error inesperado.';
    }
  });
});
