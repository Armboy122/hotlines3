"use client";

import { useState, useCallback, useEffect, memo } from "react";
import dynamic from "next/dynamic";
import { Toast } from "antd-mobile";
import { Loader2, LocateFixed, MapPin, TriangleAlert } from "lucide-react";
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <MapPin className="h-4 w-4 text-red-500" aria-hidden="true" />
          ระบุตำแหน่ง (ถ้ามี)
        </label>

        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={loading}
          className="smart-home-control group flex min-h-11 items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-blue-700 transition-transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
        >
          {loading ? <LoadingSpinner /> : (
            <div className="transition-transform group-hover:scale-110">
              <LocateFixed className="h-4 w-4" aria-hidden="true" />
            </div>
          )}
          <span>ใช้ตำแหน่งปัจจุบัน</span>
        </button>
      </div>

      {/* Map Container */}
      <div className="smart-home-panel overflow-hidden p-1">
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
    <div className="flex h-[250px] w-full animate-pulse items-center justify-center rounded-xl bg-sky-50/70">
      <MapPin className="h-10 w-10 animate-bounce text-slate-400" aria-hidden="true" />
    </div>
  );
}

function MapError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex h-[250px] w-full flex-col items-center justify-center gap-2 rounded-xl bg-sky-50/70 text-slate-500">
      <TriangleAlert className="h-10 w-10" aria-hidden="true" />
      <span className="text-sm">ไม่สามารถโหลดแผนที่ได้</span>
      <button
        type="button"
        onClick={onRetry}
        className="text-xs font-semibold text-blue-600 hover:underline"
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
    <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-slate-500">
      <span>Lat: {lat.toFixed(6)}</span>
      <span>Lng: {lng.toFixed(6)}</span>
    </div>
  );
});

// ========== Icons ==========

function LoadingSpinner() {
  return (
    <Loader2 className="h-4 w-4 animate-spin text-blue-600" aria-hidden="true" />
  );
}

export const LocationPicker = memo(LocationPickerComponent);
