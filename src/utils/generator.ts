import type { JobOffer, Profile } from '../types';

// Map keywords found in Job Description -> Specific sentences highlighting Damien's experience
const EVIDENCE_MAP: Record<string, string[]> = {
    'marketing': [
        "Dans le cadre de mes fonctions chez Cora, j'ai piloté des stratégies à 360° ayant directement impacté le chiffre d'affaires et l'image de marque.",
        "Mon expertise couvre à la fois la définition de l'offre, le pricing et l'activation client."
    ],
    'category': [
        "Mon expérience approfondie en Category Management m'a permis d'optimiser des assortiments complexes et de maximiser la rentabilité au mètre linéaire.",
        "Je maîtrise parfaitement les leviers du Category Management : analyse de données, relation fournisseurs et merchandising."
    ],
    'retail': [
        "Évoluant dans le secteur Retail depuis plusieurs années, je comprends intimement les défis opérationnels et stratégiques de la grande distribution.",
        "Le Retail est mon terrain de jeu : je sais allier vision siège et réalité magasin pour des plans d'action pragmatiques."
    ],
    'digital': [
        "La transformation digitale est au cœur de mes préoccupations, ayant accompagné le shift vers l'omnicanalité et le e-commerce.",
        "Je suis rompu aux stratégies digitales visant à fluidifier le parcours client et booster l'acquisition."
    ],
    'management': [
        "Manager confirmé, j'ai l'habitude de fédérer des équipes pluridisciplinaires autour d'objectifs ambitieux.",
        "Mon style de leadership est axé sur le développement des talents et l'atteinte collective de la performance."
    ],
    'stratégie': [
        "J'ai une forte appétence pour la définition de feuilles de route stratégiques, traduisant des visions long terme en plans d'actions concrets.",
        "La gestion de P&L (>200M€) m'a donné la rigueur financière nécessaire pour piloter des stratégies de croissance rentables."
    ],
    'négociation': [
        "Négociateur aguerri, j'ai l'habitude des discussions de haut niveau avec les fournisseurs et partenaires stratégiques.",
        "Je sais construire des relations gagnant-gagnant durables tout en défendant fermement les intérêts de l'entreprise."
    ]
};

function getDynamicParagraphs(job: JobOffer, forceRandom: boolean = false): string {
    const textToScan = (job.title + ' ' + job.description).toLowerCase();
    const matches: string[] = [];

    // Scan for keywords
    for (const [key, sentences] of Object.entries(EVIDENCE_MAP)) {
        if (textToScan.includes(key)) {
            // Pick a random sentence for variety, or the first one for consistency
            // Using a simple hash of job ID to keep it deterministic per job but varied across jobs (unless forceRandom is true)
            const index = forceRandom
                ? Math.floor(Math.random() * sentences.length)
                : job.id.charCodeAt(0) % sentences.length;
            matches.push(sentences[index]);
        }
    }

    // Limit to 2 most relevant matches to avoid a "laundry list" effect
    const uniqueMatches = [...new Set(matches)].slice(0, 2);

    if (uniqueMatches.length > 0) {
        return uniqueMatches.join("\n\n");
    } else {
        // Fallback generic paragraph if no keywords match
        return "Au cours de mon parcours, j'ai piloté des projets de transformation majeurs et géré des P&L de plus de 200M€. Mon approche est résolument orientée résultats : optimiser la rentabilité, dynamiser l'expérience client et fédérer les équipes.";
    }
}

export function generateCoverLetter(job: JobOffer, profile: Profile, forceRandom: boolean = false): string {
    const today = new Date().toLocaleDateString('fr-BE', { year: 'numeric', month: 'long', day: 'numeric' });

    // Dynamic Content Extraction
    const dynamicContent = getDynamicParagraphs(job, forceRandom);

    return `${profile.name}
${profile.phone}
Bruxelles

À l'attention du Responsable du Recrutement
${job.company}

Bruxelles, le ${today}

Objet : Candidature pour le poste de ${job.title}

Madame, Monsieur,

Avec une solide expertise dans le secteur Retail, je me permets de vous adresser ma candidature pour le poste de ${job.title} au sein de ${job.company}.

Votre entreprise est un acteur de référence et les défis que vous proposez correspondent parfaitement à mes aspirations professionnelles.

${dynamicContent}

Mon expérience chez Cora Belgique m'a permis de développer une vision stratégique et opérationnelle que je souhaiterais mettre au service de votre développement. Je suis convaincu que mon profil peut apporter une valeur ajoutée immédiate à vos équipes.

Je me tiens à votre entière disposition pour un entretien afin de vous exposer plus en détail ma motivation.

Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${profile.name}`;
}
