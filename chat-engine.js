// chat-engine.js
class ChatDemo {
    constructor(chatContent) {
        this.chatContent = chatContent;
        
        this.CONFIG = Object.freeze({
            MAX_MESSAGES: 100,
            MAX_TIME_OFFSET: 60,
            ANIMATION_DELAY: 50,
            MAX_MINUTES_BETWEEN: chatContent.timestampConfig.maxMinutesBetween,
            BUSINESS_HOURS_START: chatContent.timestampConfig.businessHoursStart,
            BUSINESS_HOURS_END: chatContent.timestampConfig.businessHoursEnd,
            HOURS_TO_ADD_AFTER_HOURS: chatContent.timestampConfig.hoursToAddAfterHours,
            HOURS_TO_ADD_BUSINESS_HOURS: chatContent.timestampConfig.hoursToAddBusinessHours,
            SCROLL_THRESHOLD: 10,
            DEFAULT_INTERVAL: 3 // Fixed 3 minutes between messages
        });

        this._private = new WeakMap();
        this._private.set(this, {
            elements: null,
            currentMessageIndex: 0,
            timeOffsets: null,
            baseTime: null,
            initialized: false,
            touchStartY: 0,
            isScrolling: false,
            images: [],
            interactionCooldown: false,
            preloadedImages: new Map()
        });

        this.init();
    }

    /**
     * Get private property
     */
    _getPrivate(key) {
        return this._private.get(this)[key];
    }

    /**
     * Set private property
     */
    _setPrivate(key, value) {
        const privateData = this._private.get(this);
        privateData[key] = value;
        this._private.set(this, privateData);
    }

    /**
     * Initialize the chat UI with content
     */
    initChatUI() {
        // Set header information
        const avatarEl = document.getElementById('chatAvatar');
        const titleEl = document.getElementById('chatTitle');
        const subtitleEl = document.getElementById('chatSubtitleText');
        
        if (avatarEl) avatarEl.textContent = this.chatContent.header.avatar;
        if (titleEl) titleEl.textContent = this.chatContent.header.title;
        if (subtitleEl) subtitleEl.textContent = this.chatContent.header.subtitle;
        
        // Generate all chat messages - this now handles both date separators
        this.generateChatMessages();
    }

