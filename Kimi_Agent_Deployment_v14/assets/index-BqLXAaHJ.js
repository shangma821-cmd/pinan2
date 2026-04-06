const header = document.querySelector('.site-header');
const menuButton = document.querySelector('[data-menu-button]');
const menu = document.querySelector('[data-menu]');
const navLinks = Array.from(document.querySelectorAll('.site-nav a'));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const closeMenu = () => {
  if (!header || !menuButton) return;
  header.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
};

const openMenu = () => {
  if (!header || !menuButton) return;
  header.classList.add('is-open');
  menuButton.setAttribute('aria-expanded', 'true');
};

if (menuButton && menu) {
  menuButton.addEventListener('click', () => {
    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 860) {
        closeMenu();
      }
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) {
      closeMenu();
    }
  });
}

const updateActiveNav = () => {
  const scrollY = window.scrollY + 140;

  let activeId = '#home';
  sections.forEach((section) => {
    if (section.offsetTop <= scrollY) {
      activeId = `#${section.id}`;
    }
  });

  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === activeId;
    link.classList.toggle('is-active', isActive);
  });
};

updateActiveNav();
window.addEventListener('scroll', updateActiveNav, { passive: true });

const yearNode = document.querySelector('[data-year]');
if (yearNode) {
  yearNode.textContent = new Date().getFullYear().toString();
}
