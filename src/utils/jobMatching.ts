import { getDistanceFromObourg } from './geoLocation';
import type { JobOffer } from '../types';

export interface MatchResult {
    score: number; // 0 to 100
    weaknesses: string[];
    strengths: string[];
}

export const userProfile = {
    name: 'Damien Gallez',
    // In a real app, this comes from a store/context
    skills: ['Négociation', 'Achats', 'Leadership', 'Français', 'Anglais', 'Néerlandais', 'Category Management', 'Retail', 'FMCG', 'Stratégie'],
    roles: ['Category Manager', 'Buyer', 'Acheteur', 'Head of', 'Directeur', 'Manager'],
    maxDistance: 60 // km preference
};

export function calculateMatch(job: JobOffer): MatchResult {
    let score = 50; // Base percentage
    const weaknesses: string[] = [];
    const strengths: string[] = [];

    // 1. Distance Analysis
    const distance = getDistanceFromObourg(job.location);
    if (distance > userProfile.maxDistance) {
        score -= 20;
        weaknesses.push(`⚠️ Localisation éloignée (${Math.round(distance)} km)`);
    } else if (distance > 0 && distance < 20) {
        score += 20; // Bonus for very close
        strengths.push(`✅ Proximité idéale (${Math.round(distance)} km)`);
    } else if (distance > 0 && distance <= 50) {
        score += 10;
        strengths.push(`📍 Distance raisonnable (${Math.round(distance)} km)`);
    }

    // 2. Keyword/Skill Matching using Job Requirements
    const jobReqs = job.requirements || [];
    let matchedSkills = 0;
    const missingReqs: string[] = [];

    // Normalize strings for comparison
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Augmented User Skills with Aliases/Synonyms
    // This maps common terms to what the user actually possesses
    const skillAliases: Record<string, string[]> = {
        'categorymanagement': ['catman', 'cm', 'category'],
        'négociation': ['sales', 'vente', 'commercial', 'selling', 'negotiation'],
        'achats': ['buying', 'buyer', 'procurement', 'purchasing'],
        'leadership': ['management', 'people management', 'team lead'],
        'fmcg': ['cpg', 'consumer goods', 'grande conso'],
        'retail': ['distribution', 'magasin']
    };

    // Flatten all user skills + their aliases into a single set of "possessed tokens"
    const userSkillSet = new Set<string>();
    userProfile.skills.forEach(skill => {
        const norm = normalize(skill);
        userSkillSet.add(norm);
        // Add all aliases for this skill
        if (skillAliases[norm]) {
            skillAliases[norm].forEach(alias => userSkillSet.add(normalize(alias)));
        }
    });

    // Also add Role-based implicit skills
    // e.g. "Category Manager" implies "CatMan", "Nielsen", "GfK" analysis often.
    userProfile.roles.forEach(role => {
        const norm = normalize(role);
        if (norm.includes('categorymanager')) {
            userSkillSet.add('catman');
            userSkillSet.add('categorymanagement');
        }
        if (norm.includes('buyer') || norm.includes('acheteur')) {
            userSkillSet.add('achats');
            userSkillSet.add('buying');
            userSkillSet.add('purchasing');
        }
    });

    jobReqs.forEach(req => {
        const reqNorm = normalize(req);

        let isMatch = false;

        // 1. Direct Set Check (fast O(1))
        if (userSkillSet.has(reqNorm)) {
            isMatch = true;
        }
        // 2. Substring Check against keys (slower but covers partials)
        else {
            for (const userSkill of userSkillSet) {
                // Check if userSkill is contained in req OR req is contained in userSkill
                // e.g. user has "Sales" (from Négociation alias), req is "Sales Dir" -> Match
                if (reqNorm.includes(userSkill) || userSkill.includes(reqNorm)) {
                    isMatch = true;
                    break;
                }
            }
        }

        if (isMatch) {
            matchedSkills++;
        } else {
            missingReqs.push(req);
        }
    });

    if (jobReqs.length > 0) {
        const matchRatio = matchedSkills / jobReqs.length;
        if (matchRatio > 0.7) {
            score += 20;
            strengths.push("🎯 Vos compétences correspondent parfaitement aux attentes.");
        } else {
            // Partial Match Logic
            if (missingReqs.length > 0) {
                // Formatting specific missing skills
                const missingList = missingReqs.slice(0, 3).join(", ");
                weaknesses.push(`📉 Compétences à valider : ${missingList}`);

                // Penalty if ratio is low
                if (matchRatio < 0.3) score -= 10;
            } else {
                strengths.push("💼 Profil technique solide.");
            }
        }
    } else {
        // No reqs listed? Neutral/Slight positive
        score += 5;
    }

    // 3. Title Relevance
    const titleNorm = normalize(job.title);
    const roleMatch = userProfile.roles.some(role => titleNorm.includes(normalize(role)));
    if (roleMatch) {
        score += 20;
        strengths.push("✨ Le titre du poste est dans votre cible prioritaire.");
    } else {
        // If title doesn't match any target role, penalty
        score -= 10;
        weaknesses.push("❓ L'intitulé du poste semble s'éloigner de vos cibles habituelles.");
    }

    // 4. Clamping 0-100
    return {
        score: Math.min(100, Math.max(0, score)),
        weaknesses,
        strengths
    };
}
