import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import { getAccessToken, getLogout } from '../utils/auth';
import {unauthenticatedRoutesOnly} from '../utils/auth';
import { generateSubscribeButtonTemplate,
  generateUnsubscribeButtonTemplate,
 } from '../templates';
import { isServiceWorkerAvailable } from '../utils';
import { isCurrentPushSubscriptionAvailable, getPushSubscription, subscribe, unsubscribe } from '../utils/notification-helper';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #page = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
    this._setupSkipLink();
    
  }


  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      })
    });
  }
  _setupSkipLink() {
    document.addEventListener('DOMContentLoaded', () => {
      const mainContent = document.querySelector('#main-content');
      const skipLink = document.querySelector('.skip-link');
  
      if (mainContent && skipLink) {
        skipLink.addEventListener('click', function (event) {
          event.preventDefault();
          skipLink.blur();
          mainContent.focus();
          mainContent.scrollIntoView();
        });
      }
    });
  }
 
  async renderPage() {
    const url = getActiveRoute();
    const pages = routes[url];
    const page = pages();

    if (this.#page?.destroy) {
      await this.#page.destroy(); 
    }

    this.#page = page;

    const renderAndSubscribe = async () => {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      this._renderSubscribeButton(); // Tambahkan ini
    };

    if (document.startViewTransition) {
      document.startViewTransition(renderAndSubscribe);
    } else {
      await renderAndSubscribe();
    }
  }

 async _renderSubscribeButton() {
  if (!isServiceWorkerAvailable()) return;

  const container = document.querySelector('#subscribeContainer');
  if (!container) return;

  const isSubscribed = await isCurrentPushSubscriptionAvailable();

  const renderButton = (subscribed) => {
    container.innerHTML = subscribed
      ? generateUnsubscribeButtonTemplate()
      : generateSubscribeButtonTemplate();

    const button = subscribed
      ? document.querySelector('#unsubscribe-button')
      : document.querySelector('#subscribe-button');

    button.addEventListener('click', async () => {
     if (subscribed) {
        await unsubscribe(); 
      } else {
        await subscribe();
      }


      // Re-render button setelah aksi
      this._renderSubscribeButton();
    });
  };

  renderButton(isSubscribed);
}
}


export default App;
