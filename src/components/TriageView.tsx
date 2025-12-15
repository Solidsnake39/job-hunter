import { useState, useEffect, useMemo } from 'react';
import type { JobOffer, Profile } from '../types';
import { JobCard } from './JobCard';
import { JobDetail } from './JobDetail';
import { MapView } from './MapView';
import { CheckCircle, X, ChevronLeft, ChevronRight, Map as MapIcon, Grid } from 'lucide-react';

interface TriageViewProps {
    jobs: JobOffer[];
    profile: Profile;
    onAction: (id: string, action: 'INTERESTED' | 'REJECTED' | 'APPLIED') => void;
    onJobUpdate: (jobId: string, updates: Partial<JobOffer>) => void;
}

export function TriageView({ jobs, profile, onAction, onJobUpdate }: TriageViewProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

    // 1. Sort by Relevance (AI Score) Descending
    const sortedJobs = useMemo(() => {
        return [...jobs].sort((a, b) => (b.aiFitScore || 0) - (a.aiFitScore || 0));
    }, [jobs]);

    // 2. Pagination Logic (Only for Grid)
    const ITEMS_PER_PAGE = 30;
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null);

    const totalPages = Math.ceil(sortedJobs.length / ITEMS_PER_PAGE);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    const currentJobs = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedJobs.slice(start, start + ITEMS_PER_PAGE);
    }, [sortedJobs, currentPage]);

    const handleAction = (id: string, action: 'INTERESTED' | 'REJECTED' | 'APPLIED' | 'NEXT') => {
        // Find current index to determine next job
        const currentIndex = sortedJobs.findIndex(j => j.id === id);
        let nextJob: JobOffer | null = null;

        if (currentIndex !== -1 && currentIndex < sortedJobs.length - 1) {
            nextJob = sortedJobs[currentIndex + 1];
        }

        // Propagate action if it's not just "NEXT"
        if (action !== 'NEXT') {
            onAction(id, action);
        }

        // Auto-advance logic
        if (selectedJob?.id === id) {
            if (nextJob) {
                setSelectedJob(nextJob);
            } else {
                setSelectedJob(null); // No more jobs
            }
        }
    };

    const handleNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));
    const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1));

    if (jobs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <div className="bg-slate-800 p-6 rounded-full mb-4">
                    <CheckCircle size={48} className="text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-700">Tout est trié !</h2>
                <p>Revenez plus tard pour de nouvelles offres.</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto p-4 bg-slate-100 relative flex flex-col">
            {/* Header / Config Bar */}
            <div className="mb-4 flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-slate-200 sticky top-0 z-20">
                <div>
                    <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                        {sortedJobs.length} offres disponibles
                        <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            Trié par pertinence
                        </span>
                    </h2>
                </div>

                {/* View Toggles */}
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded flex items-center gap-2 text-sm font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Grid size={18} /> Grille
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={`p-2 rounded flex items-center gap-2 text-sm font-bold transition-all ${viewMode === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <MapIcon size={18} /> Carte
                    </button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20 flex-1 items-stretch">
                        {currentJobs.map((job) => (
                            <div key={job.id} className="transform transition-all duration-300 hover:scale-[1.02] h-full">
                                <JobCard
                                    job={job}
                                    onAction={(action) => handleAction(job.id, action)}
                                    onClick={() => setSelectedJob(job)}
                                    compact={true}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Pagination Footer */}
                    <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 flex items-center justify-center gap-4 shadow-lg z-10 rounded-t-xl">
                        <button
                            onClick={handlePrev}
                            disabled={currentPage === 1}
                            className="p-2 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 flex items-center gap-2 font-bold"
                        >
                            <ChevronLeft size={20} /> Précédent
                        </button>
                        <span className="font-bold text-slate-700">
                            Page {currentPage} / {totalPages || 1}
                        </span>
                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 flex items-center gap-2 font-bold"
                        >
                            Suivant <ChevronRight size={20} />
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex-1 pb-4">
                    <MapView
                        jobs={sortedJobs}
                        onJobClick={setSelectedJob}
                    />
                </div>
            )}

            {/* Modal Overlay */}
            {selectedJob && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setSelectedJob(null)}
                >
                    <div
                        className="bg-transparent w-full max-w-lg h-[85vh] relative animate-in zoom-in-95 duration-200 flex flex-col shadow-2xl rounded-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedJob(null)}
                            className="absolute -top-10 right-0 z-20 p-2 text-white hover:text-slate-200 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <JobDetail
                            job={selectedJob}
                            profile={profile}
                            mode="triage"
                            onJobUpdate={(id, updates) => {
                                onJobUpdate(id, updates);
                            }}
                            onAction={(action) => {
                                if (selectedJob) {
                                    handleAction(selectedJob.id, action);
                                }
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}


