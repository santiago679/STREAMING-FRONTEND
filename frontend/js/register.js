const api = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  const errorMessage = document.getElementById('error-message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = {
      firstName: document.getElementById('firstName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value,
      rol: document.getElementById('rol').value
    };

    try {
      const response = await fetch(`${api}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(user)
      });

      if (!response.ok) {
        const errorData = await response.json();
        errorMessage.textContent = errorData.menssage || 'Error en el registro.';
        return;
      }

      // ✅ Redirección después del registro
      window.location.href = 'login.html';
    } catch (err) {
      console.error('Error:', err);
      errorMessage.textContent = 'Error inesperado.';
    }
  });
});
