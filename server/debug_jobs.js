import { fetchAllJobs } from './services/jobService.js';

console.log("Running fetchAllJobs debug...");

fetchAllJobs().then(jobs => {
    console.log("--- RESULT ---");
    console.log(`Total Job Count: ${jobs.length}`);
    if (jobs.length === 0) {
        console.log("WARN: No jobs returned.");
    } else {
        console.log("First job sample:", jobs[0]);
    }
}).catch(err => {
    console.error("ERROR:", err);
});
