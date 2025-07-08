"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        // Extraer el título y la descripción si son objetos
        const displayTitle = typeof title === 'object' && title !== null 
          ? (title.title || title.message || JSON.stringify(title)) 
          : title;
          
        const displayDescription = typeof description === 'object' && description !== null
          ? (description.description || description.message || JSON.stringify(description))
          : description;

        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {displayTitle && <ToastTitle>{displayTitle}</ToastTitle>}
              {displayDescription && (
                <ToastDescription>{displayDescription}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
