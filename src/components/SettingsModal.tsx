import React, { useState } from 'react';
import { X, Bell, Mail, MessageSquare, Briefcase, Check } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentSettings: NotificationSettings;
    onSave: (settings: NotificationSettings) => void;
}

export interface NotificationSettings {
    newOffers: boolean;
    applicationUpdates: boolean;
    dailyDigest: boolean;
    emailAlerts: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentSettings, onSave }) => {
    const [settings, setSettings] = useState<NotificationSettings>(currentSettings);

    if (!isOpen) return null;

    const handleToggle = (key: keyof NotificationSettings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        onSave(settings);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden">
                {/* Header */}
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Bell className="text-blue-600" size={24} />
                        Paramètres de Notification
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Section: Types of Alerts */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alertes Job</h3>

                        <label className="flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${settings.newOffers ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <Briefcase size={20} />
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-700">Nouvelles Offres</div>
                                    <div className="text-xs text-slate-500">Dès qu'un job correspond à &gt;80%</div>
                                </div>
                            </div>
                            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.newOffers ? 'bg-blue-600' : 'bg-slate-200'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings.newOffers ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                            <input type="checkbox" className="hidden" checked={settings.newOffers} onChange={() => handleToggle('newOffers')} />
                        </label>

                        <label className="flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${settings.applicationUpdates ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <MessageSquare size={20} />
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-700">Suivi Candidatures</div>
                                    <div className="text-xs text-slate-500">Réponses recruteurs ou changements de statut</div>
                                </div>
                            </div>
                            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.applicationUpdates ? 'bg-blue-600' : 'bg-slate-200'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings.applicationUpdates ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                            <input type="checkbox" className="hidden" checked={settings.applicationUpdates} onChange={() => handleToggle('applicationUpdates')} />
                        </label>
                    </div>

                    {/* Section: Digest */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fréquence</h3>

                        <label className="flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${settings.dailyDigest ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-700">Résumé Quotidien</div>
                                    <div className="text-xs text-slate-500">Un email récapitulatif à 5h30 et 17h30</div>
                                </div>
                            </div>
                            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.dailyDigest ? 'bg-blue-600' : 'bg-slate-200'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings.dailyDigest ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                            <input type="checkbox" className="hidden" checked={settings.dailyDigest} onChange={() => handleToggle('dailyDigest')} />
                        </label>

                        <button
                            onClick={async () => {
                                try {
                                    const res = await fetch('http://localhost:3001/api/settings/test-email', { method: 'POST' });
                                    const data = await res.json();
                                    if (data.success) {
                                        alert('Email de test envoyé avec succès !');
                                    } else {
                                        alert('Erreur: ' + (data.error || 'Iconnue'));
                                    }
                                } catch (e) {
                                    console.error(e);
                                    alert('Erreur réseau ou serveur inaccessible');
                                }
                            }}
                            className="w-full mt-2 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium transition-colors"
                        >
                            Envoyer un email de test maintenant
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-2 transition-colors"
                    >
                        <Check size={18} /> Enregistrer
                    </button>
                </div>
            </div>
        </div>
    );
};
