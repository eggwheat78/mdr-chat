// security-utils.js
const SecurityUtils = {
    sanitizeHTML: function(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    isValidTimeOffset: function(offset) {
        return Number.isInteger(offset) && offset >= 0 && offset <= 60;
    },

    isValidImageUrl: function(url) {
        if (typeof url !== 'string') return false;
        
        const validPatterns = [
            /^data:image\/(jpeg|jpg|png|gif|webp);base64,/i,
            /^https:\/\//i,
            /^\//,
            /^\.\//
        ];
        
        return validPatterns.some(pattern => pattern.test(url));
    },

    escapeRegExp: function(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
};
