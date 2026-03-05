export function toUrlResponse(dbUrl) {
	if (!dbUrl) return null;

	return {
		id: String(dbUrl.id),
		url: dbUrl.url,
		shortCode: dbUrl.shortCode,
		createdAt: dbUrl.createdAt,
		updatedAt: dbUrl.updatedAt,
	};
}

export function toUrlStatsResponse(dbUrl) {
	if (!dbUrl) return null;

	return {
		...toUrlResponse(dbUrl),
		accessCount: dbUrl.accessCount,
	};
}
