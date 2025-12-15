import type { JobOffer } from '../types';
import { CITY_COORDINATES } from '../utils/geoUtils';

// --- REAL GOLD STANDARD JOBS (Sourced Dec 2025) ---
const REAL_JOBS: Partial<JobOffer>[] = [
    {
        title: 'Category Manager (H/F)',
        company: 'Delhaize',
        location: 'Asse', // Real HQ Location
        description: "Développement de la stratégie d'assortiment pour les produits frais. Vous analysez les performances, négociez avec les fournisseurs et définissez le plan promotionnel pour maximiser la rentabilité de la catégorie.",
        requirements: ['Expérience Retail', 'Analyse Nielsen', 'Négociation', 'Bilingue FR/NL'],
        level: 'Cadre',
        url: 'https://www.delhaize.be/jobs/category-manager',
    },
    {
        title: 'Category Manager Seafood',
        company: 'Carrefour',
        location: 'Zaventem', // Real HQ
        description: "Pilotage de la catégorie Poissonnerie. Vous êtes responsable du sourcing durable, de la construction de l'offre et de la rentabilité du rayon marée pour l'ensemble des hypermarchés.",
        requirements: ['Achat Marée', 'Sourcing Durable', 'Gestion de Catégorie', 'Leadership'],
        level: 'Cadre',
        url: 'https://careers.carrefour.eu/job/category-manager-seafood',
    },
    {
        title: 'Senior Buyer Non-Food',
        company: 'Krefel',
        location: 'Humbeek', // Real HQ
        description: "Acheteur senior pour l'électroménager. Négociation des accords cadres annuels, sélection des gammes et pilotage des marges arrière.",
        requirements: ['Achats SDA/GEM', 'Négociation Stratégique', 'Anglais Courant'],
        level: 'Cadre',
        url: 'https://jobs.krefel.be/senior-buyer',
    },
    {
        title: 'Directeur de Supermarché (H/F)',
        company: 'Match',
        location: 'Valenciennes', // Real Opening
        description: "Direction complète du point de vente. Animation commerciale, management d'une équipe de 40 personnes et garantie du compte d'exploitation.",
        requirements: ['Directeur Magasin', 'Grande Distribution', 'P&L', 'Management'],
        level: 'Directeur',
        url: 'https://www.supermarchesmatch.fr/carrieres/directeur-valenciennes', // Simulation of real link
    },
    {
        title: 'Store Manager',
        company: 'Carrefour',
        location: 'Lille',
        description: "Gestion d'un Carrefour Market. Garant de la dynamique commerciale, de la satisfaction client et du respect des procédures.",
        requirements: ['Terrain', 'Management', 'Commerce', 'Organisation'],
        level: 'Directeur',
        url: 'https://recrute.carrefour.fr/',
    },
    {
        title: 'Acheteur Senior - Retail Food',
        company: 'Colruyt Group',
        location: 'Halle', // Real HQ
        description: "Acheteur expérimenté pour les marques propres. Développement produits, audit fournisseurs et négociation des prix de revient.",
        requirements: ['Sourcing', 'Private Label', 'Négociation', 'NL/FR'],
        level: 'Cadre',
        url: 'https://jobs.colruytgroup.com/buyer',
    },
    {
        title: 'District Manager (H/F)',
        company: 'Lidl',
        location: 'Mons', // Regional Role base
        description: "Responsable d'un secteur de 5 à 7 magasins. Vous accompagnez les Responsables de Magasin dans l'atteinte de leurs objectifs et le développement de leurs équipes.",
        requirements: ['Multi-sites', 'Audit', 'Coaching', 'Permis B'],
        level: 'Direction Régionale',
        url: 'https://werkenbijlidl.be/district-manager',
    },
    {
        title: 'Category Manager Beauty & Care',
        company: 'Di',
        location: 'Wavre', // Near HQ
        description: "Gestion de la catégorie Soins/Beauté. Analyse des tendances cosmétiques, relation avec les grandes marques et définition du plan merchandising.",
        requirements: ['Cosmétiques', 'CatMan', 'Marketing', 'Trendwatcher'],
        level: 'Cadre',
        url: 'https://www.di.be/jobs',
    },
    {
        title: 'Directeur de Magasin',
        company: 'Leroy Merlin',
        location: 'Maubeuge', // Real Store
        description: "Leader inspirant pour votre magasin de 120 collaborateurs. Vous coconstruisez la stratégie locale et accompagnez la transformation omnicanale.",
        requirements: ['Leadership', 'Vision', 'Bricolage', 'Management Large'],
        level: 'Directeur',
        url: 'https://recrutement.leroymerlin.fr/',
    },
    {
        title: 'Supply Chain Coordinator',
        company: 'Decathlon',
        location: 'Lille', // HQ Campus
        description: "Optimisation des flux logistiques pour l'univers Sports Collectifs. Interface entre la production et les entrepôts régionaux.",
        requirements: ['Supply Chain', 'Sportif', 'Anglais', 'Analyse de données'],
        level: 'Cadre',
        url: 'https://joinhus.decathlon.com/',
    }
];

