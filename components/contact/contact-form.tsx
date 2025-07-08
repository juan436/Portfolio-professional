"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Send, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { sendContactForm } from "@/services/client/emailService"
import { useLanguage } from "@/hooks/use-language"

interface ContactFormProps {
  translatedTexts: {
    formName: string
    email: string
    formSubject: string
    formMessage: string
    formSend: string
  }
}

export function ContactForm({ translatedTexts }: ContactFormProps) {
  const { language } = useLanguage()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [responseMessage, setResponseMessage] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    if (status === "success" || status === "error") {
      const timer = setTimeout(() => {
        setStatus("idle");
        setResponseMessage("");
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [status]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await sendContactForm({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        language: language.code
      })

      if (response.status === 'success') {
        setStatus('success')
        setResponseMessage(response.message)
        // Reset form
        setFormData({ name: "", email: "", subject: "", message: "" })
      } else {
        setStatus('error')
        setResponseMessage(response.message)
      }
    } catch (error) {
      setStatus('error')
      setResponseMessage("Error al conectar con el servidor. Por favor, inténtalo de nuevo más tarde.")
    }

    // Resetear el estado después de 5 segundos
    setTimeout(() => {
      if (status === 'success' || status === 'error') {
        setStatus('idle')
        setResponseMessage("")
      }
    }, 5000)
  }

  return (
    <Card className="bg-black/40 border-blue-700/20">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                {translatedTexts.formName}
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={translatedTexts.formName}
                required
                disabled={status === 'loading'}
                className="bg-black/40 border-blue-700/20 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {translatedTexts.email}
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu.email@ejemplo.com"
                required
                disabled={status === 'loading'}
                className="bg-black/40 border-blue-700/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">
              {translatedTexts.formSubject}
            </label>
            <Input
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder={translatedTexts.formSubject}
              required
              disabled={status === 'loading'}
              className="bg-black/40 border-blue-700/20 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              {translatedTexts.formMessage}
            </label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder={translatedTexts.formMessage}
              required
              disabled={status === 'loading'}
              className="min-h-[150px] bg-black/40 border-blue-700/20 focus:border-blue-500"
            />
          </div>

          {status === 'success' && (
            <div className="bg-green-900/20 border border-green-700/30 text-green-400 p-3 rounded-md flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>{responseMessage}</span>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-900/20 border border-red-700/30 text-red-400 p-3 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{responseMessage}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-700/50"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {translatedTexts.formSend}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
