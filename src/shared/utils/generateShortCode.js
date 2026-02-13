import { nanoid } from 'nanoid';

export function generateShortCode(length = 7) {
	return nanoid(length);
}
