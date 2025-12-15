
import axios from 'axios';

async function testJobat() {
    console.log("Testing Jobat Fetch...");
    try {
        const { data } = await axios.get('https://www.jobat.be/fr/emplois?q=manager', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
            }
        });
        console.log("Jobat Status:", 200);
        console.log("Content Length:", data.length);
        if (data.includes('job-card') || data.includes('job-result') || data.includes('job-listing')) {
            console.log("Found job cards markers!");
        } else {
            console.log("HTML fetched but marker not found. Layout might have changed.");
            // Log snippets to identify structure
            console.log(data.substring(0, 500));
        }
    } catch (e) {
        console.error("Jobat Error:", e.message);
    }
}

testJobat();
