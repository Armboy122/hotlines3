"use client";

import { useState, useCallback, useEffect, memo } from "react";
import dynamic from "next/dynamic";
import { Toast } from "antd-mobile";
import type { LocationPickerProps } from "../types";

// Dynamic import Map component เพื่อหลีกเลี่ยง SSR issues
const Map = dynamic(() => import("@/components/ui/map-component"), {
  ssr: false,
  loading: () => <MapLoading />,
});

/**
 * Component สำหรับเลือกตำแหน่งบนแผนที่
 * รองรับ GPS และการเลือกด้วยตนเอง
 */
function LocationPickerComponent({ value, onChange }: LocationPickerProps) {
  const [loading, setLoading] = useState(false);

  // ดึงตำแหน่งปัจจุบันจาก GPS
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      Toast.show({ content: "เบราว์เซอร์ไม่รองรับ GPS", icon: "fail" });
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        Toast.show({ content: "ระบุตำแหน่งสำเร็จ", icon: "success" });
        setLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        Toast.show({ content: "ไม่สามารถระบุตำแหน่งได้", icon: "fail" });
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [onChange]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <LocationIcon />
          ระบุตำแหน่ง (ถ้ามี)
        </label>

        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 disabled:opacity-50 transition-colors"
        >
          {loading ? <LoadingSpinner /> : <GpsIcon />}
          ใช้ตำแหน่งปัจจุบัน
        </button>
      </div>

      {/* Map Container */}
      <div className="rounded-xl overflow-hidden border-2 border-gray-200">
        <MapWithErrorBoundary
          value={value || undefined}
          onChange={onChange}
        />
      </div>

      {/* Coordinates Display */}
      {value && <CoordinatesDisplay lat={value.lat} lng={value.lng} />}
    </div>
  );
}

// ========== Map with Error Boundary ==========

function MapWithErrorBoundary({
  value,
  onChange,
}: {
  value?: { lat: number; lng: number };
  onChange: (val: { lat: number; lng: number }) => void;
}) {
  const [hasError, setHasError] = useState(false);

  // Listen for map-related errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes("leaflet") || event.message?.includes("map")) {
        setHasError(true);
      }
    };
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return <MapError onRetry={() => setHasError(false)} />;
  }

  return <Map value={value} onChange={onChange} />;
}

// ========== Sub Components ==========

function MapLoading() {
  return (
    <div className="h-[250px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center">
      <svg className="w-10 h-10 text-gray-400 animate-bounce" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
    </div>
  );
}

function MapError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="h-[250px] w-full bg-gray-100 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500">
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span className="text-sm">ไม่สามารถโหลดแผนที่ได้</span>
      <button
        type="button"
        onClick={onRetry}
        className="text-xs text-emerald-600 hover:underline"
      >
        ลองอีกครั้ง
      </button>
    </div>
  );
}

const CoordinatesDisplay = memo(function CoordinatesDisplay({
  lat,
  lng,
}: {
  lat: number;
  lng: number;
}) {
  return (
    <div className="flex items-center justify-end gap-2 text-xs text-gray-500">
      <span>Lat: {lat.toFixed(6)}</span>
      <span>Lng: {lng.toFixed(6)}</span>
    </div>
  );
});

// ========== Icons ==========

function LocationIcon() {
  return (
    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  );
}

function GpsIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4m10-10h-4M6 12H2" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <div className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
  );
}

export const LocationPicker = memo(LocationPickerComponent);
