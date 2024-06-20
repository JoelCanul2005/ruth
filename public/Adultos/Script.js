// Sticky header change on scroll
window.addEventListener('scroll', function() {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();

        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        window.scrollTo({
            top: targetElement.offsetTop - header.offsetHeight,
            behavior: 'smooth'
        });
    });
});

// Menu deslizante
function openNav() {
    document.getElementById("mySideMenu").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySideMenu").style.width = "0";
}

// Manejar dropdowns del menú lateral
function toggleDropdown(event) {
    const button = event.target;
    const dropdown = button.nextElementSibling;

    if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
    } else {
        dropdown.style.display = "block";
    }
}

// Parte 2 del menú
function openMenu() {
    const sideMenu = document.getElementById("side-menu");
    sideMenu.classList.add("open");
    sideMenu.classList.remove("close");
}

function closeMenu() {
    const sideMenu = document.getElementById("side-menu");
    sideMenu.classList.add("close");
    sideMenu.classList.remove("open");
}

document.addEventListener('DOMContentLoaded', (event) => {
    const openBtn = document.querySelector('.open-btn');
    const closeBtn = document.querySelector('.close-btn');
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

    openBtn.addEventListener('click', () => {
        openMenu();
    });

    closeBtn.addEventListener('click', () => {
        closeMenu();
    });

    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', toggleDropdown);
    });
});