// components/projects/project-header.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import LanguageSwitcher from "@/components/language-switcher";
import { useLanguage } from "@/hooks/use-language";

interface ProjectHeaderProps {
  title: string;
  description: string;
}

export function ProjectHeader({ title, description }: ProjectHeaderProps) {
  const { t } = useLanguage();

  return (
    <>
      {/* Header simplificado */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md shadow-lg">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="bg-transparent border-0 cursor-pointer" aria-label="Home">
              <svg
                width="80"
                height="48"
                viewBox="0 0 50 30"
                className="hover:scale-105 transition-transform duration-300"
              >
                {/* Background shape */}
                <rect
                  x="1"
                  y="1"
                  width="48"
                  height="28"
                  rx="6"
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  strokeOpacity="0.3"
                />

                {/* J letter */}
                <path
                  d="M12 7v10c0 2-1 3-3 3s-3-1-3-3"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* V letter */}
                <path
                  d="M18 7l4 13 4-13"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />

                {/* Underscore and DEV */}
                <path d="M30 17h12" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
                <text x="30" y="13" fontFamily="monospace" fontSize="7" fontWeight="bold" fill="#e2e8f0">
                  DEV
                </text>

                {/* Tech circuit lines */}
                <path d="M3 15h2 M45 15h2" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.6" />
                <circle cx="5" cy="15" r="1" fill="#3b82f6" />
                <circle cx="45" cy="15" r="1" fill="#3b82f6" />
              </svg>
            </Link>
            <LanguageSwitcher />
          </div>
        </nav>
      </header>

        <div className="flex items-center mb-8">
          <Button
            asChild
            variant="ghost"
            className="mr-4 text-blue-500 hover:text-blue-400 hover:bg-blue-900/20 -ml-4"
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {String(t("common.back"))}
            </Link>
          </Button>
        </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
        <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
        <p className="text-slate-400 max-w-2xl mx-auto">{description}</p>
      </motion.div>
    </>
  );
}
