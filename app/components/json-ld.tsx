import React from 'react';

export default function JsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    'name': 'Juan Villegas',
    'url': 'https://jvillegas-portafolio.jvserver.com/',
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
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
