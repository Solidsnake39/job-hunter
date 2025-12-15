import React, { useState } from 'react';
import { KanbanBoard } from './KanbanBoard';
import { JobDetail } from './JobDetail';
import type { JobOffer, Profile } from '../types';
import { Briefcase, X } from 'lucide-react';

interface ApplicationViewProps {
    jobs: JobOffer[]; // List of INTERESTED/APPLIED/etc jobs
    profile: Profile;
    onStatusChange: (jobId: string, newStatus: string) => void;
    onJobUpdate: (jobId: string, updates: Partial<JobOffer>) => void;
}

export const ApplicationView: React.FC<ApplicationViewProps> = ({ jobs, profile, onStatusChange, onJobUpdate }) => {
    const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null);

    // Filter jobs that belong in the board (exclude REJECTED or NEW)
    const activeJobs = jobs.filter(j => ['INTERESTED', 'APPLIED', 'INTERVIEW', 'OFFER'].includes(j.status || ''));

    if (activeJobs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Briefcase size={64} className="mb-4 opacity-20" />
                <p className="text-xl font-medium">Aucune candidature en cours</p>
                <p className="text-sm">Allez dans l'onglet "Sourcing" pour trouver des offres !</p>
            </div>
        );
    }

    return (
        <div className="h-full bg-slate-50 relative">
            <KanbanBoard
                jobs={activeJobs}
                onStatusChange={onStatusChange}
                onJobClick={setSelectedJob}
            />

            {/* Modal for Job Detail */}
            {selectedJob && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setSelectedJob(null)}
                >
                    <div
                        className="bg-transparent w-full max-w-4xl h-[90vh] relative animate-in zoom-in-95 duration-200 flex flex-col shadow-2xl rounded-2xl"
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
                            mode="application"
                            onJobUpdate={onJobUpdate}
                            onAction={(action) => {
                                // For basic actions from detail if needed
                                // Usually Kanban drag is preferred but enabling detail actions is good
                                onStatusChange(selectedJob.id, action as any);
                                if (action === 'REJECTED') setSelectedJob(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
