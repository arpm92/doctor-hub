"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { uploadFile } from "@/lib/supabase"
import { Bold, Italic, List, ListOrdered, Link, Image, Upload } from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  doctorId: string
}

export function RichTextEditor({ value, onChange, doctorId }: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    onChange(newText)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido.')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('El archivo es demasiado grande. El tamaño máximo es 5MB.')
      return
    }

    setIsUploading(true)
    try {
      const fileName = `${doctorId}/${Date.now()}-${file.name}`
      const { data, error } = await uploadFile(file, 'article-images', fileName)

      if (error) {
        console.error('Error uploading image:', error)
        alert('Error al subir la imagen. Por favor intenta de nuevo.')
        return
      }

      if (data?.publicUrl) {
        insertText(`![Imagen](${data.publicUrl})`)
      }
    } catch (err) {
      console.error('Upload error:', err)
      alert('Error al subir la imagen. Por favor intenta de nuevo.')
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="border rounded-lg">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b bg-gray-50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText('**', '**')}
          title="Negrita"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText('*', '*')}
          title="Cursiva"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText('\n- ')}
          title="Lista con viñetas"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText('\n1. ')}
          title="Lista numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText('[texto del enlace](', ')')}
          title="Enlace"
        >
          <Link className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          title="Subir imagen"
        >
          {isUploading ? <Upload className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Editor */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Escribe tu artículo aquí... Puedes usar Markdown para dar formato al texto."
        className="min-h-[400px] border-0 resize-none focus-visible:ring-0"
      />

      {/* Help text */}
      <div className="p-3 border-t bg-gray-50 text-sm text-gray-600">
        <p className="mb-2"><strong>Consejos de formato:</strong></p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <div>• **texto** para <strong>negrita</strong></div>
          <div>• *texto* para <em>cursiva</em></div>
          <div>• # Título para encabezados</div>
          <div>• - elemento para listas</div>
          <div>• [texto](url) para enlaces</div>
          <div>• Usa el botón de imagen para subir fotos</div>
        </div>
      </div>
    </div>
  )
}
