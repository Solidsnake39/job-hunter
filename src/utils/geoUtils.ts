
export interface GeoCoord {
    lat: number;
    lng: number;
}

export const CITY_COORDINATES: Record<string, GeoCoord> = {
    'bruxelles': { lat: 50.8503, lng: 4.3517 },
    'antwerpen': { lat: 51.2194, lng: 4.4025 },
    'gand': { lat: 51.0543, lng: 3.7174 },
    'gent': { lat: 51.0543, lng: 3.7174 }, // Alias
    'charleroi': { lat: 50.4101, lng: 4.4446 },
    'liège': { lat: 50.6326, lng: 5.5797 },
    'namur': { lat: 50.4674, lng: 4.8720 },
    'mons': { lat: 50.4542, lng: 3.9567 },
    'tournai': { lat: 50.6059, lng: 3.3875 },
    'bouge': { lat: 50.4667, lng: 4.8833 },
    'zaventem': { lat: 50.8876, lng: 4.4699 },
    'diegem': { lat: 50.8940, lng: 4.4363 },
    'obourg': { lat: 50.4761, lng: 4.0061 }, // Home base
    'nivelles': { lat: 50.5983, lng: 4.3285 },
    'wavre': { lat: 50.7159, lng: 4.6128 },
    'leuven': { lat: 50.8798, lng: 4.7005 },
    'asse': { lat: 50.9101, lng: 4.1984 },
    'halle': { lat: 50.7339, lng: 4.2345 },
    'kortrijk': { lat: 50.8268, lng: 3.2545 },
    'arlon': { lat: 49.6833, lng: 5.8167 },
    'nazareth': { lat: 50.9576, lng: 3.5959 },
    'beveren-leie': { lat: 50.8833, lng: 3.3500 },
    'kapelle-op-den-bos': { lat: 51.0132, lng: 4.3554 },
    'maasmechelen': { lat: 50.9655, lng: 5.6945 },
    'puurs': { lat: 51.0741, lng: 4.2884 },
    'braine-l\'alleud': { lat: 50.6836, lng: 4.3678 },
    'merelbeke': { lat: 50.9945, lng: 3.7456 },
    'eines': { lat: 50.8524, lng: 3.6015 }, // Estimated near Oudenaarde
    'rotselaar': { lat: 50.9537, lng: 4.7184 },
    'wilrijk': { lat: 51.1683, lng: 4.3943 },
    'anderlecht': { lat: 50.8387, lng: 4.3160 },
    'merchtem': { lat: 50.9587, lng: 4.2185 },
    'zwijndrecht': { lat: 51.2183, lng: 4.3294 },
    'wommelgem': { lat: 51.2036, lng: 4.5230 },
    'kontich': { lat: 51.1348, lng: 4.4449 },
    'sint-niklaas': { lat: 51.1656, lng: 4.1404 },
    'roeselare': { lat: 50.9429, lng: 3.1245 },
    'waregem': { lat: 50.8868, lng: 3.4324 },
    'malines': { lat: 51.0259, lng: 4.4776 },
    'mechelen': { lat: 51.0259, lng: 4.4776 },
    'aalst': { lat: 50.9378, lng: 4.0410 },
    'oudenaarde': { lat: 50.8435, lng: 3.6045 },
    'lokeren': { lat: 51.1042, lng: 3.9912 },
    'genk': { lat: 50.9650, lng: 5.5012 },
    'hasselt': { lat: 50.9307, lng: 5.3325 },
    'turnhout': { lat: 51.3217, lng: 4.9448 },
    'belsele': { lat: 51.1472, lng: 4.0822 },
    'mouscron': { lat: 50.7431, lng: 3.2206 },
    'lille': { lat: 50.6292, lng: 3.0573 },
    'villeneuve-d\'ascq': { lat: 50.6233, lng: 3.1444 },
    // France (North / ~200km)
    'valenciennes': { lat: 50.3570, lng: 3.5183 },
    'douai': { lat: 50.3679, lng: 3.0806 },
    'arras': { lat: 50.2910, lng: 2.7775 },
    'lens': { lat: 50.4292, lng: 2.8310 },
    'dunkerque': { lat: 51.0343, lng: 2.3768 },
    'calais': { lat: 50.9513, lng: 1.8587 },
    'maubeuge': { lat: 50.2775, lng: 3.9734 },
    'saint-quentin': { lat: 49.8454, lng: 3.2867 },
    'amiens': { lat: 49.8941, lng: 2.2957 },
    'reims': { lat: 49.2583, lng: 4.0317 },
    'charleville-mézières': { lat: 49.7621, lng: 4.7157 },
    // Luxembourg
    'luxembourg': { lat: 49.6116, lng: 6.1319 },
    // Germany
    'aachen': { lat: 50.7753, lng: 6.0839 },
    // Netherlands (South)
    'maastricht': { lat: 50.8514, lng: 5.6910 },
    'eindhoven': { lat: 51.4416, lng: 5.4697 },
    'breda': { lat: 51.5719, lng: 4.7683 },
    'tilburg': { lat: 51.5555, lng: 5.0913 },
};

// Deterministic random offset for clustering visual
export const getScatterOffset = (seed: string, scale: number = 0.005) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
    }
    const rng1 = (Math.sin(hash) * 10000) % 1;
    const rng2 = (Math.cos(hash) * 10000) % 1;

    // Return small offset in lat/lng degrees
    return {
        lat: (rng1 - 0.5) * scale,
        lng: (rng2 - 0.5) * 1.5 * scale // Longitude degrees are smaller in distance
    };
};
