// Coordinates for Obourg (Mons)
const OBOURG = { lat: 50.4981, lon: 4.0628 };

// Major Belgian Cities Mapping (approximate centers)
const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
    'Bruxelles': { lat: 50.8503, lon: 4.3517 },
    'Brussels': { lat: 50.8503, lon: 4.3517 },
    'Anvers': { lat: 51.2194, lon: 4.4025 },
    'Antwerpen': { lat: 51.2194, lon: 4.4025 },
    'Gand': { lat: 51.0543, lon: 3.7174 },
    'Gent': { lat: 51.0543, lon: 3.7174 },
    'Charleroi': { lat: 50.4101, lon: 4.4443 },
    'Liège': { lat: 50.6326, lon: 5.5797 },
    'Namur': { lat: 50.4674, lon: 4.8720 },
    'Mons': { lat: 50.4542, lon: 3.9567 },
    'Louvain': { lat: 50.8798, lon: 4.7005 },
    'Leuven': { lat: 50.8798, lon: 4.7005 },
    'Bruges': { lat: 51.2093, lon: 3.2247 },
    'Brugge': { lat: 51.2093, lon: 3.2247 },
    'Hasselt': { lat: 50.9307, lon: 5.3325 },
    'Wavre': { lat: 50.7162, lon: 4.6083 },
    'Tournai': { lat: 50.6059, lon: 3.3813 },
    'Arlon': { lat: 49.6833, lon: 5.8167 },
    'Zaventem': { lat: 50.8804, lon: 4.4754 },
    'Malines': { lat: 51.0259, lon: 4.4770 },
    'Mechelen': { lat: 51.0259, lon: 4.4770 }
};

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
    if (!location) return 0; // Default if unknown

    // Handle "National" or broad scopes as 0 so they are always included
    if (location.toLowerCase().includes('national') || location.toLowerCase().includes('belgique') || location.toLowerCase().includes('remote')) {
        return 0;
    }

    // Try to find a known city in the location string
    for (const [city, coords] of Object.entries(CITY_COORDS)) {
        if (location.toLowerCase().includes(city.toLowerCase())) {
            return calculateDistanceKM(OBOURG.lat, OBOURG.lon, coords.lat, coords.lon);
        }
    }

    // Fallback: If we can't find specific city, assume 0 (e.g. Obourg itself, or parsing error) 
    // Wait, if it's "Paris", we don't want to show it as 0. 
    // But since we only mock Belgian cities, if it's not in our list, it might be obscure.
    // Let's return 0 to be safe (show it) rather than hide potentially good result.
    // Or return very high distance?
    // Given the user wants to Filter, showing "unknowns" is safer than hiding.
    return 0;
}
