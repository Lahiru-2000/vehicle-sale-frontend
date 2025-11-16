'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface ImageUploadProps {
  onImagesChange: (images: string[]) => void
  initialImages?: string[]
  maxImages?: number
  className?: string
}

export default function ImageUpload({ 
  onImagesChange, 
  initialImages = [], 
  maxImages = 5,
  className = '' 
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync internal state with initialImages prop changes
  useEffect(() => {
    setImages(initialImages)
  }, [initialImages])

  const handleFileSelect = async (files: FileList) => {
    if (!files || files.length === 0) return

    // Check if adding these files would exceed max limit
    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    setUploading(true)
    
    try {
      // Convert files to base64 data URLs for the new system
      const base64Images: string[] = []
      
      for (const file of Array.from(files)) {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']
        if (!validTypes.includes(file.type)) {
          toast.error(`Invalid file type: ${file.type}. Supported: JPG, PNG, GIF, WebP, BMP`)
          continue
        }

        // Validate file size (10MB max)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
          toast.error(`File too large: ${Math.round(file.size / 1024 / 1024)}MB. Max size: 10MB`)
          continue
        }

        // Convert to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        base64Images.push(base64)
      }

      if (base64Images.length > 0) {
        const newImages = [...images, ...base64Images]
        setImages(newImages)
        onImagesChange(newImages)
        toast.success(`Successfully processed ${base64Images.length} image(s)`)
      }
      
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to process images')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    handleFileSelect(files)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files)
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onImagesChange(newImages)
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [removed] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, removed)
    setImages(newImages)
    onImagesChange(newImages)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          disabled={uploading || images.length >= maxImages}
        />
        
        {uploading ? (
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span>Uploading images...</span>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium">Upload Vehicle Images</p>
              <p className="text-sm text-gray-500">
                Drag and drop or click to select images
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supports: JPG, PNG, GIF, WebP, BMP (Max 10MB each, {maxImages} images total)
              </p>
              <p className="text-xs text-gray-400">
                {images.length} / {maxImages} images uploaded
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Uploaded Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {image ? (
                    <Image
                      src={image}
                      alt={`Upload ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized={true}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  
                  {/* Image Number */}
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