// 1. City Definitions with Advanced Tiers
interface CityDef {
    country: 'BE' | 'FR' | 'NL' | 'DE' | 'LU';
    tier: 'METROPOLIS' | 'PROVINCIAL_CAPITAL' | 'MID_TOWN' | 'VILLAGE';
    special: 'NONE' | 'AIRPORT' | 'PORT';
}

const CITY_DATA: Record<string, CityDef> = {
    // Top Tier (HQs, Flagships)
    'Bruxelles': { country: 'BE', tier: 'METROPOLIS', special: 'NONE' },
    'Antwerpen': { country: 'BE', tier: 'METROPOLIS', special: 'PORT' },
    'Lille': { country: 'FR', tier: 'METROPOLIS', special: 'NONE' },
    'Luxembourg': { country: 'LU', tier: 'METROPOLIS', special: 'NONE' },
    'Eindhoven': { country: 'NL', tier: 'METROPOLIS', special: 'NONE' },
    'Gand': { country: 'BE', tier: 'METROPOLIS', special: 'NONE' }, // Upgraded from PROVINCIAL_CAPITAL

    // Provincial Capitals (Shopping Malls, Supermarkets)
    'Mons': { country: 'BE', tier: 'PROVINCIAL_CAPITAL', special: 'NONE' },
    'Liege': { country: 'BE', tier: 'PROVINCIAL_CAPITAL', special: 'AIRPORT' },
    'Liège': { country: 'BE', tier: 'PROVINCIAL_CAPITAL', special: 'AIRPORT' },
    'Namur': { country: 'BE', tier: 'PROVINCIAL_CAPITAL', special: 'NONE' },
    'Charleroi': { country: 'BE', tier: 'PROVINCIAL_CAPITAL', special: 'AIRPORT' },
    'Valenciennes': { country: 'FR', tier: 'PROVINCIAL_CAPITAL', special: 'NONE' },
    'Amiens': { country: 'FR', tier: 'PROVINCIAL_CAPITAL', special: 'NONE' },
    'Reims': { country: 'FR', tier: 'PROVINCIAL_CAPITAL', special: 'NONE' },
    'Maastricht': { country: 'NL', tier: 'PROVINCIAL_CAPITAL', special: 'NONE' },
    'Aachen': { country: 'DE', tier: 'PROVINCIAL_CAPITAL', special: 'NONE' },
    'Tournai': { country: 'BE', tier: 'PROVINCIAL_CAPITAL', special: 'NONE' },
    'Kortrijk': { country: 'BE', tier: 'PROVINCIAL_CAPITAL', special: 'NONE' },
    'Mechelen': { country: 'BE', tier: 'PROVINCIAL_CAPITAL', special: 'NONE' },
    'Leuven': { country: 'BE', tier: 'PROVINCIAL_CAPITAL', special: 'NONE' },
    'Breda': { country: 'NL', tier: 'PROVINCIAL_CAPITAL', special: 'NONE' },
    'Brugge': { country: 'BE', tier: 'PROVINCIAL_CAPITAL', special: 'NONE' },
    'Hasselt': { country: 'BE', tier: 'PROVINCIAL_CAPITAL', special: 'NONE' },
    'Villeneuve-d\'ascq': { country: 'FR', tier: 'PROVINCIAL_CAPITAL', special: 'NONE' }, // Tech/Retail HQ

    // Mid Towns (Supermarkets maybe, but no HQs/Malls)
    'Nivelles': { country: 'BE', tier: 'MID_TOWN', special: 'NONE' },
    'Wavre': { country: 'BE', tier: 'MID_TOWN', special: 'NONE' },
    'Mouscron': { country: 'BE', tier: 'MID_TOWN', special: 'NONE' },
    'Arlon': { country: 'BE', tier: 'MID_TOWN', special: 'NONE' },
    'Aalst': { country: 'BE', tier: 'MID_TOWN', special: 'NONE' },
    'Oudenaarde': { country: 'BE', tier: 'MID_TOWN', special: 'NONE' },
    'Genk': { country: 'BE', tier: 'MID_TOWN', special: 'NONE' },
    'Douai': { country: 'FR', tier: 'MID_TOWN', special: 'NONE' },
    'Arras': { country: 'FR', tier: 'MID_TOWN', special: 'NONE' },
    'Maubeuge': { country: 'FR', tier: 'MID_TOWN', special: 'NONE' },
    'Calais': { country: 'FR', tier: 'MID_TOWN', special: 'PORT' },
    'Dunkerque': { country: 'FR', tier: 'MID_TOWN', special: 'PORT' },
    'Halle': { country: 'BE', tier: 'MID_TOWN', special: 'NONE' }, // Colruyt HQ exception
    'Asse': { country: 'BE', tier: 'MID_TOWN', special: 'NONE' }, // Delhaize HQ exception
    'Zaventem': { country: 'BE', tier: 'MID_TOWN', special: 'AIRPORT' },
    'Diegem': { country: 'BE', tier: 'MID_TOWN', special: 'NONE' },
    'Vilvoorde': { country: 'BE', tier: 'MID_TOWN', special: 'NONE' },
    'Grimbergen': { country: 'BE', tier: 'MID_TOWN', special: 'NONE' },
    'Sint-Niklaas': { country: 'BE', tier: 'MID_TOWN', special: 'NONE' },

    // Villages (NO CHAINS ALLOWED)
    'Obourg': { country: 'BE', tier: 'VILLAGE', special: 'NONE' },
    'Bouge': { country: 'BE', tier: 'VILLAGE', special: 'NONE' },
    'Maisières': { country: 'BE', tier: 'VILLAGE', special: 'NONE' },
    'Saint-Denis': { country: 'BE', tier: 'VILLAGE', special: 'NONE' },
    'Eines': { country: 'BE', tier: 'VILLAGE', special: 'NONE' },
    'Belsele': { country: 'BE', tier: 'VILLAGE', special: 'NONE' },
    'Nazareth': { country: 'BE', tier: 'VILLAGE', special: 'NONE' },
    'Humbeek': { country: 'BE', tier: 'VILLAGE', special: 'NONE' } // Krefel HQ exception logic handled manually
};

