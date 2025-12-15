import type { JobOffer } from '../types';

export interface FitScore {
    score: number; // 0 to 100
    matchedKeywords: string[];
    missingKeywords: string[];
}

export function calculateFitScore(job: JobOffer): FitScore {
    let score = 0;
    // const maxScore = 100;

    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    // Profile Weights - Super Boosted
    const rules = [
        { keywords: ['Directeur', 'Director', 'Head of', 'VP', 'Chief', 'Partner', 'Responsable'], weight: 35, category: 'Seniority' },
        { keywords: ['Category', 'Acheteur', 'Buyer', 'Purchasing', 'Marketing', 'Commercial', 'Sales', 'Operating', 'COO'], weight: 40, category: 'Function' },
        { keywords: ['Retail', 'Distribution', 'FMCG', 'Luxe', 'Food', 'Non-Food', 'Marketplace', 'Automobile'], weight: 20, category: 'Sector' },
        { keywords: ['Stratégie', 'Strategy', 'Management', 'Team', 'P&L', 'Négociation', 'Partenariats', 'Leadership'], weight: 15, category: 'Skills' },
        { keywords: ['Bruxelles', 'Halle', 'Zellik', 'Zaventem', 'Gand', 'Nivelles'], weight: 5, category: 'Location' }
    ];

    const lowerTitle = (job.title || '').toLowerCase();
    const lowerDesc = (job.description || '').toLowerCase();
    const lowerLoc = (job.location || '').toLowerCase();
    const fullText = `${lowerTitle} ${lowerDesc} ${lowerLoc}`;

    rules.forEach(rule => {
        const found = rule.keywords.some(kw => {
            if (fullText.includes(kw.toLowerCase())) {
                matchedKeywords.push(kw);
                return true;
            }
            return false;
        });

        if (found) {
            score += rule.weight;
        } else {
            // Pick a representative missing keyword from this category to suggest
            missingKeywords.push(rule.keywords[0]);
        }
    });

    // Bonus for specific companies
    const targetCompanies = ['amazon', 'mckinsey', 'google', 'colruyt', 'delhaize', 'lvmh'];
    if (targetCompanies.some(tc => job.company.toLowerCase().includes(tc))) {
        score = Math.min(score + 10, 100);
        matchedKeywords.push('Target Company');
    }

    // Negative Filters (Penalty) - exclude irrelevant roles
    const negativeRules = [
        { keywords: ['Stagiaire', 'Intern', 'Student', 'Ouvrier', 'Operator', 'Opérateur', 'Technicien', 'Junior', 'Assistant(e)', 'Vendeur'], weight: -50 }
    ];

    negativeRules.forEach(rule => {
        if (rule.keywords.some(kw => fullText.includes(kw.toLowerCase()))) {
            score += rule.weight;
        }
    });

    return {
        // Allow score to drop below 30 if it's really bad, so we can filter it out in the UI
        score: Math.max(0, Math.min(score, 100)),
        matchedKeywords: [...new Set(matchedKeywords)],
        missingKeywords: [...new Set(missingKeywords)]
    };
}
