
import React from 'react';
import { JobCard } from './JobCard';
import type { JobOffer } from '../types';
import { Archive, History } from 'lucide-react';

interface ArchivesViewProps {
    jobs: JobOffer[];
    onRestore?: (jobId: string) => void;
}

export const ArchivesView: React.FC<ArchivesViewProps> = ({ jobs, onRestore }) => {
    if (jobs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Archive size={64} className="mb-4 opacity-20" />
                <p className="text-xl font-medium">Historique vide</p>
                <p className="text-sm">Les annonces traitées apparaîtront ici.</p>
            </div>
        );
    }

    // Sort by date processed or just date? Let's stick to date for now
    const sortedJobs = [...jobs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="p-6 h-full overflow-y-auto bg-slate-100/50">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center gap-2 text-slate-500 pb-2 border-b border-slate-200">
                    <History size={18} />
                    <h2 className="font-semibold">Historique des actions</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sortedJobs.map(job => (
                        <div key={job.id} className="relative group">
                            <div className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur rounded px-2 py-0.5 text-[10px] font-bold shadow-sm">
                                {job.status === 'APPLIED' && <span className="text-blue-600">POSTULÉ</span>}
                                {job.status === 'REJECTED' && <span className="text-red-500">REJETÉ</span>}
                            </div>
                            <div className={job.status === 'REJECTED' ? 'opacity-75 grayscale-[0.5] hover:grayscale-0 transition-all' : ''}>
                                <JobCard
                                    job={job}
                                    compact={true}
                                />
                                {job.emailSentAt && (
                                    <div className="absolute bottom-2 left-2 text-[10px] text-slate-400 font-mono bg-slate-50 px-1 rounded border border-slate-100">
                                        ✉️ {new Date(job.emailSentAt).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                            {/* Optional Restore Button */}
                            {onRestore && (
                                <button
                                    onClick={() => onRestore(job.id)}
                                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 bg-white border border-slate-200 shadow-sm text-slate-500 text-xs px-2 py-1 rounded hover:text-blue-600 transition-all"
                                >
                                    Restaurer
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
