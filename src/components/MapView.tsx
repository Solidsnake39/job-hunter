import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { JobOffer } from '../types';
import { CITY_COORDINATES, getScatterOffset, type GeoCoord } from '../utils/geoUtils';

// --- Fix Leaflet Default Icon Issues in Webpack/Vite ---
// @ts-ignore
import iconMarker2x from 'leaflet/dist/images/marker-icon-2x.png';
// @ts-ignore
import iconMarker from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconMarker2x,
    iconUrl: iconMarker,
    shadowUrl: iconShadow,
});

interface MapViewProps {
    jobs: JobOffer[];
    onJobClick: (job: JobOffer) => void;
}

// Custom Icons
const createClusterIcon = (count: number) => {
    return L.divIcon({
        html: `<div class="flex items-center justify-center w-full h-full bg-red-600 text-white rounded-full font-bold shadow-lg border-2 border-white text-sm">${count}</div>`,
        className: 'custom-cluster-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
};

const homeIcon = L.divIcon({
    html: `<div class="w-6 h-6 bg-indigo-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center">
             <div class="absolute -inset-4 bg-indigo-500/20 rounded-full animate-ping"></div>
             <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
           </div>`,
    className: 'custom-home-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

const jobIcon = (status: string) => L.divIcon({
    html: `<div class="w-4 h-4 ${status === 'APPLIED' ? 'bg-green-500' : 'bg-red-500'} rounded-full border-2 border-white shadow-md hover:scale-125 transition-transform"></div>`,
    className: 'custom-job-icon',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
});


// --- Sub-components for Map Logic ---

const ZoomHandler = ({ setZoom }: { setZoom: (z: number) => void }) => {
    useMapEvents({
        zoomend: (e) => {
            setZoom(e.target.getZoom());
        }
    });
    return null;
};

const RecenterBtn = () => {
    const map = useMap();
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                map.setView([50.8503, 4.3517], 8);
            }}
            className="absolute top-4 right-4 z-[400] bg-white/90 backdrop-blur text-slate-700 px-3 py-1.5 rounded-lg shadow-md border border-slate-200 font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2"
        >
            <span>Reset Vue</span>
        </button>
    );
};

// Component to handle Cluster clicks cleanly using useMap
const ClusterMarker = ({ cluster }: { cluster: any }) => {
    const map = useMap();
    return (
        <Marker
            position={[cluster.center.lat, cluster.center.lng]}
            icon={createClusterIcon(cluster.count)}
            eventHandlers={{
                click: () => {
                    map.flyTo([cluster.center.lat, cluster.center.lng], 12);
                }
            }}
        >
            <Popup>
                <div className="p-1">
                    <h3 className="font-bold text-gray-800 capitalize mb-1">{cluster.city}</h3>
                    <p className="text-xs text-gray-500">{cluster.count} offres d'emploi</p>
                    <div className="mt-2 text-[10px] text-blue-500 cursor-pointer">
                        Cliquez pour zoomer
                    </div>
                </div>
            </Popup>
        </Marker>
    );
};

export const MapView: React.FC<MapViewProps> = ({ jobs, onJobClick }) => {
    const [currentZoom, setCurrentZoom] = useState(8);

    // 1. Prepare Data: Map jobs to coordinates (or group them)
    // Structure: Record<CityName, { center: GeoCoord, jobs: JobOffer[] }>
    const cityGroups = useMemo(() => {
        const groups: Record<string, { center: GeoCoord, jobs: JobOffer[] }> = {};

        jobs.forEach(job => {
            // Find coordinate match
            const cityKey = Object.keys(CITY_COORDINATES).find(k => job.location.toLowerCase().includes(k));
            const coords = cityKey ? CITY_COORDINATES[cityKey] : null;

            if (coords && cityKey) {
                if (!groups[cityKey]) {
                    groups[cityKey] = { center: coords, jobs: [] };
                }
                groups[cityKey].jobs.push(job);
            }
        });
        return groups;
    }, [jobs]);

    // Data for "Cluster View" (Low Zoom)
    const clusters = Object.entries(cityGroups).map(([city, data]) => ({
        city,
        center: data.center,
        count: data.jobs.length,
        jobs: data.jobs
    }));

    // Data for "Scatter View" (High Zoom) - Flattens all jobs with offsets
    const scatterPoints = useMemo(() => {
        return jobs.map(job => {
            const cityKey = Object.keys(CITY_COORDINATES).find(k => job.location.toLowerCase().includes(k));
            const baseCoords = cityKey ? CITY_COORDINATES[cityKey] : null;

            if (!baseCoords) return null;

            const offset = getScatterOffset(job.id || 'unknown', 0.02); // 0.02 deg is approx 2km radius spread
            return {
                job,
                lat: baseCoords.lat + offset.lat,
                lng: baseCoords.lng + offset.lng
            };
        }).filter(Boolean) as { job: JobOffer, lat: number, lng: number }[];
    }, [jobs]);


    // THRESHOLD TO SWITCH VIEWS
    const ZOOM_THRESHOLD = 10;
    const showClusters = currentZoom < ZOOM_THRESHOLD;

    return (
        <div className="relative w-full h-full bg-slate-100 flex flex-col overflow-hidden">
            <div className="flex-1 relative m-4 bg-white rounded-2xl shadow-inner border border-slate-200 overflow-hidden z-0">

                <MapContainer
                    center={[50.8503, 4.3517]} // Center of Belgium
                    zoom={8}
                    scrollWheelZoom={true}
                    className="w-full h-full"
                    zoomControl={false}
                >
                    {/* Clean Map Style: CartoDB Positron */}
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />

                    <ZoomHandler setZoom={setCurrentZoom} />
                    <RecenterBtn />

                    {/* ALWAYS VISIBLE: HOME */}
                    <Marker position={[50.4761, 4.0061]} icon={homeIcon}>
                        <Popup className="custom-popup">
                            <div className="font-bold text-indigo-600">Domicile</div>
                            <div className="text-xs text-slate-500">Obourg</div>
                        </Popup>
                    </Marker>

                    {/* CONDITIONAL RENDER: CLUSTERS vs POINTS */}

                    {showClusters ? (
                        // --- CLUSTER VIEW ---
                        clusters.map(cluster => (
                            <ClusterMarker key={cluster.city} cluster={cluster} />
                        ))
                    ) : (
                        // --- DETAIL POINT VIEW ---
                        scatterPoints.map(pt => (
                            <Marker
                                key={pt.job.id}
                                position={[pt.lat, pt.lng]}
                                icon={jobIcon(pt.job.status || 'NEW')}
                                eventHandlers={{
                                    click: () => onJobClick(pt.job)
                                }}
                            >
                                <Popup>
                                    <div className="min-w-[200px]">
                                        <h4 className="font-bold text-sm text-slate-800">{pt.job.title}</h4>
                                        <div className="text-xs text-slate-500 mb-2">{pt.job.company} • {pt.job.location}</div>
                                        <button
                                            onClick={() => onJobClick(pt.job)}
                                            className="w-full bg-blue-600 text-white text-xs py-1.5 rounded hover:bg-blue-700 transition"
                                        >
                                            Voir l'offre
                                        </button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))
                    )}

                </MapContainer>
            </div>

            {/* Legend Overlay */}
            <div className="bg-white border-t border-slate-200 p-3 flex gap-6 text-xs text-slate-600 shrink-0 z-10 relative">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-indigo-600 rounded-full border border-white shadow-sm"></span> Domicile
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full border border-white shadow-sm"></span> Offre
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full border border-white shadow-sm"></span> Déjà postulé
                </div>
                <div className="ml-auto text-slate-400 italic">
                    {showClusters ? "Zoomer pour voir les détails" : "Vue détaillée active"} - {currentZoom}x
                </div>
            </div>
        </div>
    );
};

