// Abre el menú lateral
function openMenu() {
    const sideMenu = document.getElementById('side-menu');
    sideMenu.classList.add('open');
}

// Cierra el menú lateral
function closeMenu() {
    const sideMenu = document.getElementById('side-menu');
    sideMenu.classList.remove('open');
}

// Alterna la visibilidad del menú desplegable
function toggleDropdown(event) {
    event.preventDefault();
    const dropdownMenu = event.target.nextElementSibling;
    dropdownMenu.classList.toggle('active');
}

// Event listeners para los botones de abrir y cerrar menú
document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.querySelector('.open-btn');
    const closeBtn = document.querySelector('.close-btn');
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

    if (openBtn) {
        openBtn.addEventListener('click', openMenu);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeMenu);
    }

    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', toggleDropdown);
    });
});
