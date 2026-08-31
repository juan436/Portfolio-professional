/**
 * Utilidades para manejar enlaces a redes sociales
 */

export const WHATSAPP_NUMBER = "14099953886";

export const SOCIAL_LINKS = {
  GITHUB: "https://github.com/juan436",
  LINKEDIN: "https://www.linkedin.com/in/juan-villegas-aaa05b20a/",
  TWITTER: "https://x.com/juanVillegas80",
};

export const WHATSAPP_MESSAGE_KEY = "social.whatsapp_message";

export const openWhatsApp = (): void => {
  window.open(`https://wa.me/${WHATSAPP_NUMBER}`, "_blank");
};

export const openWhatsAppWithMessage = (translatedMessage: string): void => {
  const encodedMessage = encodeURIComponent(translatedMessage);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, "_blank");
};
