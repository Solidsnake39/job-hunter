import React from 'react';
import { Building2, MapPin, Calendar, ExternalLink, ThumbsUp, ThumbsDown, CheckCircle, AlertTriangle } from 'lucide-react';
import type { JobOffer } from '../types';
import { clsx } from 'clsx';

interface JobCardProps {
    job: JobOffer;
    onClick?: () => void;
    onAction?: (action: 'REJECTED' | 'INTERESTED' | 'APPLIED') => void;
    compact?: boolean; // For list view vs grid view
}

export const JobCard: React.FC<JobCardProps> = ({ job, onClick, onAction, compact = false }) => {

    // Helper for Badge Color
    const getScoreColor = (score: number) => {
        if (score >= 80) return "bg-green-100 text-green-700 border-green-200";
        if (score >= 50) return "bg-orange-100 text-orange-700 border-orange-200";
        return "bg-red-100 text-red-700 border-red-200";
    };

    const score = job.aiFitScore || 0;
    const isTopMatch = score >= 80;

    return (
        <div
            className={clsx(
                "group rounded-lg border transition-all flex flex-col overflow-hidden relative",
                isTopMatch
                    ? "bg-green-50/10 border-green-500 shadow-md ring-1 ring-green-500/20"
                    : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md",
                compact ? "p-3" : "p-4 h-full"
            )}
        >
            {isTopMatch && (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg z-10 shadow-sm">
                    ✨ Top Match
                </div>
            )}

            <div className="flex justify-between items-start gap-2" onClick={onClick}>
                <div className="flex-1">
                    <h3 className="font-bold text-sm leading-tight mb-1 group-hover:text-blue-600 text-slate-800">
                        {job.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                        {job.isSearchIntent ? <ExternalLink size={10} className="text-blue-500" /> : <Building2 size={10} />}
                        <span className="truncate max-w-[120px]" title={job.company}>{job.company}</span>
                        <span className="text-slate-300">•</span>
                        <MapPin size={10} />
                        <span className="truncate max-w-[100px]">{job.location}</span>
                    </div>
                </div>

                {/* Percentage Badge */}
                <div className={clsx(
                    "font-bold text-xs px-2 py-1 rounded border",
                    getScoreColor(score)
                )}>
                    {score}%
                </div>
            </div>

            {/* Badges for CDI/Status */}
            {!job.isSearchIntent && (job.contract || job.professionalStatus) && (
                <div className="flex gap-2 mb-2">
                    {job.contract && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded border border-green-200 uppercase">
                            {job.contract}
                        </span>
                    )}
                    {job.professionalStatus && (
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded border border-slate-200">
                            {job.professionalStatus}
                        </span>
                    )}
                </div>
            )}

            {/* Weaknesses Display */}
            {job.weaknesses && job.weaknesses.length > 0 && (
                <div className="mb-2 flex flex-col gap-1">
                    {job.weaknesses.map((w, i) => (
                        <div key={i} className="flex items-center gap-1 text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                            <AlertTriangle size={10} />
                            <span className="truncate" title={w}>{w}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Summary - distinct style for search intents */}
            <div
                className={clsx(
                    "text-xs mb-3 p-2 rounded border transition-all hover:bg-slate-50 relative",
                    job.isSearchIntent
                        ? "bg-white text-slate-600 border-slate-100"
                        : "bg-white text-slate-600 border-slate-100"
                )}
                onClick={onClick}
                title={job.description}
            >
                {job.isSearchIntent ? (
                    <span className="flex items-start gap-1">
                        <span>🌐</span>
                        <span className="line-clamp-3">{job.description || "Cliquez pour lancer la recherche en direct."}</span>
                    </span>
                ) : (
                    <div className="line-clamp-5 leading-relaxed">
                        {job.description || job.summary || "Pas de résumé disponible."}
                    </div>
                )}
            </div>

            {/* Footer with Date, Link and Actions */}
            <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <Calendar size={10} />
                    <span>{new Date(job.date).toLocaleDateString('fr-BE')}</span>
                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 flex items-center gap-0.5 ml-1" onClick={e => e.stopPropagation()}>
                        <ExternalLink size={10} /> Voir
                    </a>
                </div>

                {onAction && (
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => onAction('REJECTED')}
                            className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                            title="Pas intéressé"
                        >
                            <ThumbsDown size={14} />
                        </button>
                        <button
                            onClick={() => onAction('APPLIED')}
                            className="p-1.5 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors"
                            title="Déjà postulé"
                        >
                            <CheckCircle size={14} />
                        </button>
                        <button
                            onClick={() => onAction('INTERESTED')}
                            className="p-1.5 rounded hover:bg-green-50 text-slate-400 hover:text-green-600 transition-colors"
                            title="Intéressé"
                        >
                            <ThumbsUp size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

