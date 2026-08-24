import React from 'react';
import Script from 'next/script';

/**
 * Structured data (schema.org Person) para SEO, inyectado como `<script type="application/ld+json">`.
 * Recibe: nada (datos fijos del perfil).
 * Produce: `<Script>` con el JSON-LD embebido.
 */
export default function JsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    'name': 'Juan Villegas',
    'url': 'https://jevy.dev/',
    'jobTitle': 'Desarrollador Full Stack',
    'description': 'Desarrollador Full Stack especializado en Next.js, React, Node.js, Express, PHP y Laravel.',
    'knowsAbout': ['Desarrollo Web', 'React', 'Next.js', 'Node.js', 'PHP', 'Laravel'],
    'sameAs': [
      'https://github.com/juan436',
      'https://www.linkedin.com/in/juan-villegas-aaa05b20a/'
    ],
    'image': 'https://images.jvserver.com/images/profile/perfil-1751953703604-489800455.jpeg',
    'alumniOf': {
      '@type': 'EducationalOrganization',
      'name': 'Universidad Centroccidental "Lisandro Alvarado"'
    },
    'worksFor': {
      '@type': 'Organization',
      'name': 'Freelance'
    }
  };

  return (
    <Script
      id="json-ld"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
