import React from 'react';

/**
 * Renderiza un icono de Devicon con manejo especial para ciertos iconos
 * @param iconName Nombre del icono a renderizar
 * @param colored Si debe mostrarse coloreado o no
 * @param className Clases CSS adicionales para el icono
 * @returns Elemento JSX con el icono
 */
// Iconos cuyo nombre de clase Devicon no sigue el patrón regular
// `devicon-{nombre}-{plain|plain-wordmark}{ colored}` — cada uno tiene su
// propia forma real (sufijo distinto, o el "colored" en otro lugar del
// string). Antes eran 9 bloques if/else casi idénticos.
const specialIconClass: Record<string, (colored: boolean) => string> = {
  nextjs: (colored) => `devicon-nextjs-${colored ? "line" : "plain"}`,
  amazonwebservices: (colored) => `devicon-amazonwebservices-plain-wordmark${colored ? " colored" : ""}`,
  github: (colored) => `devicon-github-original${colored ? "-wordmark" : ""}`,
  express: (colored) => `devicon-express-original${colored ? "-wordmark" : ""}`,
  django: (colored) => `devicon-django-plain${colored ? " colored" : ""}`,
  flask: (colored) => `devicon-flask-original${colored ? "-wordmark" : ""}`,
  vercel: (colored) => `devicon-vercel-${colored ? "original" : "line"}`,
  wordpress: (colored) => `devicon-wordpress-${colored ? "plain-wordmark" : "plain"}`,
  prisma: (colored) => `devicon-prisma-original${colored ? "-wordmark" : ""}`,
};

export function renderDevIcon(
  iconName: string,
  colored: boolean = true,
  className: string = ""
): React.ReactNode {
  if (!iconName) return null;

  // Estilos base para el icono
  const baseStyle = colored === false ? { color: "white" } : {};

  const specialClass = specialIconClass[iconName]?.(colored);
  if (specialClass) {
    return <i className={`${specialClass} ${className}`} style={baseStyle}></i>;
  }

  // Casos especiales que usan sufijos diferentes
  const specialIcons: Record<string, string> = {
    nestjs: "plain-wordmark",
  };

  // Determinar el sufijo correcto
  const suffix = specialIcons[iconName] || "plain";
  const iconClass = `devicon-${iconName}-${suffix}${colored ? " colored" : ""} ${className}`;

  return <i className={iconClass} style={baseStyle}></i>;
}

/**
 * Renderiza un icono de Devicon para un objeto skill
 * @param skill Objeto skill con propiedades name, icon y colored
 * @param className Clases CSS adicionales para el icono
 * @returns Elemento JSX con el icono
 */
export function renderSkillIcon(
  skill: { name: string; icon: string; colored?: boolean },
  className: string = ""
): React.ReactNode {
  return renderDevIcon(skill.icon, skill.colored !== false, className);
}
