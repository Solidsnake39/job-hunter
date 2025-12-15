import { useState, useEffect } from 'react';
import { Search, Briefcase, Inbox, FileText, Bell, BellOff, History } from 'lucide-react';
import { TriageView } from './components/TriageView';
import { ApplicationView } from './components/ApplicationView';
import { ArchivesView } from './components/ArchivesView';
import { SettingsModal, type NotificationSettings } from './components/SettingsModal';
import type { JobOffer } from './types';
import { mockJobs, userProfile } from './data/mockJobs';
import { getDistanceFromObourg } from './utils/geoLocation';
import { calculateMatch } from './utils/jobMatching';

function App() {
    // Core State
    const [jobs, setJobs] = useState<JobOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [maxDistance, setMaxDistance] = useState(100); // Default 100km

    // Settings State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
        newOffers: true,
        applicationUpdates: true,
        dailyDigest: false,
        emailAlerts: true
    });

    // Workflow State
    const [activeTab, setActiveTab] = useState<'SOURCING' | 'APPLICATIONS' | 'ARCHIVES'>('SOURCING');

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            try {
                // Try to fetch from local server with timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

                const res = await fetch('http://localhost:3001/api/jobs', { signal: controller.signal });
                clearTimeout(timeoutId);

                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();

                if (data.length === 0) {
                    console.log("API returned 0 jobs, falling back to mocks.");
                    processMockJobs();
                } else {
                    // Even for API data, we might want to recalc scores if backend doesn't do it
                    const mapped = data.map((j: JobOffer) => {
                        const match = calculateMatch(j);
                        return {
                            ...j,
                            status: j.status || 'NEW',
                            aiFitScore: match.score,
                            weaknesses: match.weaknesses,
                            strengths: match.strengths
                        };
                    });
                    setJobs(mapped);
                }
            } catch (e) {
                console.log("Fallback to mocks (Error)");
                processMockJobs();
            } finally {
                setLoading(false);
            }
        };

        const processMockJobs = () => {
            // Generate ~3000 jobs primarily based on the real ones
            let allJobs: JobOffer[] = [];

            // 1. Add real valid jobs
            allJobs = [...mockJobs];

            // 2. Generate duplicates with slight variations to reach 3000
            const TARGET_COUNT = 3000;
            let counter = 0;

            while (allJobs.length < TARGET_COUNT) {
                mockJobs.forEach(template => {
                    if (allJobs.length >= TARGET_COUNT) return;

                    counter++;
                    const newJob = {
                        ...template,
                        id: `generated-${counter}-${template.id}`,
                        date: new Date(Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000)).toISOString(), // Random date last 10 days
                        aiFitScore: Math.max(1, Math.min(5, (template.aiFitScore || 3) + (Math.random() * 0.4 - 0.2))) // Slight score variation
                    };
                    allJobs.push(newJob);
                });
            }

            const jobsWithScores = allJobs.map(job => {
                const match = calculateMatch(job);
                return {
                    ...job,
                    aiFitScore: match.score, // Use real score for everything
                    weaknesses: match.weaknesses,
                    strengths: match.strengths,
                    status: 'NEW'
                } as JobOffer;
            });
            setJobs(jobsWithScores);
        };

        fetchJobs();
    }, []);

    // Load Settings
    useEffect(() => {
        fetch('http://localhost:3001/api/settings/notifications')
            .then(res => res.json())
            .then(data => {
                if (data) {
                    // Start with defaults, overwrite with saved
                    setNotificationSettings(prev => ({ ...prev, ...data }));
                }
            })
            .catch(err => console.log('Settings fetch failed', err));
    }, []);

    const saveSettings = async (newSettings: NotificationSettings) => {
        setNotificationSettings(newSettings);
        try {
            await fetch('http://localhost:3001/api/settings/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings)
            });
        } catch (e) {
            console.error("Failed to update settings", e);
        }
    };

    // Action Handlers
    const handleJobAction = async (jobId: string, action: 'REJECTED' | 'INTERESTED' | 'APPLIED') => {
        // Optimistic Update
        setJobs(prevJobs => prevJobs.map(job => {
            if (job.id === jobId) {
                return { ...job, status: action };
            }
            return job;
        }));

        // Sync with API
        try {
            await fetch(`http://localhost:3001/api/jobs/${jobId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: action })
            });
        } catch (e) {
            console.error("Failed to sync stats", e);
        }
    };

    const handleJobUpdate = (jobId: string, updates: Partial<JobOffer>) => {
        setJobs(prevJobs => prevJobs.map(job => {
            if (job.id === jobId) {
                return { ...job, ...updates };
            }
            return job;
        }));
    };

    const handleRestore = (jobId: string) => {
        handleJobAction(jobId, 'NEW' as any); // Back to triage
    };

    // Filtering
    const getFilteredJobs = (tab: 'SOURCING' | 'APPLICATIONS' | 'ARCHIVES') => {
        return jobs.filter(job => {
            // 1. Search Filter
            const matchesSearch = !searchTerm ||
                job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                job.company.toLowerCase().includes(searchTerm.toLowerCase());

            if (!matchesSearch) return false;

            // 2. Distance Filter
            const dist = getDistanceFromObourg(job.location);
            if (dist > 0 && dist > maxDistance) return false;

            // 3. Tab/Status Filter
            if (tab === 'SOURCING') {
                return !job.status || job.status === 'NEW';
            } else if (tab === 'APPLICATIONS') {
                return job.status === 'INTERESTED';
            } else {
                return job.status === 'REJECTED' || job.status === 'APPLIED';
            }
        });
    };

    const currentSourcingCount = getFilteredJobs('SOURCING').length;

    // Check if any notifications are enabled for the icon state
    const areNotificationsActive = Object.values(notificationSettings).some(v => v === true);

    return (
        <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Header */}
            <header className="bg-slate-900 text-white p-4 shadow-lg flex justify-between items-center z-10 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Briefcase size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Job Hunter AI</h1>
                        <p className="text-xs text-slate-400">Assistant de carrière</p>
                    </div>
                </div>

                {/* Distance Filter Slider */}
                <div className="flex flex-col gap-1 w-48">
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Rayon: {maxDistance} km</span>
                        <span>(Obourg)</span>
                    </div>
                    <input
                        type="range"
                        min="10"
                        max="200"
                        step="10"
                        value={maxDistance}
                        onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                </div>

                {/* Main Navigation Tabs */}
                <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('SOURCING')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'SOURCING' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Inbox size={18} />
                        Sourcing
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ml-1 ${activeTab === 'SOURCING' ? 'bg-blue-800 text-blue-100' : 'bg-slate-900/50 text-slate-400'}`}>
                            {currentSourcingCount}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('APPLICATIONS')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'APPLICATIONS' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                        <FileText size={18} />
                        À Traiter
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ml-1 ${activeTab === 'APPLICATIONS' ? 'bg-blue-800 text-blue-100' : 'bg-slate-900/50 text-slate-400'}`}>
                            {jobs.filter(j => j.status === 'INTERESTED').length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('ARCHIVES')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'ARCHIVES' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                        <History size={18} />
                        Historique
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ml-1 ${activeTab === 'ARCHIVES' ? 'bg-blue-800 text-blue-100' : 'bg-slate-900/50 text-slate-400'}`}>
                            {jobs.filter(j => j.status === 'REJECTED' || j.status === 'APPLIED').length}
                        </span>
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative hidden md:block w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="bg-slate-800 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Settings / Notifications */}
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className={`p-2 rounded-lg transition-colors border ${areNotificationsActive
                            ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                        title="Paramètres de Notifications"
                    >
                        {areNotificationsActive ? <Bell size={20} /> : <BellOff size={20} />}
                    </button>

                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-sm shadow-inner border-2 border-slate-700 ring-2 ring-slate-800">
                        DG
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden relative bg-slate-50">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 bg-slate-50/80 backdrop-blur-sm z-50">
                        <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-slate-600 font-medium animate-pulse">Recherche des meilleures opportunités...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'SOURCING' && (
                            <TriageView
                                jobs={getFilteredJobs('SOURCING')}
                                onAction={handleJobAction}
                                profile={userProfile}
                                onJobUpdate={handleJobUpdate}
                            />
                        )}
                        {activeTab === 'APPLICATIONS' && (
                            <ApplicationView
                                jobs={getFilteredJobs('APPLICATIONS')}
                                profile={userProfile}
                                onStatusChange={(id, status) => handleJobAction(id, status as any)}
                                onJobUpdate={handleJobUpdate}
                            />
                        )}
                        {activeTab === 'ARCHIVES' && (
                            <ArchivesView
                                jobs={getFilteredJobs('ARCHIVES')}
                                onRestore={handleRestore}
                            />
                        )}
                    </>
                )}
            </main>

            {/* Settings Modal */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                currentSettings={notificationSettings}
                onSave={saveSettings}
            />
        </div>
    );
}

export default App;
