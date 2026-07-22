export const VERSION = 'v1';

export const LAST_USED_HASH = `vyrlo:api_key:last_used:${VERSION}`;

export const LAST_USED_DEBOUNCE_SECONDS = 60;

export const LRU_SOFT_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const REDIS_HARD_TTL_SECONDS = 20 * 60 * 1000; // 20 minutes
