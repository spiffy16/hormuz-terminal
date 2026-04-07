import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore.js';

// Real Strait of Hormuz coordinates
const HORMUZ_CENTER = [26.57, 56.25];
const CHOKEPOINT = [26.5667, 56.25];

// Real tanker routes through the Strait (approx)
const VESSEL_ROUTES = [
  { id: 1, start: [26.85, 55.4], end: [25.9, 57.2], type: 'tanker', progress: 0.1, speed: 0.0008 },
  { id: 2, start: [25.9, 57.2], end: [26.85, 55.4], type: 'tanker', progress: 0.3, speed: 0.0006 },
  { id: 3, start: [26.75, 55.6], end: [26.0, 57.0], type: 'tanker', progress: 0.5, speed: 0.0007 },
  { id: 4, start: [26.0, 57.0], end: [26.75, 55.6], type: 'cargo', progress: 0.2, speed: 0.0005 },
  { id: 5, start: [26.9, 55.2], end: [25.85, 57.4], type: 'tanker', progress: 0.7, speed: 0.0009 },
  { id: 6, start: [25.85, 57.4], end: [26.9, 55.2], type: 'cargo', progress: 0.4, speed: 0.0006 },
  { id: 7, start: [26.8, 55.5], end: [25.95, 57.1], type: 'tanker', progress: 0.85, speed: 0.00075 },
];

function interp(start, end, t) {
  return [start[0] + (end[0] - start[0]) * t, start[1] + (end[1] - start[1]) * t];
}

export default function StrategicMap() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const vesselLayers = useRef([]);
  const chokeLayer = useRef(null);
  const vesselsState = useRef(VESSEL_ROUTES.map((v) => ({ ...v })));
  const escalation = useStore((s) => s.escalation);

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    if (typeof window === 'undefined' || !window.L) return;

    const L = window.L;
    const map = L.map(mapRef.current, {
      center: HORMUZ_CENTER,
      zoom: 8,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: false,
    });

    // Esri World Imagery — free, no key, high-res satellite
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 18 }
    ).addTo(map);

    // Dark overlay to make it feel like a tactical display
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png',
      { maxZoom: 18, opacity: 0.7 }
    ).addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Animate vessels + update chokepoint color
  useEffect(() => {
    if (!mapInstance.current || !window.L) return;
    const L = window.L;
    const map = mapInstance.current;

    // Clear previous
    vesselLayers.current.forEach((l) => map.removeLayer(l));
    vesselLayers.current = [];
    if (chokeLayer.current) map.removeLayer(chokeLayer.current);

    // Chokepoint color from escalation
    const chokeColor =
      escalation.probability >= 75 ? '#ff3b47' : escalation.probability >= 45 ? '#ffb020' : '#00ff9d';

    // Chokepoint marker
    chokeLayer.current = L.circleMarker(CHOKEPOINT, {
      radius: 14,
      color: chokeColor,
      fillColor: chokeColor,
      fillOpacity: 0.2,
      weight: 2,
      className: 'choke-pulse',
    }).addTo(map);
    L.circleMarker(CHOKEPOINT, {
      radius: 4,
      color: chokeColor,
      fillColor: chokeColor,
      fillOpacity: 1,
      weight: 1,
    }).addTo(map);

    const interval = setInterval(() => {
      vesselLayers.current.forEach((l) => map.removeLayer(l));
      vesselLayers.current = [];

      vesselsState.current.forEach((v) => {
        v.progress += v.speed * 20;
        if (v.progress >= 1) v.progress = 0;

        const pos = interp(v.start, v.end, v.progress);
        const color = v.type === 'tanker' ? '#ffb020' : '#4fc3f7';

        const marker = L.circleMarker(pos, {
          radius: 4,
          color,
          fillColor: color,
          fillOpacity: 1,
          weight: 1,
        }).addTo(map);

        const ring = L.circleMarker(pos, {
          radius: 8,
          color,
          fillOpacity: 0,
          weight: 1,
          opacity: 0.5,
        }).addTo(map);

        vesselLayers.current.push(marker, ring);
      });
    }, 200);

    return () => clearInterval(interval);
  }, [escalation.probability]);

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-header">
        <span>STRATEGIC MAP // STRAIT OF HORMUZ [SATELLITE]</span>
        <span className="text-terminal-dim">{VESSEL_ROUTES.length} TRACKS · ESRI IMAGERY</span>
      </div>
      <div className="p-2 flex-1 relative" style={{ minHeight: 340 }}>
        <div
          ref={mapRef}
          className="absolute inset-2"
          style={{ background: '#05070a', border: '1px solid #1a2332' }}
        />
        <div className="absolute top-3 left-3 z-[400] font-mono text-[9px] text-terminal-accent bg-black/70 px-2 py-1 border border-terminal-border">
          26.57°N 56.25°E
        </div>
        <div className="absolute top-3 right-3 z-[400] font-mono text-[9px] text-terminal-amber bg-black/70 px-2 py-1 border border-terminal-border">
          ● LIVE SAT FEED
        </div>
      </div>
      <div className="px-3 py-2 border-t border-terminal-border text-[10px] font-mono text-terminal-dim flex justify-between">
        <span style={{ color: '#ffb020' }}>● TANKER</span>
        <span style={{ color: '#4fc3f7' }}>● CARGO</span>
        <span>● CHOKE-STATE</span>
      </div>
    </div>
  );
}