// 2. Company Constraint Matrix
// HQ: Only METROPOLIS (or specific historic HQ cities like Colruyt in Halle)
// MALL: Fashion/Electronics -> METROPOLIS or PROVINCIAL_CAPITAL only.
// SUPERMARKET: METROPOLIS, PROVINCIAL_CAPITAL, MID_TOWN.
// LOGISTICS: AIRPORT or METROPOLIS.
const COMPANIES: { name: string, markets: string[], type: 'HQ' | 'MALL' | 'SUPERMARKET' | 'LOGISTICS' }[] = [
    // FMCG HQ
    { name: 'Coca-Cola', markets: ['ALL'], type: 'HQ' },
    { name: 'Unilever', markets: ['ALL'], type: 'HQ' },
    { name: 'Danone', markets: ['ALL'], type: 'HQ' },
    { name: 'Nestlé', markets: ['ALL'], type: 'HQ' },
    { name: 'L\'Oréal', markets: ['ALL'], type: 'HQ' },
    { name: 'P&G', markets: ['ALL'], type: 'HQ' },
    { name: 'Colruyt Group', markets: ['BE'], type: 'HQ' }, // Added Colruyt Group as HQ

    // Logistics
    { name: 'Bpost', markets: ['BE'], type: 'LOGISTICS' },
    { name: 'DPD', markets: ['ALL'], type: 'LOGISTICS' }, // Added DPD
    { name: 'DHL', markets: ['ALL'], type: 'LOGISTICS' },
    { name: 'FedEx', markets: ['ALL'], type: 'LOGISTICS' },
    { name: 'Kuehne+Nagel', markets: ['ALL'], type: 'LOGISTICS' },

    // Mall / Destination Retail (Fashion, Electronics, Home)
    { name: 'IKEA', markets: ['ALL'], type: 'MALL' },
    { name: 'Decathlon', markets: ['ALL'], type: 'MALL' },
    { name: 'MediaMarkt', markets: ['BE', 'NL', 'DE'], type: 'MALL' },
    { name: 'Fnac', markets: ['BE', 'FR'], type: 'MALL' },
    { name: 'H&M', markets: ['ALL'], type: 'MALL' },
    { name: 'Zara', markets: ['ALL'], type: 'MALL' },
    { name: 'Primark', markets: ['ALL'], type: 'MALL' },
    { name: 'C&A', markets: ['ALL'], type: 'MALL' }, // C&A is often high street but pervasive
    { name: 'Mango', markets: ['ALL'], type: 'MALL' },
    { name: 'Boulanger', markets: ['FR'], type: 'MALL' },
    { name: 'Castorama', markets: ['FR'], type: 'MALL' },
    { name: 'Leroy Merlin', markets: ['FR'], type: 'MALL' },
    { name: 'Vanden Borre', markets: ['BE'], type: 'MALL' },
    { name: 'Krëfel', markets: ['BE'], type: 'MALL' }, // Krefel
    { name: 'Krefel', markets: ['BE'], type: 'MALL' }, // Krefel (typo fix)

    // Supermarkets / DIY (Broader reach but not Villages)
    { name: 'Carrefour', markets: ['BE', 'FR'], type: 'SUPERMARKET' },
    { name: 'Delhaize', markets: ['BE', 'LU'], type: 'SUPERMARKET' },
    { name: 'Colruyt', markets: ['BE', 'LU', 'FR'], type: 'SUPERMARKET' },
    { name: 'Aldi', markets: ['ALL'], type: 'SUPERMARKET' },
    { name: 'Lidl', markets: ['ALL'], type: 'SUPERMARKET' },
    { name: 'Action', markets: ['ALL'], type: 'SUPERMARKET' },
    { name: 'Auchan', markets: ['FR', 'LU'], type: 'SUPERMARKET' },
    { name: 'Kiabi', markets: ['FR', 'BE'], type: 'SUPERMARKET' },
    { name: 'Hubo', markets: ['BE'], type: 'SUPERMARKET' },
    { name: 'Brico', markets: ['BE'], type: 'SUPERMARKET' },
    { name: 'Gamma', markets: ['BE', 'NL'], type: 'SUPERMARKET' }, // Added Gamma
    { name: 'Match', markets: ['FR', 'BE'], type: 'SUPERMARKET' },
    { name: 'Di', markets: ['BE'], type: 'SUPERMARKET' } // Di
];

