'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ImageIcon, AlertCircle } from 'lucide-react'

interface SafeImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  sizes?: string
  priority?: boolean
}

export function SafeImage({
  src,
  alt,
  width,
  height,
  className = "",
  fill = false,
  sizes,
  priority = false
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gray-100 border border-gray-200 rounded-lg ${className}`}
        style={!fill && width && height ? { width, height } : {}}
      >
        <AlertCircle className="w-8 h-8 text-gray-400 mb-2" />
        <p className="text-xs text-gray-500 text-center px-2">
          ไม่สามารถโหลดรูปภาพได้
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      {isLoading && (
        <div
          className={`absolute inset-0 flex items-center justify-center bg-gray-100 border border-gray-200 rounded-lg ${className}`}
          style={!fill && width && height ? { width, height } : {}}
        >
          <ImageIcon className="w-8 h-8 text-gray-400 animate-pulse" />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={className}
        onError={() => {
          setHasError(true)
          setIsLoading(false)
        }}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  )
}
