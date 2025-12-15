
import { scrapeLeForem } from '../scrapers/leforem.js';
import { LocationClassifier } from './locationClassifier.js';
import { loadJobStatuses } from './storageService.js';

export async function fetchAllJobs() {
    console.log('--- Starting Universal Job Fetch ---');
    const allJobs = [];

    // Load persisted statuses
    const statusMap = await loadJobStatuses();

    // Helper for timeouts
    const withTimeout = (promise, ms) => new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Timeout')), ms);
        promise.then(value => { clearTimeout(timer); resolve(value); })
            .catch(err => { clearTimeout(timer); reject(err); });
    });

    // 1. Scrapers (Specific High Quality)
    // 10 second timeout for the massive Forem fetch
    const results = await Promise.allSettled([
        withTimeout(scrapeLeForem(), 10000)
    ]);

    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            allJobs.push(...result.value);
        } else {
            console.error(`Scraper ${index} failed:`, result.reason);
        }
    });

    // 2. Post-Processing: Classification & Sorting & Enrichment
    const processed = allJobs.map(job => {
        // Classify Scope
        const scope = LocationClassifier.classify(job);

        // Mock AI Enrichment (Fit Score 1-5)
        // Heuristic:
        let score = 3;
        const lowerTitle = job.title.toLowerCase();
        if (lowerTitle.includes('directeur') || lowerTitle.includes('manager') || lowerTitle.includes('head')) score += 1;
        if (lowerTitle.includes('sales') || lowerTitle.includes('commercial') || lowerTitle.includes('purchase') || lowerTitle.includes('buyer')) score += 1;
        if (score > 5) score = 5;

        // Mock Summary
        const summary = job.description
            ? job.description.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...'
            : 'Aucune description disponible.';

        // Apply Persisted Status if exists, else NEW
        const persistedStatus = statusMap[job.id];

        return {
            ...job,
            scope, // 'NATIONAL' or 'INTERNATIONAL'
            aiFitScore: job.aiFitScore || score,
            summary: job.summary || summary,
            status: persistedStatus || 'NEW'
        };
    });

    console.log(`Total Jobs Fetched: ${processed.length}`);
    return processed.sort((a, b) => new Date(b.date) - new Date(a.date));
}
