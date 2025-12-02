// Load nav and footer components
async function loadComponents() {
  try {
    const navRes = await fetch('components/layout/nav.html');
    const navHtml = await navRes.text();
    document.getElementById('nav-placeholder').innerHTML = navHtml;

    const footerRes = await fetch('components/layout/footer.html');
    const footerHtml = await footerRes.text();
    document.getElementById('footer-placeholder').innerHTML = footerHtml;

    setActiveNavLink();
  } catch (err) {
    console.error('Error loading components:', err);
  }
}

function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('.nav-link');

  for (const link of links) {
    const linkPage = link.getAttribute('data-page') + '.html';
    if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
      link.classList.add('active');
    }
  }
}

export { loadComponents };
