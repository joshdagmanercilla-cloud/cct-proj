import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Compass, Home, Building2, ExternalLink } from 'lucide-react';
import { Job } from '../types';

export const LOCATION_COORDINATES: Record<string, [number, number]> = {
  'Marabulig 1, Cauayan City': [16.9248, 121.7512],
  'Marabulig 2, Cauayan City': [16.9189, 121.7450],
  'San Fermin, Cauayan City': [16.9385, 121.7745],
  'District 1 (Poblacion), Cauayan City': [16.9312, 121.7718],
  'District 2, Cauayan City': [16.9330, 121.7680],
  'District 3, Cauayan City': [16.9360, 121.7650],
  'Tagaran, Cauayan City': [16.9520, 121.7820],
  'Cabaruan, Cauayan City': [16.9290, 121.7580],
  'Alicia, Isabela': [16.7822, 121.6961],
  'Naguilian, Isabela': [17.0250, 121.8340],
  'San Mateo, Isabela': [16.8820, 121.5850],
};

export function getCoordinatesForHome(homeLocation: string): [number, number] {
  if (LOCATION_COORDINATES[homeLocation]) {
    return LOCATION_COORDINATES[homeLocation];
  }
  for (const [key, coords] of Object.entries(LOCATION_COORDINATES)) {
    const mainName = key.split(',')[0].toLowerCase();
    if (homeLocation.toLowerCase().includes(mainName)) {
      return coords;
    }
  }
  return [16.9248, 121.7512]; // Default: Marabulig 1, Cauayan City
}

export function getCoordinatesForJob(job: Job): [number, number] {
  const fullText = `${job.location} ${job.exactAddress || ''} ${job.landmark || ''}`.toLowerCase();
  
  if (fullText.includes('marabulig 1')) return [16.9248, 121.7512];
  if (fullText.includes('marabulig 2')) return [16.9189, 121.7450];
  if (fullText.includes('san fermin') || fullText.includes('sm city')) return [16.9385, 121.7745];
  if (fullText.includes('tagaran') || fullText.includes('isabela state university')) return [16.9520, 121.7820];
  if (fullText.includes('cabaruan') || fullText.includes('airport') || fullText.includes('cyber hub')) return [16.9290, 121.7580];
  if (fullText.includes('district 1') || fullText.includes('poblacion') || fullText.includes('rizal avenue') || fullText.includes('centro') || fullText.includes('market')) return [16.9312, 121.7718];
  if (fullText.includes('alicia') || fullText.includes('victoria')) return [16.7822, 121.6961];
  if (fullText.includes('naguilian')) return [17.0250, 121.8340];
  if (fullText.includes('san mateo')) return [16.8820, 121.5850];
  
  // Default to Cauayan City Poblacion
  return [16.9312, 121.7718];
}

interface MiniJobMapProps {
  job: Job;
  userHomeLocation: string;
  distanceKm: number;
  minutes: number;
  commuteMode: string;
  onHomeLocationChange?: (newLoc: string) => void;
}