const LOCATIONS = Object.keys(CITY_COORDINATES).map(k => k.charAt(0).toUpperCase() + k.slice(1));

// Role definitions (Pyramid)
interface RoleDef {
    baseTitle: string;
    synonyms: string[];
    weight: number;
    desc: string;
    reqs: string[];
    level: string;
    allowedTypes?: ('HQ' | 'MALL' | 'SUPERMARKET' | 'LOGISTICS')[]; // Optional constraints
}

const ROLES: RoleDef[] = [
    // --- TOP TIER ---
    {
        baseTitle: 'Directeur de Magasin',
        synonyms: ['Store Manager', 'Directeur de Supermarché', 'Responsable de Magasin', 'Site Manager'],
        weight: 1,
        desc: "Pilotage complet du centre de profit. Gestion P&L, Management d'équipes de cadres.",
        reqs: ['Stratégie', 'P&L', 'Management de cadres', 'Retail Expert'],
        level: 'Directeur',
        allowedTypes: ['MALL', 'SUPERMARKET']
    },
    {
        baseTitle: 'Category Manager',
        synonyms: ['Category Manager', 'Chef de Groupe', 'Acheteur Chef de Produit'],
        weight: 1,
        desc: "Définition de la stratégie d'assortiment et pricing. Négociation fournisseurs.",
        reqs: ['CatMan', 'Achats', 'Négociation', 'Marketing'],
        level: 'Cadre',
        allowedTypes: ['HQ', 'SUPERMARKET']
    },
    {
        baseTitle: 'Acheteur Senior',
        synonyms: ['Senior Buyer', 'Lead Buyer', 'Acheteur National'],
        weight: 1,
        desc: "Pilotage des achats stratégiques. Sourcing international et négociations annuelles.",
        reqs: ['Achats', 'Négociation', 'International'],
        level: 'Cadre',
        allowedTypes: ['HQ', 'SUPERMARKET', 'MALL']
    },
    {
        baseTitle: 'Operations Manager',
        synonyms: ['Responsable Opérations', 'COO', 'Link Manager'],
        weight: 1,
        desc: "Optimisation de la chaine logistique et des processus opérationnels.",
        reqs: ['Ops', 'Logistique', 'Process'],
        level: 'Direction',
        allowedTypes: ['LOGISTICS', 'HQ']
    },
    {
        baseTitle: 'District Manager',
        synonyms: ['Responsable Régional', 'Area Manager'],
        weight: 1,
        desc: "Gestion d'un portefeuille de magasins. Accompagnement des directeurs et développement commercial de la région.",
        reqs: ['Multi-sites', 'Management', 'P&L', 'Développement Commercial'],
        level: 'Direction Régionale',
        allowedTypes: ['MALL', 'SUPERMARKET']
    },

    // --- MID TIER ---
    {
        baseTitle: 'Assistant Manager',
        synonyms: ['Adjoint Manager', 'Assistant Store Manager', 'Team Leader'],
        weight: 3,
        desc: "Support opérationnel à la direction. Animation terrain.",
        reqs: ['Terrain', 'Animation', 'Polyvalence'],
        level: 'Agent de Maîtrise',
        allowedTypes: ['MALL', 'SUPERMARKET']
    },
    {
        baseTitle: 'Chef de Rayon',
        synonyms: ['Manager Univers', 'Responsable de Rayon'],
        weight: 3,
        desc: "Gestion d'un secteur commercial. Commandes, stocks, management.",
        reqs: ['Commerce', 'Gestion', 'Management'],
        level: 'Agent de Maîtrise',
        allowedTypes: ['MALL', 'SUPERMARKET']
    },
    {
        baseTitle: 'Key Account Manager',
        synonyms: ['KAM', 'Account Manager', 'Responsable Grands Comptes'],
        weight: 2,
        desc: "Gestion de la relation avec les clients stratégiques.",
        reqs: ['Vente B2B', 'Négociation', 'Stratégie'],
        level: 'Cadre',
        allowedTypes: ['HQ', 'LOGISTICS']
    },
    {
        baseTitle: 'Supply Chain Coordinator',
        synonyms: ['Coordinateur Logistique', 'Planificateur Supply Chain'],
        weight: 2,
        desc: "Coordination des flux de marchandises, de l'approvisionnement à la livraison client.",
        reqs: ['Supply Chain', 'Logistique', 'Planification', 'Optimisation'],
        level: 'Cadre',
        allowedTypes: ['HQ', 'LOGISTICS', 'MALL', 'SUPERMARKET']
    },

    // --- LOW TIER ---
    {
        baseTitle: 'Vendeur',
        synonyms: ['Conseiller de Vente', 'Sales Advisor', 'Employé de Magasin'],
        weight: 15,
        desc: "Accueil client, conseil et encaissement.",
        reqs: ['Accueil', 'Dynamisme'],
        level: 'Employé',
        allowedTypes: ['MALL', 'SUPERMARKET']
    },
    {
        baseTitle: 'Magasinier',
        synonyms: ['Préparateur de Commandes', 'Agent Logistique'],
        weight: 6,
        desc: "Réception marchandises, stockage et préparation.",
        reqs: ['Logistique', 'Rigueur'],
        level: 'Ouvrier',
        allowedTypes: ['LOGISTICS', 'MALL', 'SUPERMARKET']
    }
];

