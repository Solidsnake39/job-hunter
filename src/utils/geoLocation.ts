import { CITY_COORDINATES } from './geoUtils';

// Coordinates for Obourg (Mons)
const OBOURG = { lat: 50.4761, lon: 4.0061 }; // Updated to match geoUtils precision

function toRad(value: number) {
    return (value * Math.PI) / 180;
}

// Haversine Formula
function calculateDistanceKM(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function getDistanceFromObourg(location: string): number {
    if (!location) return 999; // Unknown location = far away

    const locLower = location.toLowerCase();

    // Handle "National" or broad scopes as 0 so they are always included?
    // User requested strict distance. National jobs usually don't have a specific location.
    // Let's keep them as 0 only if explicitly stated, otherwise strict check.
    if (locLower.includes('remote') || locLower.includes('télétravail')) {
        return 0; // Always show remote
    }

    // Direct lookup in our comprehensive DB
    // CITY_COORDINATES keys are usually lowercase in the definition, but mapped from capitalized in generator.
    // let's try direct match first then scan.

    // keys in geoUtils are lowercase!
    if (CITY_COORDINATES[locLower]) {
        const coords = CITY_COORDINATES[locLower];
        return calculateDistanceKM(OBOURG.lat, OBOURG.lon, coords.lat, coords.lng);
    }

    // Scan for substrings (e.g. location="Mons (7000)")
    for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
        if (locLower.includes(city.toLowerCase())) {
            return calculateDistanceKM(OBOURG.lat, OBOURG.lon, coords.lat, coords.lng);
        }
    }

    // Fallback: If unknown, it shouldn't be 0. It should be filtered out.
    // e.g. "Paris" (if not in DB) is > 10km.
    return 9999;
}
