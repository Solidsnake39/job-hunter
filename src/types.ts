export interface JobOffer {
    id: string;
    title: string;
    company: string;
    description: string;
    location: string;
    date: string; // ISO string
    url: string;
    source: string;
    scope?: 'NATIONAL' | 'INTERNATIONAL';
    isSearchIntent?: boolean;

    // AI & Enrichment Fields
    aiFitScore?: number; // 1-5
    summary?: string; // Short 1-2 sentence summary
    contactEmail?: string; // For auto-emailing
    suggestedEmails?: string[]; // Alternative contacts found via search

    // App Status
    status?: 'NEW' | 'INTERESTED' | 'APPLIED' | 'REJECTED' | 'INTERVIEW' | 'OFFER';
    emailSentAt?: string; // ISO Date of when email was sent
    contract?: string; // e.g., 'CDI', 'CDD', 'Freelance'
    professionalStatus?: string; // e.g., 'Employé', 'Cadre', 'Indépendant'

    // UI Presentation
    logo?: string;
    salary?: string;
    requirements?: string[];
    matchReason?: string;
    postedAt?: string; // e.g. "Il y a 2 jours"
    level?: string; // e.g. "Cadre"
    weaknesses?: string[]; // Dynamic analysis results
    strengths?: string[]; // Dynamic analysis results
}

export interface Profile {
    name: string;
    phone: string;
    currentRole: string;
    experience: string[];
    skills: string[];
}
