// import QuickActions from './extensions/components/QuickActions';
import type { StrapiApp } from '@strapi/strapi/admin';

const COLLECTION_TYPE_PRIORITY: Record<string, number> = {
  'api::page.page': 0,
  'api::folder.folder': 1,
  'api::categoria.categoria': 2,
  'api::client.client': 3,
};
const DEFAULT_COLLECTION_TYPE_UID = 'api::page.page';
const INITIAL_CM_REDIRECT_KEY = 'elhub.cm.initial-redirect.done';

function extractCollectionTypeUidFromHref(href: string): string | null {
  const marker = '/content-manager/collection-types/';
  const start = href.indexOf(marker);
  if (start === -1) return null;

  const tail = href.slice(start + marker.length);
  const uid = tail.split(/[/?#]/)[0];
  return uid || null;
}

function reorderContentManagerCollectionTypes(): void {
  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('nav a[href*="/content-manager/collection-types/"]')
  );

  if (links.length < 2) return;

  const groups = new Map<
    HTMLElement,
    Array<{ item: HTMLElement; uid: string; text: string; originalIndex: number }>
  >();

  links.forEach((link, index) => {
    const uid = extractCollectionTypeUidFromHref(link.href);
    if (!uid) return;

    const item = (link.closest('li') as HTMLElement | null) ?? link.parentElement;
    const parent = item?.parentElement;
    if (!item || !parent) return;

    if (!groups.has(parent)) {
      groups.set(parent, []);
    }

    const entries = groups.get(parent)!;
    if (entries.some((entry) => entry.item === item)) return;

    entries.push({
      item,
      uid,
      text: (link.textContent || '').trim().toLowerCase(),
      originalIndex: index,
    });
  });

  groups.forEach((entries, parent) => {
    if (entries.length < 2) return;

    const sorted = [...entries].sort((a, b) => {
      const rankA = COLLECTION_TYPE_PRIORITY[a.uid] ?? Number.MAX_SAFE_INTEGER;
      const rankB = COLLECTION_TYPE_PRIORITY[b.uid] ?? Number.MAX_SAFE_INTEGER;

      if (rankA !== rankB) return rankA - rankB;

      const byText = a.text.localeCompare(b.text);
      if (byText !== 0) return byText;

      return a.originalIndex - b.originalIndex;
    });

    const changed = sorted.some((entry, idx) => entry.item !== entries[idx]?.item);
    if (!changed) return;

    sorted.forEach((entry) => parent.appendChild(entry.item));
  });
}

function normalizePathname(pathname: string): string {
  if (!pathname) return '/';
  const normalized = pathname.replace(/\/+$/, '');
  return normalized || '/';
}

function ensureDefaultContentManagerEntry(): void {
  const currentPath = normalizePathname(window.location.pathname);
  const marker = '/content-manager';
  const markerIndex = currentPath.indexOf(marker);
  if (markerIndex === -1) return;

  const adminPrefix = currentPath.slice(0, markerIndex);
  const contentManagerRoot = `${adminPrefix}${marker}`;
  const defaultCollectionPath = `${contentManagerRoot}/collection-types/${DEFAULT_COLLECTION_TYPE_UID}`;
  const clientCollectionPath = `${contentManagerRoot}/collection-types/api::client.client`;

  if (currentPath === contentManagerRoot && currentPath !== defaultCollectionPath) {
    window.location.replace(defaultCollectionPath);
    return;
  }

  if (currentPath === clientCollectionPath) {
    const alreadyRedirected = sessionStorage.getItem(INITIAL_CM_REDIRECT_KEY) === '1';
    if (!alreadyRedirected) {
      sessionStorage.setItem(INITIAL_CM_REDIRECT_KEY, '1');
      window.location.replace(defaultCollectionPath);
    }
  }
}

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

        // 5. Keep Content Manager collection types in a fixed business-first order.
        reorderContentManagerCollectionTypes();
        ensureDefaultContentManagerEntry();
      });

      observer.observe(document.body, { childList: true, subtree: true });
      reorderContentManagerCollectionTypes();
      ensureDefaultContentManagerEntry();
    } catch (e) {
      console.error('El Hub customization error:', e);
    }
  },
};
