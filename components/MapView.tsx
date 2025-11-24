import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Organization } from '../types';
import { ExternalLink, MapPin, Heart, Phone, Mail } from 'lucide-react';
import L from 'leaflet';

// Fix for default leaflet icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  organizations: Organization[];
  selectedOrgId: string | null;
  onSelectOrg: (id: string) => void;
}

const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13, { duration: 1.5 });
  }, [center, map]);
  return null;
};

export const MapView: React.FC<MapViewProps> = ({ organizations, selectedOrgId, onSelectOrg }) => {
  const selectedOrg = organizations.find(c => c.id === selectedOrgId);
  // Center between Odesa, Mykolaiv, Kherson (approx Mykolaiv coordinates)
  const defaultCenter: [number, number] = [46.9750, 31.9946]; 

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={8} // Zoomed out to see all three cities
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {selectedOrg && (
          <MapUpdater center={[selectedOrg.lat, selectedOrg.lng]} />
        )}

        {organizations.map((org) => (
          <Marker
            key={org.id}
            position={[org.lat, org.lng]}
            eventHandlers={{
              click: () => onSelectOrg(org.id),
            }}
          >
            <Popup className="min-w-[240px]">
              <div className="p-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-base text-slate-800 flex items-center gap-1 pr-2">
                     <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
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

                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-700">
                        <Phone className="w-3 h-3 text-teal-600" />
                        <a href={`tel:${org.phone}`} className="hover:underline">{org.phone}</a>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-700">
                        <Mail className="w-3 h-3 text-teal-600" />
                        <a href={`mailto:${org.email}`} className="hover:underline">{org.email}</a>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={org.driveFolderUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 bg-teal-600 hover:bg-teal-700 text-white text-xs py-1.5 px-2 rounded transition shadow-sm"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Документи (Drive)
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-lg shadow-md z-[1000] text-xs text-slate-600 border border-slate-200">
        <div className="font-bold mb-1">Регіони:</div>
        <div>Одеська, Миколаївська, Херсонська</div>
      </div>
    </div>
  );
};