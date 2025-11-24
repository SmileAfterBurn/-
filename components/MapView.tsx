import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, AttributionControl } from 'react-leaflet';
import { Organization } from '../types';
import { MapPin, Heart, Phone, Mail } from 'lucide-react';
import L from 'leaflet';

// Function to create custom SVG icons
const createCustomIcon = (color: string, size: number) => {
  return new L.DivIcon({
    className: 'custom-marker-icon',
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); width: 100%; height: 100%;">
        <path d="M20 10c0 6-9 13-9 13s-9-7-9-13a6.5 6.5 0 0 1 13 0Z"></path>
        <circle cx="12" cy="10" r="3" fill="white"></circle>
      </svg>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

const defaultIcon = createCustomIcon('#0d9488', 36); // Teal-600
const selectedIcon = createCustomIcon('#dc2626', 42); // Red-600

interface MapViewProps {
  organizations: Organization[];
  selectedOrgId: string | null;
  onSelectOrg: (id: string) => void;
  center?: [number, number];
  zoom?: number;
}

const MapUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    // Defensive check: verify coordinates are valid numbers before flying
    if (center && !isNaN(center[0]) && !isNaN(center[1])) {
      map.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
};

export const MapView: React.FC<MapViewProps> = ({ 
  organizations, 
  selectedOrgId, 
  onSelectOrg,
  center = [46.9750, 31.9946], // Default near Mykolaiv
  zoom = 8
}) => {
  const selectedOrg = organizations.find(c => c.id === selectedOrgId);
  
  // Use organization location if selected, otherwise provided center
  // Ensure selectedOrg has valid coordinates before using them
  const targetCenter: [number, number] = (selectedOrg && selectedOrg.lat && selectedOrg.lng && !isNaN(selectedOrg.lat) && !isNaN(selectedOrg.lng))
    ? [selectedOrg.lat, selectedOrg.lng] as [number, number]
    : center as [number, number];
    
  // If target center is still invalid, fallback to default to prevent crash
  const safeCenter: [number, number] = (!targetCenter || isNaN(targetCenter[0]) || isNaN(targetCenter[1]))
    ? [46.9750, 31.9946]
    : targetCenter;

  const targetZoom = selectedOrg ? 15 : zoom;

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer
        center={safeCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        dragging={true}
        className="z-0"
        attributionControl={false}
      >
        <AttributionControl prefix="Ілля Чернов | Leaflet" position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater center={safeCenter} zoom={targetZoom} />

        {organizations.map((org) => {
          // Filter out organizations with invalid coordinates
          if (!org.lat || !org.lng || isNaN(org.lat) || isNaN(org.lng)) {
            return null;
          }

          const isSelected = selectedOrgId === org.id;
          return (
            <Marker
              key={org.id}
              position={[org.lat, org.lng]}
              icon={isSelected ? selectedIcon : defaultIcon}
              eventHandlers={{
                click: () => onSelectOrg(org.id),
              }}
              zIndexOffset={isSelected ? 1000 : 0}
            >
              <Popup className="min-w-[240px]">
                <div className="p-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-base text-slate-800 flex items-center gap-1 pr-2">
                       <Heart className={`w-4 h-4 shrink-0 ${isSelected ? 'text-red-500 fill-red-500' : 'text-rose-500 fill-rose-500'}`} />
                       {org.name}
                    </h3>
                  </div>
                  <div className="space-y-2 mb-3">
                    <p className="text-sm text-slate-600 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      {org.address}
                    </p>
                    
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                      <p className="text-xs font-bold text-slate-700 mb-1">Послуги:</p>
                      <p className="text-xs text-slate-600 leading-snug">{org.services}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-700">
                          <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          {org.phone ? (
                            <a href={`tel:${org.phone}`} className="hover:underline hover:text-teal-700 font-medium">
                              {org.phone}
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">Не вказано</span>
                          )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-700">
                          <Mail className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          {org.email ? (
                            <a 
                              href={`mailto:${org.email}?subject=Запит%20на%20допомогу`} 
                              className="hover:underline hover:text-teal-700 font-medium break-all"
                            >
                              {org.email}
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">Не вказано</span>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
