// import QuickActions from './extensions/components/QuickActions';
import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    // ... config
    locales: ['es'],
    translations: {
      en: {
        "app.components.LeftMenu.navbrand.title": "El Hub Board",
        "app.components.HomePage.welcome.title": "Welcome to El Hub",
        "app.components.HomePage.welcome.again": "CMS Dashboard",
        "app.components.HomePage.welcomeBlock.content": "Manage your website content.",
        "app.components.HomePage.welcomeBlock.content.again": "Manage your website content.",
        "Auth.form.welcome.title": "Welcome to El Hub",
        "Auth.form.welcome.subtitle": "Log in to your account",
      },
      es: {
        "app.components.LeftMenu.navbrand.title": "El Hub Board",
        "app.components.HomePage.welcome.title": "Bienvenido a El Hub",
        "app.components.HomePage.welcome.again": "Panel de Administración",
        "app.components.HomePage.welcomeBlock.content": "Bienvenido al gestor de contenidos de El Hub. Desde aquí puedes administrar todo tu sitio web.",
        "app.components.HomePage.welcomeBlock.content.again": "Gestor de contenidos para tu sitio web",
        "Auth.form.welcome.title": "Bienvenido a El Hub",
        "Auth.form.welcome.subtitle": "Inicia sesión en tu cuenta",
      },
    },
    tutorials: false,
    notifications: { releases: false },
    theme: {
      light: {
        colors: {
          primary100: '#e0f2fe',
          primary200: '#bae6fd',
          primary500: '#0ea5e9',
          primary600: '#0284c7',
          primary700: '#0369a1',
          buttonPrimary600: '#0284c7',
          buttonPrimary500: '#0ea5e9',
        },
      },
      dark: {
        colors: {
          primary100: '#0c4a6e',
          primary200: '#075985',
          primary500: '#0ea5e9',
          primary600: '#38bdf8',
          primary700: '#7dd3fc',
          buttonPrimary600: '#0ea5e9',
          buttonPrimary500: '#38bdf8',
        },
      }
    }
  },
  bootstrap(app: StrapiApp) {
    console.log(app);
    
    // Runtime customization to ensure unwanted widgets are hidden
    // and text is correct even if translations/CSS fail-load.
    try {
      const observer = new MutationObserver(() => {
        // 1. Hide Guided Tour
        const tourButton = document.querySelector('button[aria-label="Close guided tour"]');
        if (tourButton) {
          const container = tourButton.closest('div[style*="grid"]'); // Usually the grid container
          if (container) {
             const section = tourButton.closest('section');
             if (section && section.parentElement) {
               section.parentElement.style.display = 'none';
             }
          }
        }

        // 2. Hide "Join the community" / "Discover" headers
        const headers = document.querySelectorAll('h2');
        headers.forEach(h => {
          if (h.textContent?.includes('Discover your application') || h.textContent?.includes('Join the community')) {
             const section = h.closest('aside') || h.closest('div[class*="Box"]');
             if (section) (section as HTMLElement).style.display = 'none';
          }
        });

        // 3. Hide Strapi Cloud / Billing / Upgrade Widgets (aggressive)
        const cloudLinks = document.querySelectorAll('a[href*="cloud.strapi.io"], a[href*="strapi.io/pricing"], a[href*="strapi.io/cloud"]');
        cloudLinks.forEach(link => {
            const container = link.closest('div[class*="Box"]') || link.parentElement;
            if (container) (container as HTMLElement).style.display = 'none';
        });

        const upgradeButtons = document.querySelectorAll('button');
        upgradeButtons.forEach(btn => {
            if (btn.textContent?.includes('Upgrade') || btn.textContent?.includes('Subscribe')) {
                const container = btn.closest('div[class*="Box"]');
                if (container) (container as HTMLElement).style.display = 'none';
            }
        });

        // 4. Update Welcome Texts
        const h1 = document.querySelector('main h1');
        if (h1 && (h1.textContent?.includes('Hello') || h1.textContent?.includes('Welcome'))) {
          if (!h1.textContent.includes('Bienvenido a El Hub')) {
             h1.textContent = 'Bienvenido a El Hub';
          }
        }
        
        const sub = document.querySelector('main h1 + p');
        if (sub && (sub.textContent?.includes('Welcome') || sub.textContent?.includes('administration'))) {
          if (!sub.textContent.includes('Panel de Administración CMS')) {
             sub.textContent = 'Panel de Administración CMS';
          }
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    } catch (e) {
      console.error('El Hub customization error:', e);
    }
  },
};
