"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Mail, MapPin, Phone } from "lucide-react"

interface ContactInfoProps {
  translatedTexts: {
    info: string
    email: string
    phone: string
    location: string
  }
  contactInfo: {
    email: string
    phone: string
    location: string
  }
}

export function ContactInfo({ translatedTexts, contactInfo }: ContactInfoProps) {
  return (
    <Card className="bg-black/40 border-blue-700/20 h-full">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-6">{translatedTexts.info}</h3>

        <div className="space-y-6">
          <div className="flex items-start">
            <div className="mr-4 p-3 rounded-full bg-blue-700/10">
              <Mail className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h4 className="font-medium mb-1">{translatedTexts.email}</h4>
              <p className="text-slate-400">{contactInfo.email}</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="mr-4 p-3 rounded-full bg-blue-700/10">
              <Phone className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h4 className="font-medium mb-1">{translatedTexts.phone}</h4>
              <p className="text-slate-400">{contactInfo.phone}</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="mr-4 p-3 rounded-full bg-blue-700/10">
              <MapPin className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h4 className="font-medium mb-1">{translatedTexts.location}</h4>
              <p className="text-slate-400">{contactInfo.location}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
