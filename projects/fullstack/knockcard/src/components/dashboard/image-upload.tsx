'use client'

import { useCallback, useState, type DragEvent, type ChangeEvent } from 'react'

import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const uploadFile = useCallback(
    async (file: File) => {
      setIsUploading(true)

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', 'knockcard')

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        })

        if (res.ok) {
          const data = await res.json()
          onChange(data.secure_url)
        }
      } finally {
        setIsUploading(false)
      }
    },
    [onChange]
  )

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setIsDragOver(false)

    const file = e.dataTransfer.files[0]

    if (file?.type.startsWith('image/')) {
      uploadFile(file)
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    setIsDragOver(true)
  }

  function handleDragLeave() {
    setIsDragOver(false)
  }

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]

    if (file) {
      uploadFile(file)
    }
  }

  if (value) {
    return (
      <div className="group relative inline-block">
        <img src={value} alt="" className="h-24 w-24 rounded-lg object-cover" />
        <button
          onClick={() => onChange(null)}
          className="absolute -right-2 -top-2 hidden rounded-full bg-red-500 p-1 text-white shadow group-hover:block"
        >
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <label
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 transition-colors',
        isDragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-gray-400',
        isUploading && 'pointer-events-none opacity-50'
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {isUploading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Uploading...
        </div>
      ) : (
        <>
          <svg
            className="h-8 w-8 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M2.25 18h15A2.25 2.25 0 0019.5 15.75V6a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6v9.75A2.25 2.25 0 006.75 18z"
            />
          </svg>
          <p className="mt-2 text-xs text-gray-500">Drop an image or click to upload</p>
        </>
      )}
      <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
    </label>
  )
}
