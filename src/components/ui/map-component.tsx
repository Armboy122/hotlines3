"use client"

import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'

import L from 'leaflet'

// Fix Leaflet icon issue
// We use CDN for icons to avoid webpack loader issues with Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

function LocationMarker({ position, onChange }: { position?: { lat: number, lng: number }, onChange: (pos: { lat: number, lng: number }) => void }) {
  const map = useMapEvents({
    click(e) {
      onChange(e.latlng)
    },
  })
  
  useEffect(() => {
      if (position) {
          map.flyTo(position, map.getZoom())
      }
  }, [position, map])

  return position ? (
    <Marker position={position} icon={icon}></Marker>
  ) : null
}

interface MapComponentProps {
  value?: { lat: number, lng: number }
  onChange: (val: { lat: number, lng: number }) => void
}

export default function MapComponent({ value, onChange }: MapComponentProps) {
  const defaultCenter = { lat: 13.736717, lng: 100.523186 } // Bangkok
  
  return (
    <MapContainer center={value || defaultCenter} zoom={13} scrollWheelZoom={false} className="h-[300px] w-full rounded-xl z-0 border-2 border-emerald-100">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker position={value} onChange={onChange} />
    </MapContainer>
  )
}

