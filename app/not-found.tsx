"use client";

import Link from "next/link";

export default function NotFound() {
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-blue-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Página no encontrada</h2>
        <p className="mb-8">Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
        <Link 
          href="/" 
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 transition-colors rounded-md text-white font-medium"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