    /**
     * Generate HTML for all chat messages
     */
    generateChatMessages() {
        const chatContainer = document.getElementById('chatContainer');
        if (!chatContainer) {
            console.error('❌ Chat container not found');
            return;
        }
        
        // Check for duplicate IDs
        const ids = new Set();
        this.chatContent.messages.forEach((message, index) => {
            const msgId = message.id || index;
            if (ids.has(msgId)) {
                console.warn(`⚠️ Duplicate message ID found: ${msgId} at index ${index}, auto-fixing...`);
                message.id = `${msgId}-${index}`;
            }
            ids.add(msgId);
        });
        
        // Clear existing content
        chatContainer.innerHTML = '';
        
        // Create first date separator (Yesterday in dd/mm/yyyy)
        const firstDateSeparator = document.createElement('div');
        firstDateSeparator.className = 'date-separator';
        firstDateSeparator.id = 'dateSeparator1';
        firstDateSeparator.innerHTML = `<span class="date-label" id="dateLabel1">${this.chatContent.dateLabel || '13/02/2026'}</span>`;
        chatContainer.appendChild(firstDateSeparator);
        
        // Loop through each message and create bubble with timestamp
        this.chatContent.messages.forEach((message, index) => {
            try {
                const bubble = document.createElement('div');
                bubble.className = `bubble message-${message.type}`;
                bubble.dataset.messageId = message.id || index;
                bubble.dataset.messageIndex = index;
                
                // Sender label
                const senderLabel = document.createElement('div');
                senderLabel.className = 'sender-label';
                senderLabel.textContent = message.sender;
                bubble.appendChild(senderLabel);
                
                // Message content
                const messageContent = document.createElement('div');
                messageContent.className = 'message-content';
                
                // Handle different content types
                if (typeof message.content === 'string') {
                    messageContent.textContent = message.content;
                } 
                else if (message.content.type === 'image') {
                    // IMAGE MESSAGE
                    const imgData = message.content;
                    const imageContainer = document.createElement('div');
                    imageContainer.className = 'chat-image-container';
                    
                    const img = document.createElement('img');
                    const thumbnailPath = SecurityUtils.getLocalImageUrl(imgData.url);
                    img.src = thumbnailPath;
                    img.alt = imgData.alt || 'Chat image';
                    img.className = 'chat-image';
                    img.dataset.imageId = `image-${message.id || index}`;
                    img.loading = 'lazy';
                    
                    img.dataset.thumbnailPath = thumbnailPath;
                    img.dataset.fullPath = imgData.fullUrl 
                        ? SecurityUtils.getLocalImageUrl(imgData.fullUrl) 
                        : thumbnailPath;
                    
                    if (imgData.fit === 'contain') {
                        img.classList.add('contain');
                    }
                    
                    img.onerror = function() {
                        this.src = SecurityUtils.createFallbackImage(imgData.alt);
                        this.classList.add('image-error');
                    };
                    
                    img.onload = function() {
                        this.classList.add('image-loaded');
                    };
                    
                    imageContainer.appendChild(img);
                    messageContent.appendChild(imageContainer);
                    
                    if (imgData.caption) {
                        const caption = document.createElement('div');
                        caption.className = 'image-caption';
                        caption.textContent = imgData.caption;
                        messageContent.appendChild(caption);
                    }
                }
                else if (message.content.type === 'multiline') {
                    if (Array.isArray(message.content.lines)) {
                        message.content.lines.forEach((line) => {
                            const lineElement = document.createElement('div');
                            lineElement.textContent = line;
                            lineElement.style.whiteSpace = 'pre-wrap';
                            lineElement.style.wordBreak = 'break-word';
                            
                            if (line === '') {
                                lineElement.style.marginBottom = '8px';
                                lineElement.style.height = '1px';
                            }
                            
                            messageContent.appendChild(lineElement);
                        });
                    }
                }
                else if (message.content.type === 'bullets') {
                    if (Array.isArray(message.content.items)) {
                        message.content.items.forEach((item) => {
                            const bulletItem = document.createElement('div');
                            bulletItem.style.marginBottom = '8px';
                            bulletItem.style.paddingLeft = '20px';
                            bulletItem.style.position = 'relative';
                            
                            const bulletSpan = document.createElement('span');
                            bulletSpan.style.position = 'absolute';
                            bulletSpan.style.left = '0';
                            bulletSpan.textContent = '•';
                            bulletItem.appendChild(bulletSpan);
                            
                            const textSpan = document.createElement('span');
                            textSpan.textContent = item;
                            bulletItem.appendChild(textSpan);
                            
                            messageContent.appendChild(bulletItem);
                        });
                    }
                }
                else if (message.content.type === 'code') {
                    const codeElement = document.createElement('pre');
                    codeElement.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                    codeElement.style.padding = '12px';
                    codeElement.style.borderRadius = '8px';
                    codeElement.style.fontFamily = 'monospace';
                    codeElement.style.fontSize = '13px';
                    codeElement.style.overflowX = 'auto';
                    codeElement.style.whiteSpace = 'pre-wrap';
                    codeElement.style.wordBreak = 'break-word';
                    codeElement.textContent = message.content.code || '';
                    
                    messageContent.appendChild(codeElement);
                }
                
                bubble.appendChild(messageContent);
                
                // Timestamp
                const timestamp = document.createElement('div');
                timestamp.className = 'timestamp';
                timestamp.dataset.messageIndex = index;
                timestamp.dataset.messageId = message.id || index;
                timestamp.textContent = '--:--'; // Placeholder, will be updated
                bubble.appendChild(timestamp);
                
                chatContainer.appendChild(bubble);
                
                // AFTER MESSAGE ID 22, INSERT TODAY'S DATE SEPARATOR
                if (message.id === 25) {
                    const secondDateSeparator = document.createElement('div');
                    secondDateSeparator.className = 'date-separator';
                    secondDateSeparator.id = 'dateSeparator2';
                    secondDateSeparator.innerHTML = `<span class="date-label" id="dateLabel2">${this.chatContent.todayDate || '14/02/2026'}</span>`;
                    chatContainer.appendChild(secondDateSeparator);
                    console.log(`📅 Inserted today's date separator: ${this.chatContent.todayDate}`);
                }
                
            } catch (error) {
                console.error(`❌ Error generating message ${index}:`, error);
            }
        });
        
        console.log(`✅ Generated ${this.chatContent.messages.length} message bubbles`);
    }

