import React from 'react';
import type { JobOffer } from '../types';


interface MapViewProps {
    jobs: JobOffer[];
    onJobClick: (job: JobOffer) => void;
}

// Approximate coords for "Belgium" simplified view (0-100 range for CSS %, relative to a box)
// Let's assume a box covering roughly 50-51.5 N, 2.5-6.5 E
// We'll map locations to top/left percentages.
const CITY_COORDS: Record<string, { top: number, left: number }> = {
    'bruxelles': { top: 40, left: 50 },
    'antwerpen': { top: 20, left: 52 },
    'gand': { top: 30, left: 35 },
    'charleroi': { top: 65, left: 52 },
    'liège': { top: 45, left: 75 },
    'namur': { top: 60, left: 60 },
    'mons': { top: 65, left: 40 },
    'tournai': { top: 60, left: 25 },
    'bouge': { top: 60, left: 62 },
    'zaventem': { top: 38, left: 53 },
    'diegem': { top: 38, left: 53 },
    'obourg': { top: 62, left: 42 }, // Home base
    'nivelles': { top: 55, left: 48 },
    'wavre': { top: 50, left: 55 },
    'leuven': { top: 38, left: 60 },
    'asse': { top: 35, left: 45 },
    'halle': { top: 45, left: 45 },
    'kortrijk': { top: 45, left: 20 },
    'arlon': { top: 85, left: 85 }
};

export const MapView: React.FC<MapViewProps> = ({ jobs, onJobClick }) => {

    // Group jobs by simplified location key
    const clusters: Record<string, JobOffer[]> = {};
    const unknowns: JobOffer[] = [];

    jobs.forEach(job => {
        const cityKey = Object.keys(CITY_COORDS).find(k => job.location.toLowerCase().includes(k));
        if (cityKey) {
            if (!clusters[cityKey]) clusters[cityKey] = [];
            clusters[cityKey].push(job);
        } else {
            unknowns.push(job);
        }
    });

    return (
        <div className="relative w-full h-full bg-slate-100 overflow-hidden flex flex-col">
            {/* Map Container */}
            <div className="flex-1 relative m-4 bg-white rounded-2xl shadow-inner border border-slate-200 overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-200 via-transparent to-transparent" />

                {/* Simplified Belgium Map Background (CSS Shape or SVG) */}
                <div className="absolute inset-10 border-4 border-slate-100 rounded-[30%] opacity-50" />
                <div className="absolute top-[40%] left-[50%] text-[100px] font-bold text-slate-50 opacity-10 select-none pointer-events-none transform -translate-x-1/2 -translate-y-1/2">
                    BELGIQUE
                </div>

                {/* Home Base */}
                <div
                    className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg z-10 flex items-center justify-center animate-pulse"
                    style={{ top: `${CITY_COORDS['obourg'].top}%`, left: `${CITY_COORDS['obourg'].left}%` }}
                    title="Obourg (Domicile)"
                >
                    <div className="absolute -inset-4 bg-blue-500/20 rounded-full animate-ping" />
                </div>

                {/* Job Clusters */}
                {Object.entries(clusters).map(([city, clusterJobs]) => {
                    const coords = CITY_COORDS[city];
                    const size = Math.min(60, 24 + clusterJobs.length * 4); // Scale size by job count

                    return (
                        <div
                            key={city}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                            style={{ top: `${coords.top}%`, left: `${coords.left}%` }}
                            onClick={() => onJobClick(clusterJobs[0])} // Open first one or list? For now simple click
                        >
                            <div
                                className="rounded-full bg-white/90 backdrop-blur-sm border-2 border-red-500 shadow-md flex items-center justify-center transition-all hover:scale-110 hover:bg-red-50"
                                style={{ width: size, height: size }}
                            >
                                <span className="font-bold text-red-600 text-xs">{clusterJobs.length}</span>
                            </div>

                            {/* Tooltip */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-slate-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-30 transition-opacity">
                                {clusterJobs.length} offre(s) à {city.charAt(0).toUpperCase() + city.slice(1)}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend / Unknowns */}
            <div className="h-32 bg-white border-t border-slate-200 p-4 overflow-x-auto flex gap-4">
                <div className="min-w-[200px] flex flex-col justify-center border-r border-slate-100 pr-4">
                    <h4 className="font-bold text-slate-700">Légende</h4>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="w-3 h-3 bg-blue-500 rounded-full"></span> Domicile (Obourg)
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="w-3 h-3 border-2 border-red-500 rounded-full"></span> Offres
                    </div>
                </div>

                {unknowns.length > 0 && (
                    <div className="flex-1 flex flex-col justify-center">
                        <h4 className="font-bold text-slate-700 mb-2">Autres localisations ({unknowns.length})</h4>
                        <div className="flex gap-2">
                            {unknowns.slice(0, 5).map(j => (
                                <div key={j.id} className="bg-slate-50 border border-slate-200 px-3 py-1 rounded text-xs text-slate-600 truncate max-w-[150px]" title={j.location}>
                                    {j.location}: {j.title}
                                </div>
                            ))}
                            {unknowns.length > 5 && <span className="text-xs text-slate-400 self-center">...</span>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
