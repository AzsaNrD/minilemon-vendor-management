'use client'

import { useRef, useState } from 'react'
import { Upload, X, FileImage } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Spinner } from './Spinner'

interface FileUploadProps {
  kind: 'KTP' | 'SIGNATURE' | 'LOGO'
  label?: string
  hint?: string
  required?: boolean
  value?: { fileKey?: string; previewUrl?: string }
  onChange: (val: { fileKey: string; previewUrl: string } | null) => void
  className?: string
  accept?: string
  maxSizeLabel?: string
}

export function FileUpload({
  kind,
  label,
  hint,
  required,
  value,
  onChange,
  className,
  accept,
  maxSizeLabel,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>()

  const acceptValue = accept || (kind === 'LOGO' ? 'image/png,image/svg+xml' : 'image/jpeg,image/png')

  async function handleFile(file: File) {
    setError(undefined)
    setUploading(true)
    try {
      const signRes = await fetch('/api/uploads/sign', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ kind, mimeType: file.type, sizeBytes: file.size }),
      })
      if (!signRes.ok) {
        const err = await signRes.json().catch(() => ({}))
        throw new Error(err.error || 'Gagal meminta URL upload')
      }
      const { uploadUrl, fileKey } = await signRes.json()

      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'content-type': file.type },
        body: file,
      })
      if (!putRes.ok) throw new Error('Gagal mengupload file')

      const confirmRes = await fetch('/api/uploads/confirm', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ fileKey }),
      })
      if (!confirmRes.ok) throw new Error('Konfirmasi upload gagal')
      const { url } = await confirmRes.json()

      onChange({ fileKey, previewUrl: url })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload gagal')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="block text-sm font-medium text-ink-800">
          {label}
          {required && <span className="text-coral-500 ml-0.5">*</span>}
        </label>
      )}
      {value?.previewUrl ? (
        <div className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value.previewUrl} alt="preview" className="h-16 w-16 rounded-lg object-cover bg-ink-50" />
          <div className="flex-1 text-sm text-ink-700 truncate">
            <p className="font-medium">File terupload</p>
            <p className="text-xs text-ink-500 truncate">{value.fileKey}</p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100"
            aria-label="Hapus file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-200 bg-white px-6 py-8',
            'hover:border-lemon-500 hover:bg-lemon-50 transition-colors',
            'disabled:opacity-60 disabled:cursor-not-allowed',
          )}
        >
          {uploading ? (
            <Spinner />
          ) : (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-100">
                {kind === 'KTP' || kind === 'LOGO' ? (
                  <FileImage className="h-5 w-5 text-ink-600" />
                ) : (
                  <Upload className="h-5 w-5 text-ink-600" />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-ink-800">Klik untuk upload</p>
                {maxSizeLabel && <p className="text-xs text-ink-500 mt-0.5">{maxSizeLabel}</p>}
              </div>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={acceptValue}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
      {error ? (
        <p className="text-xs text-coral-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-500">{hint}</p>
      ) : null}
    </div>
  )
}
