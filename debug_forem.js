
import axios from 'axios';
import https from 'https';
import crypto from 'crypto';

const baseUrl = 'https://odwb.be/api/explore/v2.1/catalog/datasets/offres-d-emploi-forem/records';

async function test() {
    console.log("Testing Forem API with Cipher Fix...");

    // Fix for OpenSSL 3 vs Legacy Servers
    const agent = new https.Agent({
        rejectUnauthorized: false, // development only
        ciphers: 'DEFAULT@SECLEVEL=0'
    });

    try {
        console.log("Fetching Manager...");
        const params = new URLSearchParams({
            limit: '5',
            where: `search(titre, "Manager")`
        });

        const { data } = await axios.get(`${baseUrl}?${params.toString()}`, {
            httpsAgent: agent,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        console.log(`Success! Found ${data.results?.length} items.`);
    } catch (e) {
        console.error("Error:", e.message);
        if (e.code) console.error("Code:", e.code);
    }
}

test();
