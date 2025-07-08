"use client"

import { Button } from "@/components/ui/button"
import { Github, Linkedin, X } from "lucide-react"
import { WhatsappIcon } from "@/components/icons/whatsapp-icon"
import { openWhatsAppWithMessage, SOCIAL_LINKS } from "@/utils/social-links"
import { useLanguage } from "@/hooks/use-language"
import Link from "next/link"

export function HeroSocialLinks() {
  const { t } = useLanguage();

  // Función para abrir WhatsApp con mensaje traducido
  const handleWhatsAppClick = () => {
    const message = String(t('social.whatsapp_message'));
    openWhatsAppWithMessage(message);
  };

  return (
    <div className="flex gap-4 mt-8">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full hover:bg-blue-700/10 hover:text-blue-500"
        asChild
      >
        <Link href={SOCIAL_LINKS.GITHUB} target="_blank" rel="noopener noreferrer">
          <Github className="h-5 w-5" />
        </Link>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="rounded-full hover:bg-blue-700/10 hover:text-blue-500"
        asChild
      >
        <Link href={SOCIAL_LINKS.LINKEDIN} target="_blank" rel="noopener noreferrer">
          <Linkedin className="h-5 w-5" />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full hover:bg-green-700/10 hover:text-green-500"
        onClick={handleWhatsAppClick}
      >
        <WhatsappIcon className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full hover:bg-blue-700/10 hover:text-blue-500"
        asChild
      >
        <Link href={SOCIAL_LINKS.TWITTER} target="_blank" rel="noopener noreferrer">
          <X className="h-5 w-5 scale-110" />
        </Link>
      </Button>
    </div>
  )
}
