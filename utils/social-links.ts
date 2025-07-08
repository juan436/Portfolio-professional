/**
 * Utilidades para manejar enlaces a redes sociales
 */

// Número de WhatsApp sin el signo +
const WHATSAPP_NUMBER = "584125086548";

// URLs de redes sociales centralizadas
export const SOCIAL_LINKS = {
  GITHUB: "https://github.com/juan436",
  LINKEDIN: "https://www.linkedin.com/in/juan-villegas-aaa05b20a/",
  TWITTER: "https://x.com/juanVillegas80",
};

// Clave para las traducciones de mensajes de WhatsApp
export const WHATSAPP_MESSAGE_KEY = "social.whatsapp_message";

/**
 * Abre el chat de WhatsApp en una nueva pestaña
 */
export const openWhatsApp = (): void => {
  window.open(`https://wa.me/${WHATSAPP_NUMBER}`, "_blank");
};

/**
 * Abre el chat de WhatsApp con un mensaje predefinido según el idioma
 * @param translatedMessage Mensaje traducido para enviar
 */
export const openWhatsAppWithMessage = (translatedMessage: string): void => {
  const encodedMessage = encodeURIComponent(translatedMessage);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, "_blank");
};