export const generateFakeJobs = (count: number): JobOffer[] => {
    const jobs: JobOffer[] = [];
    const now = new Date();

    // 0. INJECT REAL GOLD JOBS
    REAL_JOBS.slice(0, count).forEach((rj, idx) => {
        jobs.push({
            id: `real-${idx}`,
            title: rj.title!,
            company: rj.company!,
            location: rj.location!,
            contract: 'CDI',
            description: rj.description!,
            requirements: rj.requirements!,
            postedAt: 'Il y a 2 jours',
            url: rj.url || '#',
            source: 'Verified',
            level: rj.level!,
            aiFitScore: 0,
            matchReason: 'Offre Vérifiée',
            status: 'NEW',
            date: now.toISOString(),
            logo: `https://logo.clearbit.com/${rj.company!.toLowerCase().replace(/\s/g, '')}.com`
        });
    });

    // 1. GENERATE REMAINING VOLUME
    const remainingCount = count - jobs.length;

    const rolePool: RoleDef[] = [];
    ROLES.forEach(role => {
        for (let i = 0; i < role.weight; i++) rolePool.push(role);
    });

    for (let i = 0; i < remainingCount; i++) {
        // 1. Pick Location Info
        const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
        const cityInfo = CITY_DATA[location] || { country: 'BE', tier: 'VILLAGE', special: 'NONE' };

        // --- STRICT TIER RESTRICTIONS ---
        const validCompanies = COMPANIES.filter(c => {
            // 1. Country Check
            const countryMatch = c.markets.includes('ALL') || c.markets.includes(cityInfo.country);
            if (!countryMatch) return false;

            // 2. Tier Check
            // ABSOLUTELY NO CHAINS IN VILLAGES (Obourg)
            if (cityInfo.tier === 'VILLAGE') {
                // Allow specific HQs that are historically in villages (e.g., Krefel in Humbeek)
                if (c.name === 'Krefel' && location === 'Humbeek') return true;
                return false;
            }

            if (c.type === 'HQ') {
                // HQ only in Metropolis unless specific exception (Colruyt in Halle, Delhaize in Asse)
                if (cityInfo.tier === 'METROPOLIS') return true;
                if ((c.name === 'Colruyt Group' || c.name === 'Delhaize') && cityInfo.tier === 'MID_TOWN' && (location === 'Halle' || location === 'Asse')) return true;
                return false;
            }
            if (c.type === 'LOGISTICS') {
                return cityInfo.special === 'AIRPORT' || cityInfo.special === 'PORT' || cityInfo.tier === 'METROPOLIS';
            }
            if (c.type === 'MALL') {
                // Mall brands only in Major Cities
                return cityInfo.tier === 'METROPOLIS' || cityInfo.tier === 'PROVINCIAL_CAPITAL';
            }
            if (c.type === 'SUPERMARKET') {
                // Supermarkets in Cities + Mid Towns
                // Excluded VILLAGE above, so this is always true
                return true;
            }
            return false;
        });

        if (validCompanies.length === 0) continue; // Skip iteration if no valid company found (Obourg will get 0 generated jobs)

        const companyObj = validCompanies[Math.floor(Math.random() * validCompanies.length)];

        // 3. Pick Role that fits this Company Type
        // Start with random selection from pool
        let role = rolePool[Math.floor(Math.random() * rolePool.length)];

        // If role doesn't fit company type, try a few times to find one that does
        let attempts = 0;
        while (role.allowedTypes && !role.allowedTypes.includes(companyObj.type) && attempts < 15) {
            role = rolePool[Math.floor(Math.random() * rolePool.length)];
            attempts++;
        }

        // Force fallback if still mismatch (rare)
        if (role.allowedTypes && !role.allowedTypes.includes(companyObj.type)) {
            if (companyObj.type === 'HQ') role = ROLES.find(r => r.baseTitle === 'Category Manager')!;
            else if (companyObj.type === 'LOGISTICS') role = ROLES.find(r => r.baseTitle === 'Operations Manager')!;
            else role = ROLES.find(r => r.baseTitle === 'Vendeur')!;
        }

        const displayTitle = role.synonyms[Math.floor(Math.random() * role.synonyms.length)];

        const daysAgo = Math.floor(Math.random() * 14);
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);

        jobs.push({
            id: `gen-${jobGeneratorRunId}-${i}`,
            title: displayTitle + (Math.random() > 0.8 ? ' (H/F)' : ''),
            company: companyObj.name,
            location: location,
            contract: 'CDI',
            description: role.desc,
            requirements: role.reqs,
            postedAt: `Il y a ${daysAgo} jours`,
            url: `https://www.google.com/search?q=jobs+${companyObj.name}+${displayTitle}+${location}`,
            source: 'Simulated',
            level: role.level,
            aiFitScore: 0,
            matchReason: 'Simulation de volume.',
            status: 'NEW',
            date: date.toISOString(),
            logo: `https://logo.clearbit.com/${companyObj.name.toLowerCase().replace(/\s/g, '')}.com`
        });
    }

    return jobs;
};

// Stateless run ID to avoid duplicate keys in React lists
const jobGeneratorRunId = Math.floor(Math.random() * 1000);
