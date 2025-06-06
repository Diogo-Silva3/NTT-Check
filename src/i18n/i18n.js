// src/i18n/i18n.js
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          welcome: 'Welcome',
          goodbye: 'Goodbye',
        },
      },
      pt: {
        translation: {
          welcome: 'Bem-vindo',
          goodbye: 'Tchau',
        },
      },
      es: {
        translation: {
          welcome: 'Bienvenido',
          goodbye: 'Adiós',
        },
      },
    },
    lng: 'pt', // idioma inicial
    fallbackLng: 'en', // idioma de fallback
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
