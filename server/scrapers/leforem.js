
import axios from 'axios';
import https from 'https';

export async function scrapeLeForem() {
    // Open Data Wallonie-Bruxelles (odwb.be)
    // Dataset: offres-d-emploi-forem
    // Refined for Senior/Management roles only.

    const baseUrl = 'https://odwb.be/api/explore/v2.1/catalog/datasets/offres-d-emploi-forem/records';

    // Strict Keywords for Management/Senior roles
    const keywords = [
        'Directeur',
        'Manager',
        'Head of',
        'Category Manager',
        'Purchasing',
        'Acheteur',
        'Buyer',
        'Responsable',
        'Supply Chain',
        'Logistics',
        'Business Unit',
        'Commercial',
        'Account Manager',
        'Sales Manager',
        'Store Manager',
        'Gerant',
        'Superviseur'
    ];

    // Negative keywords to filter out AFTER fetching if API doesn't support NOT cleanly in simple search
    // (ODSQL supports 'NOT' but simple search is often safer to fetch then filter)
    const negativeKeywords = ['junior', 'stagiaire', 'student', 'chauffeur', 'nettoyeur', 'ouvrier', 'technicien'];

    const promises = keywords.map(async (keyword) => {
        try {
            // Using a strictly targeted search
            const params = new URLSearchParams({
                limit: '20', // Fetch more per keyword
                where: `search(titre, "${keyword}")`, // Search mainly in Title to avoid false positives in description
                order_by: 'date_creation desc'
            });

            const { data } = await axios.get(`${baseUrl}?${params.toString()}`, {
                timeout: 8000,
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            });
            return data.results || [];
        } catch (e) {
            console.error(`Le Forem Error for ${keyword}:`, e.message);
            return [];
        }
    });

    try {
        const results = await Promise.all(promises);
        const flatResults = results.flat();
        const uniqueJobs = new Map();

        flatResults.forEach(record => {
            const title = record.intitule || record.titre || 'Poste sans titre';

            // Client-side filtering for Relevance
            const cleanTitle = title.toLowerCase();
            const isRelevant = !negativeKeywords.some(neg => cleanTitle.includes(neg));

            if (!isRelevant) return;

            const id = record.reference_offre || record.id_offre || `forem-${Math.random()}`;
            const location = record.commune_lieu_de_travail || record.localite || 'Belgique';
            const desc = record.description_de_l_offre || record.description || '';
            const date = record.date_creation || new Date().toISOString();
            // Forem URLs are often generic, let's try to construct a search link if direct link missing
            const url = record.url_offre || `https://www.leforem.be/recherche-offres-emploi/resultats?ref=${id}`;

            if (!uniqueJobs.has(id)) {
                uniqueJobs.set(id, {
                    id: `forem-${id}`,
                    title: title,
                    company: 'Le Forem Network', // Often hidden
                    description: desc,
                    location: location,
                    date: date,
                    url: url,
                    source: 'Le Forem',
                    scope: 'NATIONAL',
                    aiFitScore: 4, // Default higher for these strict keywords
                    summary: desc.substring(0, 150) + '...',
                    status: 'NEW'
                });
            }
        });

        const jobList = Array.from(uniqueJobs.values());
        console.log(`Le Forem Scraper (Strict): Found ${jobList.length} relevant jobs.`);
        return jobList;

    } catch (e) {
        console.error('Le Forem Global Error:', e);
        return [];
    }
}
