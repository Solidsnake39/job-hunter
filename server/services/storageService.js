
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'job_status.json');

// Initialize Store
export async function initStore() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }

    try {
        await fs.access(DB_FILE);
    } catch {
        await fs.writeFile(DB_FILE, JSON.stringify({}, null, 2));
    }
}

// Load Status Map
export async function loadJobStatuses() {
    try {
        await initStore();
        const data = await fs.readFile(DB_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error loading job statuses:", error);
        return {};
    }
}

// Save Status
export async function saveJobStatus(jobId, status) {
    try {
        const statuses = await loadJobStatuses();
        statuses[jobId] = status;
        await fs.writeFile(DB_FILE, JSON.stringify(statuses, null, 2));
        return true;
    } catch (error) {
        console.error("Error saving job status:", error);
        return false;
    }
}
