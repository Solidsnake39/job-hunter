
export class LocationClassifier {
    static classify(job) {
        const nationalKeywords = [
            'belgium', 'belgique', 'belgië',
            'bruxelles', 'brussels', 'brussel',
            'antwerpen', 'anvers',
            'gent', 'gand',
            'charleroi',
            'liège', 'luik',
            'namur', 'namen',
            'mons', 'bergen',
            'leuven', 'louvain',
            'nivelles', 'nijvel',
            'wavre', 'waver',
            'mechelen', 'malines',
            'aalst', 'alost',
            'la louvière',
            'kortrijk', 'courtrai',
            'hasselt',
            'sint-niklaas', 'saint-nicolas',
            'oostende', 'ostende',
            'genk',
            'roeselare', 'roulers',
            'tournai', 'doornik'
        ];

        // Normalize text to lowercase for comparison
        const locationLower = (job.location || '').toLowerCase();
        const descriptionLower = (job.description || '').toLowerCase();
        const titleLower = (job.title || '').toLowerCase();

        // Check if any national keyword is present in location or description
        const isNational = nationalKeywords.some(keyword =>
            locationLower.includes(keyword) ||
            descriptionLower.includes(keyword) ||
            titleLower.includes(keyword)
        );

        return isNational ? 'NATIONAL' : 'INTERNATIONAL';
    }
}
