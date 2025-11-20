"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { MapPin, Crosshair, Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { toast } from "sonner"

const Map = dynamic(() => import('./map-component'), { 
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">
        <MapPin className="h-10 w-10 animate-bounce" />
    </div>
  )
})

interface LocationPickerProps {
  value?: { lat: number, lng: number } | null
  onChange: (val: { lat: number, lng: number }) => void
  label?: string
}

const GEO_ERROR_CODES = {
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3,
} as const

const formatGeolocationError = (error: GeolocationPositionError) => {
  switch (error.code) {
    case GEO_ERROR_CODES.PERMISSION_DENIED:
      return "ระบบไม่ได้รับสิทธิ์การเข้าถึงตำแหน่ง กรุณาอนุญาต Location Access"
    case GEO_ERROR_CODES.POSITION_UNAVAILABLE:
      return "ไม่สามารถอ่านตำแหน่งจากอุปกรณ์ได้ ตรวจสอบสัญญาณ GPS หรือเครือข่าย"
    case GEO_ERROR_CODES.TIMEOUT:
      return "ใช้เวลานานเกินไปในการค้นหาตำแหน่ง กรุณาลองใหม่อีกครั้ง"
    default: {
      if (typeof window !== "undefined" && !window.isSecureContext) {
        return "เบราว์เซอร์บังคับให้ใช้งานผ่าน HTTPS หรือ http://localhost เพื่อใช้ตำแหน่งปัจจุบัน"
      }
      return error.message || "ไม่สามารถระบุตำแหน่งได้ กรุณาลองใหม่อีกครั้ง"
    }
  }
}

export function LocationPicker({ value, onChange, label = "ระบุตำแหน่ง (ถ้ามี)" }: LocationPickerProps) {
  const [loading, setLoading] = useState(false)
  const hasRequestedInitialLocation = useRef(false)

  const handleGetCurrentLocation = useCallback((options?: { silent?: boolean }) => {
    const isSilent = options?.silent ?? false

    const notifyError = (message: string) => {
      if (isSilent) {
        toast.warning(message)
      } else {
        toast.error(message)
      }
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      notifyError("เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง")
      if (!isSilent) {
        setLoading(false)
      }
      return
    }

    if (!isSilent) {
      setLoading(true)
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        if (!isSilent) {
          toast.success("ระบุตำแหน่งปัจจุบันสำเร็จ")
          setLoading(false)
        }
      },
      (error) => {
        const message = formatGeolocationError(error)
        console.error("Geolocation error:", error)
        notifyError(message)
        if (!isSilent) {
          setLoading(false)
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  }, [onChange])

  useEffect(() => {
    if (value || hasRequestedInitialLocation.current) {
      return
    }
    hasRequestedInitialLocation.current = true
    handleGetCurrentLocation({ silent: true })
  }, [value, handleGetCurrentLocation])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-700">
            <MapPin className="h-4 w-4 text-red-500" />
            {label}
          </Label>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => handleGetCurrentLocation()}
            disabled={loading}
            className="h-8 text-xs gap-1 border-emerald-200 hover:bg-emerald-50 text-emerald-700"
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Crosshair className="h-3 w-3" />}
            ใช้ตำแหน่งปัจจุบัน
          </Button>
      </div>
      
      <Map 
        value={value || undefined} 
        onChange={onChange} 
      />
      
      {value && (
        <div className="text-xs text-gray-500 flex justify-end gap-2">
          <span>Lat: {value.lat.toFixed(6)}</span>
          <span>Lng: {value.lng.toFixed(6)}</span>
        </div>
      )}
    </div>
  )
}

