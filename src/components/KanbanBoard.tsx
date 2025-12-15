import React from 'react';
import type { JobOffer } from '../types';
import { JobCard } from './JobCard';
import { Briefcase, Send, Users, Award, MoreHorizontal } from 'lucide-react';


interface KanbanBoardProps {
    jobs: JobOffer[];
    onStatusChange: (jobId: string, newStatus: string) => void;
    onJobClick: (job: JobOffer) => void;
}

const COLUMNS = [
    { id: 'INTERESTED', title: 'À Traiter', icon: Briefcase, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'APPLIED', title: 'Postulé', icon: Send, color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { id: 'INTERVIEW', title: 'Entretiens', icon: Users, color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { id: 'OFFER', title: 'Offres', icon: Award, color: 'bg-green-50 text-green-700 border-green-200' }
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ jobs, onStatusChange, onJobClick }) => {

    // Group jobs by status
    const columns = COLUMNS.map(col => ({
        ...col,
        jobs: jobs.filter(j => j.status === col.id)
    }));

    return (
        <div className="h-full overflow-x-auto overflow-y-hidden p-4">
            <div className="flex gap-4 h-full min-w-[1000px]">
                {columns.map(col => (
                    <div key={col.id} className="flex-1 flex flex-col min-w-[300px] h-full bg-slate-100 rounded-xl border border-slate-200 shadow-sm">
                        {/* Column Header */}
                        <div className={`p-3 border-b flex items-center justify-between rounded-t-xl ${col.color.split(' ')[0]}`}>
                            <div className="flex items-center gap-2 font-bold text-slate-700">
                                <col.icon size={18} />
                                <span>{col.title}</span>
                                <span className="bg-white/50 px-2 py-0.5 rounded text-sm text-slate-800">
                                    {col.jobs.length}
                                </span>
                            </div>
                            <MoreHorizontal size={16} className="text-slate-400 cursor-pointer hover:text-slate-600" />
                        </div>

                        {/* Drop Zone / List */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-3">
                            {col.jobs.length === 0 ? (
                                <div className="h-32 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-sm">
                                    Vide
                                </div>
                            ) : (
                                col.jobs.map(job => (
                                    <div key={job.id} className="relative group">
                                        <div className="scale-95 origin-top-left w-full">
                                            {/* Using standard JobCard but scalling it down slightly for kanban density */}
                                            <JobCard
                                                job={job}
                                                onClick={() => onJobClick(job)}
                                                compact={true}
                                            />
                                        </div>

                                        {/* Quick Move Buttons (Hover) */}
                                        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded shadow-sm z-10">
                                            {col.id !== 'INTERESTED' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onStatusChange(job.id, getPrevStatus(col.id)); }}
                                                    className="p-1 hover:bg-slate-100 rounded text-slate-500 text-xs"
                                                    title="Reculer"
                                                >
                                                    ⬅️
                                                </button>
                                            )}
                                            {col.id !== 'OFFER' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onStatusChange(job.id, getNextStatus(col.id)); }}
                                                    className="p-1 hover:bg-slate-100 rounded text-slate-500 text-xs"
                                                    title="Avancer"
                                                >
                                                    ➡️
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Helper for status flow
function getNextStatus(current: string) {
    if (current === 'INTERESTED') return 'APPLIED';
    if (current === 'APPLIED') return 'INTERVIEW';
    if (current === 'INTERVIEW') return 'OFFER';
    return current;
}

function getPrevStatus(current: string) {
    if (current === 'OFFER') return 'INTERVIEW';
    if (current === 'INTERVIEW') return 'APPLIED';
    if (current === 'APPLIED') return 'INTERESTED';
    return current;
}
