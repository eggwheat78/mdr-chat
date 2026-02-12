// security-utils.js
const SecurityUtils = {
    /**
     * Sanitize HTML content to prevent XSS
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    sanitizeHTML: function(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Validate time offset is within expected range
     * @param {number} offset - Time offset to validate
     * @returns {boolean} True if valid
     */
    isValidTimeOffset: function(offset) {
        return Number.isInteger(offset) && offset >= 0 && offset <= 60;
    },

    /**
     * Validate image path - supports local files, URLs, and data URIs
     * @param {string} url - Image path to validate
     * @returns {boolean} True if valid
     */
    isValidImageUrl: function(url) {
        if (typeof url !== 'string' || url === '') return false;
        
        // Allow empty src (will be replaced with placeholder)
        if (url === '') return true;
        
        const validPatterns = [
            /^data:image\/(jpeg|jpg|png|gif|webp|svg\+xml);base64,/i,
            /^https:\/\//i,
            /^http:\/\//i,
            /^file:\/\//i,
            /^\//,                   // Absolute paths
            /^\.\//,                // Current directory
            /^\.\.\//,             // Parent directory
            /^[^/][^:]*\//,        // Relative paths (images/, assets/)
            /^[^/][^:]*\.(jpg|jpeg|png|gif|webp|svg|ico|bmp)$/i  // Direct files
        ];
        
        return validPatterns.some(pattern => pattern.test(url));
    },

    /**
     * Convert local path to proper file URL that works with file:// protocol
     * @param {string} path - Relative or absolute path to image
     * @returns {string} Properly formatted image path
     */
    getLocalImageUrl: function(path) {
        if (!path || typeof path !== 'string') return '';
        
        // If it's already a full URL, data URI, or file protocol, return as is
        if (path.startsWith('http://') || 
            path.startsWith('https://') || 
            path.startsWith('data:') || 
            path.startsWith('file://') ||
            path.startsWith('blob:')) {
            return path;
        }
        
        // Handle Windows paths
        if (path.includes('\\')) {
            path = path.replace(/\\/g, '/');
        }
        
        // Remove leading ./ or .\
        let cleanPath = path.replace(/^\.\/|^\.\\/g, '');
        
        // If we're running from file:// protocol
        if (window.location.protocol === 'file:') {
            // Get the directory of the current HTML file
            let basePath = window.location.pathname;
            
            // Remove the filename from the path
            if (basePath.includes('/')) {
                basePath = basePath.substring(0, basePath.lastIndexOf('/') + 1);
            }
            
            // Handle parent directory references (../)
            while (cleanPath.startsWith('../')) {
                cleanPath = cleanPath.substring(3);
                if (basePath.includes('/')) {
                    basePath = basePath.substring(0, basePath.lastIndexOf('/'));
                    if (!basePath.endsWith('/')) basePath += '/';
                }
            }
            
            // Construct file:// URL
            return 'file://' + basePath + cleanPath;
        }
        
        // For HTTP/HTTPS protocols, just return the relative path
        return cleanPath;
    },

    /**
     * Create a fallback SVG image when image fails to load
     * @param {string} altText - Alternative text for the image
     * @returns {string} Data URL of fallback SVG
     */
    createFallbackImage: function(altText = 'Image not found') {
        const escapedAlt = this.sanitizeHTML(altText);
        return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="260" height="180" viewBox="0 0 260 180"><rect width="260" height="180" fill="%23f0f0f0"/><circle cx="130" cy="70" r="30" fill="%23ddd"/><text x="80" y="120" font-family="Arial" font-size="14" fill="%23999">🖼️ ${escapedAlt}</text><text x="65" y="140" font-family="Arial" font-size="12" fill="%23aaa">Click to view full size</text></svg>`;
    },

    /**
     * Escape special regex characters
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    escapeRegExp: function(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    /**
     * Check if a path is a local file path
     * @param {string} path - Path to check
     * @returns {boolean} True if local file
     */
    isLocalPath: function(path) {
        if (!path || typeof path !== 'string') return false;
        return !path.startsWith('http') && 
               !path.startsWith('data:') && 
               !path.startsWith('blob:') &&
               !path.startsWith('file://');
    },

    /**
     * Preload an image to ensure it's cached
     * @param {string} src - Image source to preload
     * @returns {Promise} Promise that resolves when image loads
     */
    preloadImage: function(src) {
        return new Promise((resolve, reject) => {
            if (!src) {
                reject(new Error('No image source provided'));
                return;
            }
            
            const img = new Image();
            img.onload = () => resolve(src);
            img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
        });
    },

    /**
     * Format file size for display
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted file size
     */
    formatFileSize: function(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Extract filename from path
     * @param {string} path - File path
     * @returns {string} Filename
     */
    getFilenameFromPath: function(path) {
        if (!path) return '';
        return path.split('/').pop().split('\\').pop();
    }
};