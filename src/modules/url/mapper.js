export function toUrlResponse(dbUrl, baseUrl = '') {
	if (!dbUrl) return null;

	return {
		id: dbUrl.id,
		originalUrl: dbUrl.url,
		shortCode: dbUrl.shortCode,
		shortUrl: baseUrl ? `${baseUrl}/${dbUrl.shortCode}` : dbUrl.shortCode,
		accessCount: dbUrl.accessCount || 0,
		createdAt: dbUrl.createdAt,
		updatedAt: dbUrl.updatedAt,
	};
}

export function toUrlListResponse(dbUrls, baseUrl = '') {
	if (!Array.isArray(dbUrls)) return [];
	return dbUrls.map(url => toUrlResponse(url, baseUrl));
}

export function toCreateUrlDto(data) {
	return {
		originalUrl: data.originalUrl?.trim(),
		shortCode: data.shortCode?.trim(),
	};
}