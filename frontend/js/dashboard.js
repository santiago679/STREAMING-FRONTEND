document.addEventListener("DOMContentLoaded", async () => {
  const userInfo = document.getElementById("userInfo");
  const sidebarMenu = document.getElementById("sidebarMenu");
  const sections = document.querySelectorAll(".dashboard-section");

  const showSection = (id) => {
    sections.forEach(section => {
      section.classList.remove("active");
    });
    document.getElementById(id).classList.add("active");
  };

  try {
    const res = await fetch("http://localhost:3000/api/profile", {
      credentials: "include"
    });
    const user = await res.json();
    const fullName = `${user.firstName} ${user.lastName || ""}`.trim();
    const role = user.rol;

    window.getProfile = async () => user;

    userInfo.textContent = `${fullName} (${role})`;

    if (role === "CLIENTE") {
      document.querySelectorAll(".admin-only, .seller-only").forEach(el => el.style.display = "none");
    } else if (role === "VENDEDOR") {
      document.querySelectorAll(".admin-only").forEach(el => {
        if (!el.classList.contains("seller-only")) {
          el.style.display = "none";
        }
      });
    }

    showSection("home");

    sidebarMenu.querySelectorAll("li").forEach(li => {
      li.addEventListener("click", () => {  
        const sectionId = li.getAttribute("data-section");
        showSection(sectionId);
      });
    });

    document.getElementById("goHomeBtn").addEventListener("click", () => {
      showSection("home");
    });

    document.getElementById("logoutBtn").addEventListener("click", async () => {
      await fetch("http://localhost:3000/api/logout", {
        method: "POST",
        credentials: "include"
      });
      window.location.href = "./login.html";
    });

  } catch (error) {
    console.error("Error cargando perfil:", error);
    window.location.href = "./login.html";
  }
});