    /**
     * Generate base time based on current client time
     */
    generateBaseTime() {
        const now = new Date();
        const baseTime = new Date(now);
        const currentHour = now.getHours();
        
        const isBusinessHours = currentHour >= this.CONFIG.BUSINESS_HOURS_START && 
                               currentHour < this.CONFIG.BUSINESS_HOURS_END;
        
        if (isBusinessHours) {
            baseTime.setHours(currentHour + this.CONFIG.HOURS_TO_ADD_BUSINESS_HOURS);
        } else {
            baseTime.setHours(currentHour + this.CONFIG.HOURS_TO_ADD_AFTER_HOURS);
        }
        
        // Round to nearest 5 minutes for cleaner look
        const minutes = baseTime.getMinutes();
        baseTime.setMinutes(Math.floor(minutes / 5) * 5, 0, 0);
        
        return baseTime;
    }

    /**
     * Format time to 12-hour format with AM/PM
     */
    formatTime(date) {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            return '--:--';
        }

        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        
        return `${hours}:${minutes} ${ampm}`;
    }
    
    /**
     * Generate LINEAR, STRICTLY INCREASING time offsets
     */
    generateLinearTimeOffsets() {
        const timestamps = document.querySelectorAll('.timestamp');
        const offsets = [];
        const baseInterval = this.CONFIG.DEFAULT_INTERVAL; // Fixed 3 minutes
        
        for (let i = 0; i < timestamps.length; i++) {
            offsets.push(i * baseInterval);
        }
        
        console.log(`📊 Generated LINEAR offsets: ${offsets.join(', ')} min`);
        return Object.freeze(offsets);
    }

    /**
     * Safely set text content with fallback methods
     */
    _safeSetTextContent(element, text) {
        if (!element) return false;
        
        try {
            element.textContent = text;
            return true;
        } catch (e) {
            try {
                setTimeout(() => {
                    try {
                        element.textContent = text;
                    } catch (e) {}
                }, 0);
                return false;
            } catch (e) {
                return false;
            }
        }
    }

    /**
     * Update ALL timestamps with LINEAR, CHRONOLOGICAL times
     */
    updateTimestamps() {
        const timestamps = document.querySelectorAll('.timestamp');
        
        if (timestamps.length === 0) {
            console.error('❌ No timestamp elements found');
            return;
        }

        console.log(`⏰ Updating ${timestamps.length} timestamps with LINEAR progression...`);
        
        const baseTime = this.generateBaseTime();
        this._setPrivate('baseTime', baseTime);
        
        const offsets = this.generateLinearTimeOffsets();
        this._setPrivate('timeOffsets', offsets);
        
        let lastTime = null;
        let successCount = 0;
        
        timestamps.forEach((timestamp, i) => {
            try {
                const offset = offsets[i];
                
                const messageTime = new Date(baseTime);
                messageTime.setMinutes(baseTime.getMinutes() + offset);
                
                const formattedTime = this.formatTime(messageTime);
                
                if (this._safeSetTextContent(timestamp, formattedTime)) {
                    successCount++;
                }
                
                if (lastTime && messageTime <= lastTime) {
                    console.warn(`⚠️ Non-linear timestamp detected at index ${i}, fixing...`);
                    
                    const fixedTime = new Date(lastTime);
                    fixedTime.setMinutes(lastTime.getMinutes() + 1);
                    const fixedFormatted = this.formatTime(fixedTime);
                    
                    this._safeSetTextContent(timestamp, fixedFormatted);
                    messageTime.setTime(fixedTime.getTime());
                }
                
                lastTime = new Date(messageTime);
                
            } catch (error) {
                console.error(`❌ Error updating timestamp ${i}:`, error);
                
                try {
                    const fallbackTime = new Date(baseTime);
                    fallbackTime.setMinutes(baseTime.getMinutes() + (i * 3));
                    const fallbackFormatted = this.formatTime(fallbackTime);
                    this._safeSetTextContent(timestamp, fallbackFormatted);
                } catch (e) {}
            }
        });
        
        console.log(`✅ Updated ${successCount}/${timestamps.length} timestamps`);
        
        setTimeout(() => {
            this.verifyChronologicalOrder();
        }, 50);
    }
    
    /**
     * Verify timestamps are in chronological order
     */
    verifyChronologicalOrder() {
        const timestamps = document.querySelectorAll('.timestamp');
        let previousTime = null;
        let isChronological = true;
        let fixedCount = 0;
        
        console.log('📋 Verifying chronological order...');
        
        timestamps.forEach((ts, i) => {
            const timeText = ts.textContent;
            if (timeText === '--:--') return;
            
            try {
                const [time, ampm] = timeText.split(' ');
                let [hours, minutes] = time.split(':').map(Number);
                
                if (ampm === 'PM' && hours !== 12) hours += 12;
                if (ampm === 'AM' && hours === 12) hours = 0;
                
                const currentTime = hours * 60 + minutes;
                
                if (previousTime !== null && currentTime <= previousTime) {
                    console.warn(`⚠️ NON-CHRONOLOGICAL: Message ${i} (${timeText}) is not after message ${i-1}`);
                    isChronological = false;
                    
                    const fixedMinutes = previousTime + 3;
                    const fixedHours = Math.floor(fixedMinutes / 60) % 24;
                    const fixedMins = fixedMinutes % 60;
                    const fixedAmPm = fixedHours >= 12 ? 'PM' : 'AM';
                    const displayHours = fixedHours % 12 || 12;
                    const displayMins = fixedMins.toString().padStart(2, '0');
                    
                    if (this._safeSetTextContent(ts, `${displayHours}:${displayMins} ${fixedAmPm}`)) {
                        fixedCount++;
                        console.log(`   Fixed to: ${ts.textContent}`);
                    }
                } else {
                    previousTime = currentTime;
                }
            } catch (e) {
                console.warn(`Error parsing timestamp at index ${i}:`, e);
            }
        });
        
        if (isChronological) {
            console.log('✅ All timestamps are in chronological order');
        } else {
            console.log(`🔧 Fixed ${fixedCount} non-chronological timestamps`);
        }
        
        return isChronological;
    }
    
    /**
     * Initialize image viewer
     */
    initImageViewer() {
        const images = document.querySelectorAll('.chat-image');
        const imageViewer = document.getElementById('imageViewer');
        const viewedImage = document.getElementById('viewedImage');
        const closeViewer = document.getElementById('closeViewer');
        const imageCounter = document.getElementById('imageCounter');
        
        if (!imageViewer || !viewedImage || !closeViewer) {
            console.error('❌ Image viewer elements not found');
            return;
        }
        
        this._setPrivate('images', Array.from(images));
        
        images.forEach((img, index) => {
            img.addEventListener('click', async (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                const fullImagePath = img.dataset.fullPath || img.src;
                
                if (!SecurityUtils.isValidImageUrl(fullImagePath)) {
                    console.error('Invalid image path:', fullImagePath);
                    return;
                }
                
                viewedImage.src = '';
                viewedImage.style.opacity = '0';
                
                try {
                    let imageSrc = fullImagePath;
                    
                    if (SecurityUtils.isLocalPath(fullImagePath)) {
                        const preloaded = this._getPrivate('preloadedImages');
                        if (preloaded && preloaded.has(fullImagePath)) {
                            imageSrc = preloaded.get(fullImagePath);
                        }
                        
                        if (!imageSrc.includes('?')) {
                            imageSrc = imageSrc + '?t=' + Date.now();
                        }
                    }
                    
                    await SecurityUtils.preloadImage(imageSrc);
                    
                    viewedImage.src = imageSrc;
                    viewedImage.alt = img.alt;
                    viewedImage.style.opacity = '1';
                    viewedImage.style.maxWidth = '95%';
                    viewedImage.style.maxHeight = '95%';
                    viewedImage.style.width = 'auto';
                    viewedImage.style.height = 'auto';
                    viewedImage.style.objectFit = 'contain';
                    
                } catch (error) {
                    console.error('Failed to load full-size image:', error);
                    viewedImage.src = SecurityUtils.createFallbackImage(img.alt + ' (Full size)');
                    viewedImage.style.opacity = '1';
                }
                
                const totalImages = this._getPrivate('images').length;
                if (imageCounter) {
                    imageCounter.textContent = `${index + 1} / ${totalImages}`;
                }
                
                imageViewer.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });
        
        closeViewer.addEventListener('click', () => {
            imageViewer.classList.remove('active');
            document.body.style.overflow = '';
            viewedImage.src = '';
        });
        
        imageViewer.addEventListener('click', (e) => {
            if (e.target === imageViewer) {
                imageViewer.classList.remove('active');
                document.body.style.overflow = '';
                viewedImage.src = '';
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && imageViewer.classList.contains('active')) {
                imageViewer.classList.remove('active');
                document.body.style.overflow = '';
                viewedImage.src = '';
            }
        });
    }
    
    /**
     * Show the next message in sequence
     */
    showNextMessage() {
        try {
            let elements = this._getPrivate('elements');
            let currentMessageIndex = this._getPrivate('currentMessageIndex');
            
            if (!elements || !Array.isArray(elements) || elements.length === 0) {
                return;
            }
            
            if (currentMessageIndex >= elements.length) {
                return;
            }
            
            const element = elements[currentMessageIndex];
            
            if (!(element instanceof HTMLElement)) {
                this._setPrivate('currentMessageIndex', currentMessageIndex + 1);
                return;
            }
            
            element.classList.add('show');
            
            setTimeout(() => {
                try {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest'
                    });
                } catch (scrollError) {}
            }, this.CONFIG.ANIMATION_DELAY);
            
            this._setPrivate('currentMessageIndex', currentMessageIndex + 1);
        } catch (error) {}
    }
    
    /**
     * Handle user interactions
     */
    handleInteraction(event) {
        if (event.target.closest('.chat-image')) return;
        
        const imageViewer = document.getElementById('imageViewer');
        if (imageViewer && imageViewer.classList.contains('active')) return;
        
        if (this._getPrivate('interactionCooldown')) {
            event.preventDefault();
            return;
        }
        
        if (this._getPrivate('isScrolling')) return;
        
        this._setPrivate('interactionCooldown', true);
        setTimeout(() => {
            this._setPrivate('interactionCooldown', false);
        }, 100);
        
        this.showNextMessage();
    }
    
    /**
     * Touch handlers
     */
    handleTouchStart(event) {
        if (event.touches.length === 1) {
            this._setPrivate('touchStartY', event.touches[0].clientY);
            this._setPrivate('isScrolling', false);
        }
    }
    
    handleTouchMove(event) {
        if (event.touches.length === 1) {
            const touchStartY = this._getPrivate('touchStartY');
            const currentY = event.touches[0].clientY;
            const deltaY = Math.abs(currentY - touchStartY);
            
            if (deltaY > this.CONFIG.SCROLL_THRESHOLD) {
                this._setPrivate('isScrolling', true);
            }
        }
    }
    
    handleTouchEnd(event) {
        setTimeout(() => {
            this._setPrivate('isScrolling', false);
        }, 100);
    }
    
    /**
     * Initialize the application
     */
    init() {
        if (this._getPrivate('initialized')) {
            console.warn('ChatDemo already initialized');
            return;
        }

        try {
            console.log('🚀 Initializing ChatDemo with LINEAR timestamps...');
            
            this.initChatUI();
            
            const elements = Array.from(document.querySelectorAll('.bubble'));
            if (elements.length === 0) {
                console.error('❌ No bubble elements found');
                return;
            }
            
            this._setPrivate('elements', elements);
            
            this.updateTimestamps();
            
            setTimeout(() => {
                this.initImageViewer();
            }, 200);
            
            this.boundHandleInteraction = this.handleInteraction.bind(this);
            this.boundHandleTouchStart = this.handleTouchStart.bind(this);
            this.boundHandleTouchMove = this.handleTouchMove.bind(this);
            this.boundHandleTouchEnd = this.handleTouchEnd.bind(this);
            
            document.addEventListener('click', this.boundHandleInteraction);
            document.addEventListener('touchend', this.boundHandleInteraction);
            document.addEventListener('touchstart', this.boundHandleTouchStart, { passive: false });
            document.addEventListener('touchmove', this.boundHandleTouchMove, { passive: false });
            document.addEventListener('touchend', this.boundHandleTouchEnd);
            
            document.addEventListener('keydown', (e) => {
                const isEditable = e.target.isContentEditable || 
                                  e.target.tagName === 'INPUT' || 
                                  e.target.tagName === 'TEXTAREA';
                
                if (!isEditable && (e.code === 'Space' || e.code === 'Enter')) {
                    e.preventDefault();
                    this.showNextMessage();
                }
            });

            this._setPrivate('initialized', true);
            console.log('✅ ChatDemo initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize ChatDemo:', error);
        }
    }
    
    /**
     * Clean up resources
     */
    cleanup() {
        try {
            document.removeEventListener('click', this.boundHandleInteraction);
            document.removeEventListener('touchend', this.boundHandleInteraction);
            document.removeEventListener('touchstart', this.boundHandleTouchStart);
            document.removeEventListener('touchmove', this.boundHandleTouchMove);
            document.removeEventListener('touchend', this.boundHandleTouchEnd);
            this._private.delete(this);
            console.log('🧹 ChatDemo cleaned up');
        } catch (error) {}
    }
}

// Export for module use if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatDemo;
}