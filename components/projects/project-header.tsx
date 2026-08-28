// components/projects/project-header.tsx
import { LocalizedLink as Link } from "@/components/common/localized-link"
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import LanguageSwitcher from "@/components/language-switcher";
import { useLanguage } from "@/hooks/use-language";
import { LogoMark } from "@/components/navbar/logo";

/**
 * Header compartido de todas las páginas de detalle/listado (proyectos, automatizaciones, agentes, laboratorio, certificados).
 * Recibe: `title`/`description`/`subtype?`/`hideHeader?` + `onBackClick?` (botón en vez de link) + `nav?` (backHref/viewMore).
 * Produce: header fijo (logo+idioma) opcional + título/descripción centrados con botón volver y link "ver más" opcional.
 */
interface ProjectHeaderProps {
  title: string;
  description: string;
  subtype?: string;
  hideHeader?: boolean;
  onBackClick?: () => void;
  nav?: {
    backHref?: string;
    viewMoreHref?: string;
    viewMoreLabel?: string;
  };
}

export function ProjectHeader({ title, description, subtype, hideHeader, onBackClick, nav }: ProjectHeaderProps) {
  const { t } = useLanguage();
  const backHref = nav?.backHref ?? "/";
  const { viewMoreHref, viewMoreLabel } = nav ?? {};

  return (
    <>
      {/* Header simplificado */}
      {!hideHeader && (
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md shadow-lg">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="bg-transparent border-0 cursor-pointer" aria-label="Home">
              <LogoMark />
            </Link>
            <LanguageSwitcher />
          </div>
        </nav>
      </header>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <div className="relative mb-4">
          {onBackClick ? (
            <button
              onClick={onBackClick}
              className="absolute left-0 top-1/2 -translate-y-1/2 inline-flex items-center border border-blue-700/50 text-blue-500 hover:bg-blue-700/10 hover:border-blue-500 transition-all duration-300 rounded-md px-4 py-2 text-sm font-medium"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {String(t("common.back"))}
            </button>
          ) : (
            <Link
              href={backHref}
              className="absolute left-0 top-1/2 -translate-y-1/2 inline-flex items-center border border-blue-700/50 text-blue-500 hover:bg-blue-700/10 hover:border-blue-500 transition-all duration-300 rounded-md px-4 py-2 text-sm font-medium"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {String(t("common.back"))}
            </Link>
          )}

          {viewMoreHref && viewMoreLabel && (
            <Link
              href={viewMoreHref}
              className="group absolute right-0 top-1/2 -translate-y-1/2 inline-flex items-center border border-blue-700/50 text-blue-500 hover:bg-blue-700/10 hover:border-blue-500 transition-all duration-300 rounded-md px-4 py-2 text-sm font-medium"
            >
              {viewMoreLabel}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}

          <h1 className="text-3xl md:text-4xl font-bold px-24 sm:px-32 line-clamp-2 leading-tight">{title}</h1>
        </div>
        <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
        {subtype && (
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-blue-300 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-1.5 mb-6 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
          >
            {subtype}
          </motion.span>
        )}
        <p className="text-slate-400 max-w-2xl mx-auto">{description}</p>
      </motion.div>
    </>
  );
}
