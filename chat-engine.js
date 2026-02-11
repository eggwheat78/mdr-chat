// Chat Demo Application with dynamic timestamp logic
class ChatDemo {
    constructor(chatContent) {
        this.chatContent = chatContent;
        
        // Security: Use Object.freeze for immutable configurations
        this.CONFIG = Object.freeze({
            MAX_MESSAGES: 100,
            MAX_TIME_OFFSET: 60,
            ANIMATION_DELAY: 50,
            MAX_MINUTES_BETWEEN: chatContent.timestampConfig.maxMinutesBetween,
            BUSINESS_HOURS_START: chatContent.timestampConfig.businessHoursStart,
            BUSINESS_HOURS_END: chatContent.timestampConfig.businessHoursEnd,
            HOURS_TO_ADD_AFTER_HOURS: chatContent.timestampConfig.hoursToAddAfterHours,
            HOURS_TO_ADD_BUSINESS_HOURS: chatContent.timestampConfig.hoursToAddBusinessHours,
            SCROLL_THRESHOLD: 10
        });

        // Security: Use WeakMap for private properties
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
            interactionCooldown: false
        });

        this.init();
    }

    /**
     * Get private property
     * @param {string} key - Property key
     * @returns {*} Property value
     */
    _getPrivate(key) {
        return this._private.get(this)[key];
    }

    /**
     * Set private property
     * @param {string} key - Property key
     * @param {*} value - Property value
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
        document.getElementById('chatAvatar').textContent = this.chatContent.header.avatar;
        document.getElementById('chatTitle').textContent = this.chatContent.header.title;
        document.getElementById('chatSubtitleText').textContent = this.chatContent.header.subtitle;
        document.getElementById('dateLabel').textContent = this.chatContent.dateLabel;
        
        // Generate chat messages
        this.generateChatMessages();
    }

    /**
     * Generate HTML for chat messages
     */
    generateChatMessages() {
        const chatContainer = document.getElementById('chatContainer');
        
        this.chatContent.messages.forEach((message, index) => {
            const bubble = document.createElement('div');
            bubble.className = `bubble message-${message.type}`;
            bubble.dataset.messageId = message.id;
            
            // Add sender label
            const senderLabel = document.createElement('div');
            senderLabel.className = 'sender-label';
            senderLabel.textContent = message.sender;
            bubble.appendChild(senderLabel);
            
            // Add message content
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            
            if (typeof message.content === 'string') {
                // Text message
                messageContent.textContent = message.content;
            } else if (message.content.type === 'image') {
                // Image message
                const imgData = message.content;
                const imageContainer = document.createElement('div');
                imageContainer.className = 'chat-image-container';
                
                const img = document.createElement('img');
                img.src = imgData.url;
                img.alt = imgData.alt;
                img.className = 'chat-image';
                img.dataset.imageId = `image-${message.id}`;
                
                if (imgData.fit === 'contain') {
                    img.classList.add('contain');
                }
                
                imageContainer.appendChild(img);
                messageContent.appendChild(imageContainer);
                
                // Add caption if exists
                if (imgData.caption) {
                    const caption = document.createElement('div');
                    caption.className = 'image-caption';
                    caption.textContent = imgData.caption;
                    messageContent.appendChild(caption);
                }
            }
            
            bubble.appendChild(messageContent);
            
            // Add timestamp placeholder
            const timestamp = document.createElement('div');
            timestamp.className = 'timestamp';
            bubble.appendChild(timestamp);
            
            chatContainer.appendChild(bubble);
        });
    }

    /**
     * Generate base time based on current client time
     * @returns {Date} Base time for the conversation
     */
    generateBaseTime() {
        const now = new Date();
        const baseTime = new Date(now);
        const currentHour = now.getHours();
        
        // Check if current time is between 9 AM and 6 PM
        const isBusinessHours = currentHour >= this.CONFIG.BUSINESS_HOURS_START && 
                               currentHour < this.CONFIG.BUSINESS_HOURS_END;
        
        if (isBusinessHours) {
            // During business hours: add 12 hours (shifts to evening/night)
            baseTime.setHours(currentHour + this.CONFIG.HOURS_TO_ADD_BUSINESS_HOURS);
        } else {
            // Outside business hours: add 7 hours
            baseTime.setHours(currentHour + this.CONFIG.HOURS_TO_ADD_AFTER_HOURS);
        }
        
        // The Date object automatically handles day rollover when hours exceed 24
        return baseTime;
    }

    /**
     * Generate random time offsets for messages (1-7 minutes between messages)
     * @returns {Array} Array of cumulative time offsets in minutes
     */
    generateRandomTimeOffsets() {
        const messageCount = this.chatContent.messages.length;
        const offsets = [0]; // First message at offset 0
        let cumulativeOffset = 0;
        
        for (let i = 1; i < messageCount; i++) {
            const interval = Math.floor(Math.random() * this.CONFIG.MAX_MINUTES_BETWEEN) + 1;
            cumulativeOffset += interval;
            offsets.push(cumulativeOffset);
        }
        
        return Object.freeze(offsets);
    }

    /**
     * Format time to 12-hour format with AM/PM
     * @param {Date} date - Date object to format
     * @returns {string} Formatted time string
     */
    formatTime(date) {
        // Security: Validate input is a Date object
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            console.error('Invalid date provided to formatTime');
            return '--:--';
        }

        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        
        // Security: Use template literal with proper escaping
        return `${hours}:${minutes} ${ampm}`;
    }
    
    /**
     * Update all timestamp elements with dynamic after-hours times
     */
    updateTimestamps() {
        const timestamps = document.querySelectorAll('.timestamp');
        
        // Security: Limit number of elements processed
        if (timestamps.length > this.CONFIG.MAX_MESSAGES) {
            console.error('Too many timestamp elements');
            return;
        }

        // Generate base time based on client's current time
        const baseTime = this.generateBaseTime();
        this._setPrivate('baseTime', baseTime);
        
        // Generate random time offsets
        const timeOffsets = this.generateRandomTimeOffsets();
        this._setPrivate('timeOffsets', timeOffsets);
        
        timestamps.forEach((timestamp, i) => {
            try {
                if (i < timeOffsets.length) {
                    const offset = timeOffsets[i];
                    
                    // Security: Validate offset
                    if (!SecurityUtils.isValidTimeOffset(offset)) {
                        console.error('Invalid time offset detected');
                        return;
                    }

                    const messageTime = new Date(baseTime);
                    messageTime.setMinutes(baseTime.getMinutes() + offset);
                    
                    // Security: Sanitize output
                    const safeTime = SecurityUtils.sanitizeHTML(this.formatTime(messageTime));
                    timestamp.textContent = safeTime;
                }
            } catch (error) {
                console.error('Error updating timestamp:', error);
                timestamp.textContent = '--:--';
            }
        });
    }
    
    /**
     * Initialize image viewer functionality
     */
    initImageViewer() {
        const images = document.querySelectorAll('.chat-image');
        const imageViewer = document.getElementById('imageViewer');
        const viewedImage = document.getElementById('viewedImage');
        const closeViewer = document.getElementById('closeViewer');
        const imageCounter = document.getElementById('imageCounter');
        
        // Store all images in private property
        this._setPrivate('images', Array.from(images));
        
        // Add click event to each image
        images.forEach((img, index) => {
            img.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering chat progression
                
                // Security: Validate image URL
                if (!SecurityUtils.isValidImageUrl(img.src)) {
                    console.error('Invalid image URL');
                    return;
                }
                
                // Show image in viewer
                viewedImage.src = img.src;
                viewedImage.alt = img.alt;
                
                // Update counter
                const totalImages = this._getPrivate('images').length;
                imageCounter.textContent = `${index + 1} / ${totalImages}`;
                
                // Show viewer
                imageViewer.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            });
        });
        
        // Close viewer on button click
        closeViewer.addEventListener('click', () => {
            imageViewer.classList.remove('active');
            document.body.style.overflow = '';
            viewedImage.src = '';
        });
        
        // Close viewer on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && imageViewer.classList.contains('active')) {
                imageViewer.classList.remove('active');
                document.body.style.overflow = '';
                viewedImage.src = '';
            }
        });
        
        // Close viewer on background click
        imageViewer.addEventListener('click', (e) => {
            if (e.target === imageViewer) {
                imageViewer.classList.remove('active');
                document.body.style.overflow = '';
                viewedImage.src = '';
            }
        });
        
        // Add keyboard navigation for images
        document.addEventListener('keydown', (e) => {
            if (!imageViewer.classList.contains('active')) return;
            
            const images = this._getPrivate('images');
            const currentSrc = viewedImage.src;
            const currentIndex = images.findIndex(img => img.src === currentSrc);
            
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                // Previous image
                viewedImage.src = images[currentIndex - 1].src;
                viewedImage.alt = images[currentIndex - 1].alt;
                imageCounter.textContent = `${currentIndex} / ${images.length}`;
            } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
                // Next image
                viewedImage.src = images[currentIndex + 1].src;
                viewedImage.alt = images[currentIndex + 1].alt;
                imageCounter.textContent = `${currentIndex + 2} / ${images.length}`;
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
            
            // Security: Validate indices and elements
            if (!elements || !Array.isArray(elements) || elements.length === 0) {
                console.error('Invalid elements array');
                return;
            }
            
            if (currentMessageIndex >= elements.length) {
                return; // All messages already shown
            }
            
            const element = elements[currentMessageIndex];
            
            // Security: Verify element is a DOM element
            if (!(element instanceof HTMLElement)) {
                console.error('Invalid element encountered');
                this._setPrivate('currentMessageIndex', currentMessageIndex + 1);
                return;
            }
            
            // Show current message
            element.classList.add('show');
            
            // Scroll to the new message with error handling
            setTimeout(() => {
                try {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest'
                    });
                } catch (scrollError) {
                    console.error('Error scrolling to element:', scrollError);
                }
            }, this.CONFIG.ANIMATION_DELAY);
            
            this._setPrivate('currentMessageIndex', currentMessageIndex + 1);
        } catch (error) {
            console.error('Error in showNextMessage:', error);
        }
    }
    
    /**
     * Handle user interactions (clicks, taps, keyboard)
     * @param {Event} event - The DOM event
     */
    handleInteraction(event) {
        // Don't trigger if clicking on an image (image viewer handles this)
        if (event.target.closest('.chat-image')) {
            return;
        }
        
        // Don't trigger if image viewer is active
        if (document.getElementById('imageViewer').classList.contains('active')) {
            return;
        }
        
        // Security: Prevent multiple rapid clicks
        if (this._getPrivate('interactionCooldown')) {
            event.preventDefault();
            return;
        }
        
        // Don't trigger if user is currently scrolling
        if (this._getPrivate('isScrolling')) {
            return;
        }
        
        // Security: Validate event target
        if (!event.target || !(event.target instanceof Node)) {
            return;
        }
        
        // Security: Set cooldown to prevent rapid fire
        this._setPrivate('interactionCooldown', true);
        setTimeout(() => {
            this._setPrivate('interactionCooldown', false);
        }, 100);
        
        try {
            this.showNextMessage();
        } catch (error) {
            console.error('Error handling interaction:', error);
        }
    }
    
    /**
     * Handle touch start to detect scrolling
     * @param {TouchEvent} event - Touch event
     */
    handleTouchStart(event) {
        // Record the initial touch position
        if (event.touches.length === 1) {
            this._setPrivate('touchStartY', event.touches[0].clientY);
            this._setPrivate('isScrolling', false);
        }
    }
    
    /**
     * Handle touch move to detect scrolling
     * @param {TouchEvent} event - Touch event
     */
    handleTouchMove(event) {
        if (event.touches.length === 1) {
            const touchStartY = this._getPrivate('touchStartY');
            const currentY = event.touches[0].clientY;
            const deltaY = Math.abs(currentY - touchStartY);
            
            // If vertical movement exceeds threshold, it's a scroll
            if (deltaY > this.CONFIG.SCROLL_THRESHOLD) {
                this._setPrivate('isScrolling', true);
            }
        }
    }
    
    /**
     * Handle touch end
     * @param {TouchEvent} event - Touch event
     */
    handleTouchEnd(event) {
        // Reset scrolling state after a short delay
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
            // First initialize the UI with content
            this.initChatUI();
            
            // Then get references to the generated elements
            const elements = Array.from(document.querySelectorAll('.bubble'));
            
            // Security: Limit number of elements
            if (elements.length > this.CONFIG.MAX_MESSAGES) {
                console.error('Too many message elements');
                return;
            }
            
            this._setPrivate('elements', elements);
            this.updateTimestamps();
            this.initImageViewer();
            
            // Security: Bind event handlers with proper context
            const boundHandleInteraction = this.handleInteraction.bind(this);
            const boundHandleTouchStart = this.handleTouchStart.bind(this);
            const boundHandleTouchMove = this.handleTouchMove.bind(this);
            const boundHandleTouchEnd = this.handleTouchEnd.bind(this);
            
            // Add event listeners with error handling
            const addEventListenerSafe = (element, event, handler) => {
                try {
                    element.addEventListener(event, handler, { passive: event !== 'touchstart' });
                } catch (error) {
                    console.error(`Error adding ${event} listener:`, error);
                }
            };
            
            // Only use click event for desktop
            addEventListenerSafe(document, 'click', boundHandleInteraction);
            
            // For touch devices, use touchend instead of touchstart to allow scrolling
            addEventListenerSafe(document, 'touchend', boundHandleInteraction);
            
            // Add touch event listeners for scroll detection
            addEventListenerSafe(document, 'touchstart', boundHandleTouchStart);
            addEventListenerSafe(document, 'touchmove', boundHandleTouchMove);
            addEventListenerSafe(document, 'touchend', boundHandleTouchEnd);
            
            // Keyboard support
            addEventListenerSafe(document, 'keydown', (e) => {
                // Security: Check if target is editable element
                const isEditable = e.target.isContentEditable || 
                                  e.target.tagName === 'INPUT' || 
                                  e.target.tagName === 'TEXTAREA';
                
                if (!isEditable && (e.code === 'Space' || e.code === 'Enter')) {
                    e.preventDefault();
                    this.showNextMessage();
                }
            });

            this._setPrivate('initialized', true);
            
            // Security: Clean up references on page unload
            window.addEventListener('beforeunload', () => {
                this.cleanup();
            });
            
        } catch (error) {
            console.error('Failed to initialize ChatDemo:', error);
        }
    }
    
    /**
     * Clean up resources
     */
    cleanup() {
        try {
            // Remove event listeners
            document.removeEventListener('click', this.handleInteraction);
            document.removeEventListener('touchend', this.handleInteraction);
            document.removeEventListener('touchstart', this.handleTouchStart);
            document.removeEventListener('touchmove', this.handleTouchMove);
            document.removeEventListener('touchend', this.handleTouchEnd);
            document.removeEventListener('keydown', this.handleInteraction);
            
            // Clear private data
            this._private.delete(this);
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }
}