export const MiniJobMap: React.FC<MiniJobMapProps> = ({
  job,
  userHomeLocation,
  distanceKm,
  minutes,
  commuteMode,
  onHomeLocationChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const isRemote = job.arrangement === 'Remote' || job.location.toLowerCase().includes('remote');
  const homeCoords = getCoordinatesForHome(userHomeLocation);
  const jobCoords = getCoordinatesForJob(job);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Remove any previous map instance to prevent "Map container is already initialized"
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const container = mapContainerRef.current;
    
    // Center point between home and job
    const centerLat = isRemote ? homeCoords[0] : (homeCoords[0] + jobCoords[0]) / 2;
    const centerLng = isRemote ? homeCoords[1] : (homeCoords[1] + jobCoords[1]) / 2;

    const map = L.map(container, {
      center: [centerLat, centerLng],
      zoom: isRemote ? 14 : 12,
      scrollWheelZoom: false, // Prevent accidental scrolling while scrolling modal
      zoomControl: true,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map);

    // Custom Home DivIcon (Emerald styling with pulse effect)
    const homeIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
          <div style="position: absolute; width: 34px; height: 34px; background-color: rgba(16, 185, 129, 0.35); border-radius: 9999px; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 28px; height: 28px; background: linear-gradient(135deg, #059669, #047857); color: white; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(4, 120, 87, 0.4); border: 2.5px solid #ffffff; font-weight: bold; font-size: 13px;">
            🏠
          </div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    // Custom Job DivIcon (Blue/Indigo styling with business badge)
    const jobIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
          <div style="position: absolute; width: 36px; height: 36px; background-color: rgba(59, 130, 246, 0.3); border-radius: 9999px;"></div>
          <div style="position: relative; width: 30px; height: 30px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(29, 78, 216, 0.45); border: 2.5px solid #ffffff; font-weight: bold; font-size: 14px;">
            🏢
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    // Add Home Marker
    const homeMarker = L.marker(homeCoords, { icon: homeIcon }).addTo(map);
    homeMarker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 2px;">
        <div style="font-weight: 800; color: #065f46; margin-bottom: 2px;">🟢 Your Home Location</div>
        <div style="color: #334155; font-weight: 600;">${userHomeLocation}</div>
      </div>
    `);

    // If not remote, add Job Marker and Polyline
    if (!isRemote) {
      const jobMarker = L.marker(jobCoords, { icon: jobIcon }).addTo(map);
      jobMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 2px; max-width: 220px;">
          <div style="font-weight: 800; color: #1e40af; margin-bottom: 2px;">🏢 ${job.company}</div>
          <div style="font-weight: 600; color: #0f172a; margin-bottom: 3px;">${job.title}</div>
          <div style="color: #64748b; font-size: 11px;">${job.exactAddress || job.location}</div>
          ${job.landmark ? `<div style="color: #0369a1; font-size: 10.5px; margin-top: 2px;">📍 Near: ${job.landmark}</div>` : ''}
        </div>
      `);

      // Connecting Route Line (Emerald Dash)
      const latlngs: [number, number][] = [homeCoords, jobCoords];
      const polyline = L.polyline(latlngs, {
        color: '#059669',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '6, 8',
      }).addTo(map);

      // Add a midpoint distance marker / tooltip
      polyline.bindTooltip(
        `<span style="font-weight: 800; font-size: 11px; color: #065f46;">${distanceKm} km • ~${minutes} mins</span>`,
        { permanent: true, direction: 'center', className: 'commute-distance-tooltip' }
      );

      // Fit bounds with padding so both markers and the route line are nicely visible
      const bounds = L.latLngBounds([homeCoords, jobCoords]);
      map.fitBounds(bounds, {
        padding: [38, 38],
        maxZoom: 14,
      });
    }

    // Invalidate map size after DOM transition
    const timer = setTimeout(() => {
      map.invalidateSize();
      setMapLoaded(true);
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [job, userHomeLocation, isRemote, distanceKm, minutes]);

  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    if (isRemote) {
      mapInstanceRef.current.setView(homeCoords, 14);
    } else {
      const bounds = L.latLngBounds([homeCoords, jobCoords]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [38, 38], maxZoom: 14 });
    }
  };

  return (
    <div className="space-y-2 mt-2">
      {/* Map Header with Quick Origin Selector & Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Compass className="w-3.5 h-3.5 text-emerald-700" />
          <span>Interactive Proximity Map</span>
          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300">
            Leaflet • OSM
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onHomeLocationChange && (
            <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-emerald-200 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">Home:</span>
              <select
                value={userHomeLocation}
                onChange={(e) => onHomeLocationChange(e.target.value)}
                className="text-[11px] font-bold text-emerald-900 bg-transparent focus:outline-none cursor-pointer max-w-[140px] truncate"
              >
                <option value="Marabulig 1, Cauayan City">Marabulig 1</option>
                <option value="Marabulig 2, Cauayan City">Marabulig 2</option>
                <option value="San Fermin, Cauayan City">San Fermin (SM)</option>
                <option value="District 1 (Poblacion), Cauayan City">District 1 (Centro)</option>
                <option value="Tagaran, Cauayan City">Tagaran</option>
                <option value="Cabaruan, Cauayan City">Cabaruan (Airport)</option>
                <option value="Alicia, Isabela">Alicia</option>
                <option value="Naguilian, Isabela">Naguilian</option>
                <option value="San Mateo, Isabela">San Mateo</option>
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={handleResetView}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-white hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 transition shadow-2xs flex items-center gap-1 whitespace-nowrap"
            title="Reset map view to show both points"
          >
            <Navigation className="w-3 h-3" /> Reset View
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-300 shadow-inner bg-slate-100 h-56 sm:h-64 w-full">
        <div ref={mapContainerRef} className="h-full w-full z-0" />

        {/* Remote overlay if applicable */}
        {isRemote && (
          <div className="absolute top-3 left-3 right-3 z-[400] bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-blue-200 shadow-md flex items-center gap-2 text-xs">
            <span className="text-base">🌐</span>
            <div>
              <strong className="text-blue-900 block font-bold">100% Remote / Work from Home</strong>
              <span className="text-slate-600 text-[11px]">No daily travel required. Position is performed from your home.</span>
            </div>
          </div>
        )}

        {/* Floating Mini Compass & Distance Badge */}
        {!isRemote && (
          <div className="absolute bottom-2.5 left-2.5 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/90 shadow-md flex items-center gap-2 text-xs">
            <span className="font-extrabold text-emerald-800">{distanceKm} km commute</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 text-[11px]">~{minutes} mins via {commuteMode}</span>
          </div>
        )}
      </div>

      {/* Map Legend & Open Directions button */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
            <span className="font-semibold text-slate-700">Home:</span>
            <span className="text-slate-600 truncate max-w-[120px] sm:max-w-[150px]">{userHomeLocation.split(',')[0]}</span>
          </div>
          {!isRemote && (
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
              <span className="font-semibold text-slate-700">Workplace:</span>
              <span className="text-slate-600 truncate max-w-[120px] sm:max-w-[150px]">{job.company}</span>
            </div>
          )}
        </div>

        <a
          href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(userHomeLocation + ', Isabela')}&destination=${encodeURIComponent((job.exactAddress || job.location) + ', Isabela')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline"
        >
          <span>Open Full GPS Navigation</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
