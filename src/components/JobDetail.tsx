import React, { useState } from 'react';
import { ExternalLink, Mail, FileText, Copy, X, Send, Paperclip, Activity, ThumbsUp, CheckCircle, ArrowRight } from 'lucide-react';
import type { JobOffer, Profile } from '../types';
import { generateCoverLetter } from '../utils/generator';
import { calculateFitScore } from '../utils/scoring';

interface JobDetailProps {
    job: JobOffer;
    profile: Profile;
    onJobUpdate: (jobId: string, updates: Partial<JobOffer>) => void;
    mode?: 'full' | 'triage' | 'application';
    onAction?: (action: 'REJECTED' | 'INTERESTED' | 'APPLIED' | 'NEXT') => void;
}

export const JobDetail: React.FC<JobDetailProps> = ({ job, profile, onJobUpdate, mode = 'full', onAction }) => {
    // Shared State
    const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [showLetterPreview, setShowLetterPreview] = useState(false);

    // AI Analysis
    const { score, matchedKeywords, missingKeywords } = calculateFitScore(job);

    // Auto-generate letter when job changes (only in full mode or if explicitly requested)
    React.useEffect(() => {
        if (mode === 'full') {
            const letter = generateCoverLetter(job, profile);
            setGeneratedLetter(letter);
        } else {
            setGeneratedLetter(null); // Reset in triage mode
        }
    }, [job, profile, mode]);

    // Preview State (Full Mode Only)
    const [recipientEmail, setRecipientEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const handleGenerateLetter = () => {
        const letter = generateCoverLetter(job, profile, true);
        setGeneratedLetter(letter);
    };

    const openPreview = () => {
        const cleanCompany = job.company.toLowerCase().replace(/[^a-z0-9]/g, '');
        // Use verified email if available, else generated guess
        const defaultEmail = job.contactEmail || `recrutement@${cleanCompany}.be`;

        setRecipientEmail(defaultEmail);
        setSubject(`Candidature : ${job.title} - ${profile.name}`);
        setMessage(`Madame, Monsieur,\n\nJe souhaite par la présente vous soumettre ma candidature pour le poste de ${job.title}.\n\nFort d'une expérience significative en Retail et Marketing Stratégique, je suis très enthousiaste à l'idée de rejoindre ${job.company} et de contribuer à son développement.\n\nVous trouverez en pièce jointe mon Curriculum Vitae ainsi qu'une lettre de motivation détaillant mon parcours et mon intérêt pour ce poste.\n\nJe me tiens à votre entière disposition pour un entretien.\n\nBien à vous,\n\n${profile.name}\n${profile.phone}\n`);
        if (!generatedLetter) {
            handleGenerateLetter();
        }
        setShowPreview(true);
    };

    const handleSendEmail = async () => {
        const letter = generatedLetter || generateCoverLetter(job, profile);
        try {
            const response = await fetch('/api/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    job,
                    profile,
                    letterContent: letter,
                    recipientEmail,
                    subject,
                    message
                })
            });
            const result = await response.json();
            if (result.success) {
                alert(`Email envoyé avec succès !`);
                onJobUpdate(job.id, {
                    emailSentAt: new Date().toISOString(),
                    status: 'APPLIED'
                });
                setShowPreview(false);
            } else {
                alert(`Erreur lors de l'envoi : ${result.error}`);
            }
        } catch (error) {
            alert("Erreur de connexion au serveur d'envoi.");
        }
    };

    // --- TRIAGE MODE LAYOUT ---
    if (mode === 'triage') {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden h-full flex flex-col relative w-full">
                {/* Header */}
                <div className="p-6 bg-slate-50/50 border-b border-slate-100">
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold mb-3">
                        {job.source}
                    </span>
                    <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-2">{job.title}</h2>
                    <div className="text-lg text-slate-600 font-medium">{job.company}</div>
                    <div className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                        <span>{job.location}</span>
                        <span>•</span>
                        <span>{new Date(job.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className={`font-bold ${score >= 80 ? 'text-green-600' : 'text-slate-500'}`}>Match: {score}%</span>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Enhanced AI Summary */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity size={18} className="text-blue-600" />
                            <h3 className="font-bold text-slate-800 text-base">Analyse de Compatibilité</h3>
                        </div>

                        <div className="space-y-4">
                            {/* Strengths */}
                            <div>
                                <h4 className="text-xs font-bold text-green-700 uppercase tracking-widest mb-2 flex items-center gap-1">
                                    <CheckCircle size={12} /> Points Forts
                                </h4>
                                {job.strengths && job.strengths.length > 0 ? (
                                    <ul className="space-y-1">
                                        {job.strengths.map((s, i) => (
                                            <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                                <span className="text-green-500 mt-0.5">•</span>
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-slate-500 italic">Aucun point fort spécifique détecté automatiquement.</p>
                                )}
                            </div>

                            {/* Weaknesses */}
                            {job.weaknesses && job.weaknesses.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-red-700 uppercase tracking-widest mb-2 flex items-center gap-1 mt-2">
                                        <Activity size={12} /> Points d'Attention
                                    </h4>
                                    <ul className="space-y-1">
                                        {job.weaknesses.map((w, i) => (
                                            <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                                <span className="text-red-500 mt-0.5">•</span>
                                                {w}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="prose prose-slate prose-sm max-w-none">
                        <h3 className="text-xs uppercase tracking-wide text-slate-500 font-bold mb-2">Description</h3>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {job.description}
                        </p>
                    </div>
                    <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mt-4 text-sm group"
                    >
                        Voir l'annonce originale <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>

                {/* Triage Actions Footer */}
                <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-4 gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                    <button
                        onClick={() => onAction && onAction('REJECTED')}
                        className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                        title="Pas intéressé"
                    >
                        <div className="w-10 h-10 rounded-full border-2 border-red-200 flex items-center justify-center">
                            <X size={20} />
                        </div>
                        <span className="text-[10px] font-bold uppercase">Non</span>
                    </button>

                    <button
                        onClick={() => onAction && onAction('NEXT')}
                        className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                        title="Passer au suivant"
                    >
                        <div className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center">
                            <ArrowRight size={20} />
                        </div>
                        <span className="text-[10px] font-bold uppercase">Passer</span>
                    </button>

                    <button
                        onClick={() => onAction && onAction('APPLIED')}
                        className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-blue-500 hover:bg-blue-50 transition-colors"
                        title="Déjà postulé"
                    >
                        <div className="w-10 h-10 rounded-full border-2 border-blue-200 flex items-center justify-center">
                            <CheckCircle size={20} />
                        </div>
                        <span className="text-[10px] font-bold uppercase">Postulé</span>
                    </button>

                    <button
                        onClick={() => onAction && onAction('INTERESTED')}
                        className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-green-600 hover:bg-green-50 transition-colors col-span-1"
                        title="Intéressé (Ajouter à Traiter)"
                    >
                        <div className="w-12 h-12 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center text-green-600 shadow-sm hover:scale-105 transition-transform">
                            <ThumbsUp size={24} className="fill-green-100" />
                        </div>
                        <span className="text-[10px] font-bold uppercase">Intéressé</span>
                    </button>
                </div>
            </div>
        );
    }

    // --- FULL MODE LAYOUT (Original) ---
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden h-full flex flex-col relative">
            {/* Email Preview Modal */}
            {showPreview && (
                <div className="absolute inset-0 bg-white/95 z-50 flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <Mail className="text-blue-600" /> Nouvel Email
                        </h3>
                        <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                    </div>

                    {!showLetterPreview ? (
                        <>
                            <div className="flex-1 space-y-4 overflow-y-auto">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Destinataire</label>
                                    <input
                                        type="email"
                                        value={recipientEmail}
                                        onChange={(e) => setRecipientEmail(e.target.value)}
                                        className="w-full text-slate-800 border-b-2 border-slate-200 focus:border-blue-500 bg-transparent px-1 py-2 outline-none transition-colors"
                                    />
                                    {/* Email Suggestions / Validation */}
                                    <div className="mt-2 space-y-2">
                                        {!job.contactEmail && (
                                            <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                                                <Activity size={12} className="mt-0.5" />
                                                <span>
                                                    <strong>Attention :</strong> L'adresse ci-dessus est générée automatiquement et n'a pas été vérifiée.
                                                </span>
                                            </div>
                                        )}

                                        {job.suggestedEmails && job.suggestedEmails.length > 0 && (
                                            <div className="text-xs">
                                                <span className="font-bold text-slate-500">Suggestions trouvées :</span>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {job.suggestedEmails.map((email) => (
                                                        <button
                                                            key={email}
                                                            onClick={() => !email.includes('(') ? setRecipientEmail(email) : null}
                                                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 text-slate-700 cursor-pointer"
                                                            title="Utiliser cette adresse"
                                                        >
                                                            {email}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {/* Search Link */}
                                        <div className="flex gap-4 items-center pt-2">
                                            <a
                                                href={`https://www.google.com/search?q=${encodeURIComponent(job.company + ' Belgium recruitment email contact')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline"
                                            >
                                                <ExternalLink size={10} />
                                                Vérifier sur Google
                                            </a>

                                            {/* Fallback to URL */}
                                            {!job.contactEmail && (
                                                <a
                                                    href={job.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-bold rounded-lg transition-colors border border-blue-200"
                                                >
                                                    <ExternalLink size={12} />
                                                    Postuler via le site (Recommandé)
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Objet</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full font-medium text-slate-800 border-b-2 border-slate-200 focus:border-blue-500 bg-transparent px-1 py-2 outline-none transition-colors"
                                    />
                                </div>

                                <div className="space-y-1 flex-1 flex flex-col h-64">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Message</label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="flex-1 w-full text-slate-600 bg-slate-50 rounded-lg p-4 outline-none border border-slate-200 focus:border-blue-500 resize-none font-sans"
                                    />
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <a
                                        href="/CV_Damien_Gallez.pdf"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100 hover:bg-blue-100 transition-colors"
                                    >
                                        <Paperclip size={16} /> CV_Damien_Gallez.pdf <ExternalLink size={12} />
                                    </a>
                                    <button
                                        onClick={() => setShowLetterPreview(true)}
                                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100 hover:bg-blue-100 transition-colors"
                                    >
                                        <Paperclip size={16} /> Lettre_Motivation.pdf <FileText size={12} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-200">
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSendEmail}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                                >
                                    <Send size={18} /> Envoyer
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                            <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-white">
                                <h4 className="font-bold text-slate-700">Aperçu : Lettre de Motivation</h4>
                                <button
                                    onClick={() => setShowLetterPreview(false)}
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    Fermer l'aperçu
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto whitespace-pre-wrap text-sm text-slate-600 leading-relaxed font-serif bg-white">
                                {generatedLetter}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                <div className="mb-6">
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold mb-3">
                        {job.source}
                    </span>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">{job.title}</h2>
                    <div className="text-xl text-slate-600 font-medium mb-1">{job.company}</div>
                    <div className="text-sm text-slate-400">{job.location} • {new Date(job.date).toLocaleDateString()}</div>
                </div>

                {/* AI Insights Block */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-indigo-600 rounded text-white shadow-sm">
                            <Activity size={16} />
                        </div>
                        <h3 className="font-bold text-indigo-900 text-lg">Analyse IA & Conseils</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Points forts détectés</h4>
                            <div className="flex flex-wrap gap-2">
                                {matchedKeywords.length > 0 ? matchedKeywords.map((kw: string) => (
                                    <span key={kw} className="px-2 py-1 bg-white text-indigo-600 text-xs font-bold rounded border border-indigo-100 shadow-sm flex items-center gap-1">
                                        Check ✓ {kw}
                                    </span>
                                )) : <span className="text-xs text-indigo-400 italic">Aucun mot-clé majeur détecté.</span>}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">À valoriser dans le CV</h4>
                            <div className="flex flex-wrap gap-2">
                                {missingKeywords.length > 0 ? missingKeywords.slice(0, 3).map((kw: string) => (
                                    <span key={kw} className="px-2 py-1 bg-white text-slate-500 text-xs rounded border border-slate-100 border-dashed">
                                        Mettre en avant : {kw}
                                    </span>
                                )) : <span className="text-xs text-green-600 font-medium">Profil parfaitement aligné !</span>}
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-indigo-800 mt-4 leading-relaxed border-t border-indigo-100 pt-3">
                        <span className="font-bold">💡 Conseil du Coach :</span> Ce poste correspond à <span className="font-bold">{score}%</span> à votre profil.
                        {score > 75 ? " C'est une excellente opportunité, foncez !" : " L'offre est intéressante mais assurez-vous de bien justifier votre expérience sur les points manquants."}
                    </p>
                </div>

                <div className="prose prose-slate max-w-none mb-8">
                    <h3 className="text-sm uppercase tracking-wide text-slate-500 font-bold mb-3">Description du poste</h3>
                    <p className="text-slate-700 leading-relaxed text-lg">
                        {job.description}
                    </p>
                    <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mt-4 group"
                    >
                        Voir l'annonce originale <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>

                {generatedLetter && (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <FileText size={18} className="text-blue-500" />
                                Lettre de Motivation
                            </h3>
                            <button
                                onClick={() => navigator.clipboard.writeText(generatedLetter)}
                                className="text-xs flex items-center gap-1 text-slate-500 hover:text-blue-600"
                            >
                                <Copy size={12} /> Copier
                            </button>
                        </div>
                        <pre className="whitespace-pre-wrap font-sans text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-lg border border-slate-200">
                            {generatedLetter}
                        </pre>
                    </div>
                )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-4">
                <button
                    onClick={handleGenerateLetter}
                    className="flex-1 bg-white border border-slate-300 hover:border-blue-400 text-slate-700 font-semibold py-3 px-6 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                >
                    <FileText size={20} />
                    {generatedLetter ? "Régénérer Lettre" : "Générer Lettre"}
                </button>

                <button
                    onClick={openPreview}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                    <Mail size={20} />
                    Préparer l'envoi
                </button>
            </div>
        </div>
    );
};

