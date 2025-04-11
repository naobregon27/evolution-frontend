import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importación de traducciones
import translationES from './locales/es/translation.json';
import translationEN from './locales/en/translation.json';
import translationPT from './locales/pt/translation.json';

// Recursos de idiomas
const resources = {
  es: {
    translation: translationES
  },
  en: {
    translation: translationEN
  },
  pt: {
    translation: translationPT
  }
};

// Intentar obtener el idioma guardado, o usar el del navegador, o español por defecto
const getUserLanguage = () => {
  try {
    // Primero, intentar obtener desde Redux/localStorage
    const storedSettings = localStorage.getItem('app_settings');
    if (storedSettings) {
      const { language } = JSON.parse(storedSettings);
      if (language && ['es', 'en', 'pt'].includes(language)) {
        return language;
      }
    }
  } catch (error) {
    console.error('Error al obtener el idioma guardado:', error);
  }

  // Si no se puede obtener del localStorage, usar el idioma del navegador
  const browserLang = navigator.language.split('-')[0];
  return ['es', 'en', 'pt'].includes(browserLang) ? browserLang : 'es';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getUserLanguage(),
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false // React ya escapa por defecto
    },
    react: {
      useSuspense: false // Evitar problemas con Suspense
    },
    detection: {
      order: ['localStorage', 'navigator']
    }
  });

export default i18n; 