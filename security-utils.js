// Security: Validate and sanitize user input
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
     * Validate image URL to prevent malicious content
     * @param {string} url - Image URL to validate
     * @returns {boolean} True if valid
     */
    isValidImageUrl: function(url) {
        if (typeof url !== 'string') return false;
        
        // Allow data URLs, https URLs, and relative paths
        const validPatterns = [
            /^data:image\/(jpeg|jpg|png|gif|webp);base64,/i,
            /^https:\/\//i,
            /^\//, // Relative paths
            /^\.\// // Current directory paths
        ];
        
        return validPatterns.some(pattern => pattern.test(url));
    },

    /**
     * Escape special regex characters
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    escapeRegExp: function(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
};