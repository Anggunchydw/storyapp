
import '../styles/styles.css';
import App from './pages/app';
import { registerServiceWorker } from './utils';

document.addEventListener('DOMContentLoaded', async () => {
  const header = document.querySelector('.main-header');
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
    skipLink: document.querySelector('.skip-link'),
  });

  // Render header once
  if (!header) {
    document.querySelector('body').innerHTML = `
      <div class="main-header container">
        <a class="brand-name" href="#/">App</a>
        <nav id="navigation-drawer" class="navigation-drawer">
          <ul id="nav-list" class="nav-list">
            <li><a href="#/">Beranda</a></li>
            <li><a href="#/add">Add Story</a></li>
            <li><a href="#/about">About</a></li>
          </ul>
        </nav>
        <button id="drawer-button" class="drawer-button">☰</button>
      </div>
      <div id="main-content"></div>
    `;
  }

  await app.renderPage();
  await registerServiceWorker();

  document.body.addEventListener('click', async (event) => {
    const anchor = event.target.closest('a[href^="#/"]');
    if (anchor) {
      event.preventDefault();
      const targetHash = anchor.getAttribute('href');
      if (location.hash !== targetHash) {
        location.hash = targetHash;
      } else {
        await app.renderPage(); 
      }
    }
  });
 
  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});

