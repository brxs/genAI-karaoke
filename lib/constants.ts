// Shared constants for forms and settings

// Input limits
export const MAX_TOPIC_LENGTH = 200;
export const MAX_CUSTOM_STYLE_LENGTH = 200;
export const MAX_CONTEXT_LENGTH = 3000;

// Image upload limits
export const MAX_IMAGES = 5;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// Generation settings
export const CONCURRENT_IMAGE_REQUESTS = 4;
export const IMAGE_REQUEST_STAGGER_MS = 150; // Delay between starting each worker
