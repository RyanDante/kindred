import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { L, OSM_TILE_URL, OSM_ATTRIBUTION, coloredCircleIcon } from '../../lib/leafletSetup';

export interface LeafletMarkerSpec {
  id: string;
  lat: number;
  lng: number;
  style?: 'default' | 'circle';
  color?: string;
  title?: string;
  popupHtml?: string;
  hoverHtml?: string;
}

interface LeafletMapViewProps {
  className?: string;
  height?: string;
  centerLat: number;
  centerLng: number;
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  /** South-west then north-east corners: [[south, west], [north, east]] */
  maxBounds?: [[number, number], [number, number]];
  markers: LeafletMarkerSpec[];
  onMapClick?: (lat: number, lng: number) => void;
  onMarkerClick?: (id: string) => void;
}

export default function LeafletMapView({
  className = '',
  height = '100%',
  centerLat,
  centerLng,
  zoom,
  minZoom = 5,
  maxZoom = 18,
  maxBounds,
  markers,
  onMapClick,
  onMarkerClick,
}: LeafletMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const clickHandlerRef = useRef<((e: L.LeafletMouseEvent) => void) | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      minZoom,
      maxZoom,
      maxBounds: maxBounds ? L.latLngBounds(maxBounds[0], maxBounds[1]) : undefined,
      maxBoundsViscosity: 0.7,
    }).setView([centerLat, centerLng], zoom);

    L.tileLayer(OSM_TILE_URL, { attribution: OSM_ATTRIBUTION, maxZoom: 19 }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);

    if (onMapClick) {
      const handler = (e: L.LeafletMouseEvent) => onMapClick(e.latlng.lat, e.latlng.lng);
      clickHandlerRef.current = handler;
      map.on('click', handler);
    }

    mapRef.current = map;

    return () => {
      if (clickHandlerRef.current) {
        map.off('click', clickHandlerRef.current);
        clickHandlerRef.current = null;
      }
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setView([centerLat, centerLng], zoom, { animate: true });
  }, [centerLat, centerLng, zoom]);

  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer) return;

    layer.clearLayers();

    for (const m of markers) {
      const icon =
        m.style === 'circle' && m.color
          ? coloredCircleIcon(m.color, m.color === '#8B5CF6' ? 8 : 10)
          : undefined;

      const marker = icon
        ? L.marker([m.lat, m.lng], { icon, title: m.title })
        : L.marker([m.lat, m.lng], { title: m.title });

      if (m.popupHtml) {
        marker.bindPopup(m.popupHtml, { maxWidth: 280 });
      }
      if (m.hoverHtml) {
        marker.bindTooltip(m.hoverHtml, {
          direction: 'top',
          offset: [0, -10],
          sticky: true,
          opacity: 1,
          className: 'kindred-map-hover',
        });
      }

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onMarkerClick?.(m.id);
        if (m.popupHtml) marker.openPopup();
      });

      marker.addTo(layer);
    }
  }, [markers, onMarkerClick]);

  return <div ref={containerRef} className={`z-0 ${className}`} style={{ height, width: '100%', minHeight: 200 }} />;
}
