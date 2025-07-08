import React from 'react';

/**
 * Renderiza un icono de Devicon con manejo especial para ciertos iconos
 * @param iconName Nombre del icono a renderizar
 * @param colored Si debe mostrarse coloreado o no
 * @param className Clases CSS adicionales para el icono
 * @returns Elemento JSX con el icono
 */
export function renderDevIcon(
  iconName: string, 
  colored: boolean = true, 
  className: string = ""
): React.ReactNode {
  if (!iconName) return null;

  // Estilos base para el icono
  const baseStyle = colored === false ? { color: "white" } : {};
  
  // Caso especial para Next.js
  if (iconName === "nextjs") {
    return (
      <i
        className={`devicon-nextjs-${colored ? "line" : "plain"} ${className}`}
        style={baseStyle}
      ></i>
    );
  }
  // Caso especial para AWS
  else if (iconName === "amazonwebservices") {
    return (
      <i
        className={`devicon-amazonwebservices-plain-wordmark${colored ? " colored" : ""} ${className}`}
        style={baseStyle}
      ></i>
    );
  }
  // Caso especial para GitHub
  else if (iconName === "github") {
    return (
      <i
        className={`devicon-github-original${colored ? "-wordmark" : ""} ${className}`}
        style={baseStyle}
      ></i>
    );
  }
  // Caso especial para Express
  else if (iconName === "express") {
    return (
      <i
        className={`devicon-express-original${colored ? "-wordmark" : ""} ${className}`}
        style={baseStyle}
      ></i>
    );
  }
  // Caso especial para Django
  else if (iconName === "django") {
    return (
      <i
        className={`devicon-django-plain${colored ? " colored" : ""} ${className}`}
        style={baseStyle}
      ></i>
    );
  }
  // Caso especial para Flask
  else if (iconName === "flask") {
    return (
      <i
        className={`devicon-flask-original${colored ? "-wordmark" : ""} ${className}`}
        style={baseStyle}
      ></i>
    );
  }
  // Caso especial para Vercel
  else if (iconName === "vercel") {
    return (
      <i
        className={`devicon-vercel-${colored ? "original" : "line"} ${className}`}
        style={baseStyle}
      ></i>
    );
  }
  // Caso especial para WordPress
  else if (iconName === "wordpress") {
    return (
      <i
        className={`devicon-wordpress-${colored ? "plain-wordmark" : "plain"} ${className}`}
        style={baseStyle}
      ></i>
    );
  }
  // Caso especial para Prisma
  else if (iconName === "prisma") {
    return (
      <i
        className={`devicon-prisma-original${colored ? "-wordmark" : ""} ${className}`}
        style={baseStyle}
      ></i>
    );
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
