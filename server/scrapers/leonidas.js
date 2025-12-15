
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeLeonidas() {
    try {
        console.log('Fetching Leonidas jobs...');
        const { data } = await axios.get('https://jobs.leonidas.com/jobs');
        const $ = cheerio.load(data);
        const jobs = [];

        // Analyzed structure from read_url_content earlier:
        // Links like /jobs/marketing-director-42a8e42d
        // They seem to be in a list. We need to find the job cards.
        // Assuming standard class names or looking for <a> with /jobs/

        $('a[href^="/jobs/"]').each((i, el) => {
            const link = $(el).attr('href');
            // Skip non-job links if any (though /jobs/ usually means job)
            if (link === '/jobs' || link === '/jobs/') return;

            const fullUrl = `https://jobs.leonidas.com${link}`;

            // Try to extract title from text or nested elements
            // The previous read_url output showed: "[Directeur Marketing](...)"
            let title = $(el).text().trim();

            // Clean up title (remove "Postuler" etc if caught)
            title = title.replace(/Postuler$/i, '').trim();

            // Location is often in a sibling or child. 
            // In the text dump: "Directeur MarketingNijvelPostuler" -> likely nested text.
            // Let's assume the text inside the <a> is the Title + Location.
            // We might need a better selector if we could see the HTML, but for now:

            // Fallback for location if not parsed:
            const location = 'National (See details)';

            if (title) {
                jobs.push({
                    id: `leo-${i}`, // simple ID
                    title: title,
                    company: 'Leonidas',
                    location: location,
                    url: fullUrl,
                    date: new Date().toISOString(),
                    source: 'Leonidas'
                });
            }
        });

        console.log(`Leonidas: Found ${jobs.length} jobs.`);
        return jobs;
    } catch (e) {
        console.error('Leonidas Scraper Error:', e.message);
        return [];
    }
}
