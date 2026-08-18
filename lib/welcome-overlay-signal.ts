// Señal compartida en memoria (no sessionStorage) para que el widget del lobo
// sepa cuándo termina la superposición de bienvenida de primera visita.
// No se puede resolver leyendo sessionStorage desde el propio lobo: por el
// orden de efectos de React (welcome-animation corre antes, es hijo dentro
// de `children` en app/layout.tsx), la bandera "hasVisitedBefore" ya está en
// true para cuando el lobo la lee, sea o no la primera visita real.
export const welcomeOverlaySignal = {
  activeUntil: 0,
}
