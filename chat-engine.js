// chat-engine.js
class ChatDemo {
    constructor(chatContent) {
        this.chatContent = chatContent;
        
        this.CONFIG = Object.freeze({
            MAX_MESSAGES: 100,
            ANIMATION_DELAY: 50,
            MAX_MINUTES_BETWEEN: chatContent.timestampConfig.maxMinutesBetween,
            BUSINESS_HOURS_START: chatContent.timestampConfig.businessHoursStart,
            BUSINESS_HOURS_END: chatContent.timestampConfig.businessHoursEnd,
            HOURS_TO_ADD_AFTER_HOURS: chatContent.timestampConfig.hoursToAddAfterHours,
            HOURS_TO_ADD_BUSINESS_HOURS: chatContent.timestampConfig.hoursToAddBusinessHours,
            SCROLL_THRESHOLD: 10
        });

        // Private properties
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

    // Private property accessors
    _getPrivate(key) { return this._private.get(this)[key]; }
    _setPrivate(key, value) {
        const privateData = this._private.get(this);
        privateData[key] = value;
        this._private.set(this, privateData);
    }

    // Initialize the chat UI with content
    initChatUI() {
        // Set header information
        document.getElementById('chatAvatar').textContent = this.chatContent.header.avatar;
        document.getElementById('chatTitle').textContent = this.chatContent.header.title;
        document.getElementById('chatSubtitle').firstChild.textContent = this.chatContent.header.subtitle;
        document.getElementById('dateLabel').textContent = this.chatContent.dateLabel;
        
        // Generate chat messages
        this.generateChatMessages();
    }

    // Generate HTML for chat messages
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

    // Generate base time based on current client time
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
        
        return baseTime;
    }

    // Generate random time offsets for messages
    generateRandomTimeOffsets() {
        const messageCount = this.chatContent.messages.length;
        const offsets = [0];
        let cumulativeOffset = 0;
        
        for (let i = 1; i < messageCount; i++) {
            const interval = Math.floor(Math.random() * this.CONFIG.MAX_MINUTES_BETWEEN) + 1;
            cumulativeOffset += interval;
            offsets.push(cumulativeOffset);
        }
        
        return Object.freeze(offsets);
    }

    // Format time to 12-hour format
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

    // Update all timestamp elements
    updateTimestamps() {
        const timestamps = document.querySelectorAll('.timestamp');
        
        if (timestamps.length > this.CONFIG.MAX_MESSAGES) {
            console.error('Too many timestamp elements');
            return;
        }

        const baseTime = this.generateBaseTime();
        this._setPrivate('baseTime', baseTime);
        
        const timeOffsets = this.generateRandomTimeOffsets();
        this._setPrivate('timeOffsets', timeOffsets);
        
        timestamps.forEach((timestamp, i) => {
            try {
                if (i < timeOffsets.length) {
                    const offset = timeOffsets[i];
                    
                    if (!SecurityUtils.isValidTimeOffset(offset)) {
                        console.error('Invalid time offset detected');
                        return;
                    }

                    const messageTime = new Date(baseTime);
                    messageTime.setMinutes(baseTime.getMinutes() + offset);
                    
                    const safeTime = SecurityUtils.sanitizeHTML(this.formatTime(messageTime));
                    timestamp.textContent = safeTime;
                }
            } catch (error) {
                console.error('Error updating timestamp:', error);
                timestamp.textContent = '--:--';
            }
        });
    }

    // Initialize image viewer functionality
    initImageViewer() {
        const images = document.querySelectorAll('.chat-image');
        const imageViewer = document.getElementById('imageViewer');
        const viewedImage = document.getElementById('viewedImage');
        const closeViewer = document.getElementById('closeViewer');
        const imageCounter = document.getElementById('imageCounter');
        
        this._setPrivate('images', Array.from(images));
        
        images.forEach((img, index) => {
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                
                if (!SecurityUtils.isValidImageUrl(img.src)) {
                    console.error('Invalid image URL');
                    return;
                }
                
                viewedImage.src = img.src;
                viewedImage.alt = img.alt;
                
                const totalImages = this._getPrivate('images').length;
                imageCounter.textContent = `${index + 1} / ${totalImages}`;
                
                imageViewer.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });
        
        closeViewer.addEventListener('click', () => {
            imageViewer.classList.remove('active');
            document.body.style.overflow = '';
            viewedImage.src = '';
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && imageViewer.classList.contains('active')) {
                imageViewer.classList.remove('active');
                document.body.style.overflow = '';
                viewedImage.src = '';
            }
        });
        
        imageViewer.addEventListener('click', (e) => {
            if (e.target === imageViewer) {
                imageViewer.classList.remove('active');
                document.body.style.overflow = '';
                viewedImage.src = '';
            }
        });
    }

    // Show the next message in sequence
    showNextMessage() {
        try {
            let elements = this._getPrivate('elements');
            let currentMessageIndex = this._getPrivate('currentMessageIndex');
            
            if (!elements || !Array.isArray(elements) || elements.length === 0) {
                console.error('Invalid elements array');
                return;
            }
            
            if (currentMessageIndex >= elements.length) {
                return;
            }
            
            const element = elements[currentMessageIndex];
            
            if (!(element instanceof HTMLElement)) {
                console.error('Invalid element encountered');
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
                } catch (scrollError) {
                    console.error('Error scrolling to element:', scrollError);
                }
            }, this.CONFIG.ANIMATION_DELAY);
            
            this._setPrivate('currentMessageIndex', currentMessageIndex + 1);
        } catch (error) {
            console.error('Error in showNextMessage:', error);
        }
    }

    // Handle user interactions
    handleInteraction(event) {
        if (event.target.closest('.chat-image')) {
            return;
        }
        
        if (document.getElementById('imageViewer').classList.contains('active')) {
            return;
        }
        
        if (this._getPrivate('interactionCooldown')) {
            event.preventDefault();
            return;
        }
        
        if (this._getPrivate('isScrolling')) {
            return;
        }
        
        if (!event.target || !(event.target instanceof Node)) {
            return;
        }
        
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

    // Touch event handlers
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

    // Initialize the application
    init() {
        if (this._getPrivate('initialized')) {
            console.warn('ChatDemo already initialized');
            return;
        }

        try {
            this.initChatUI();
            
            const elements = Array.from(document.querySelectorAll('.bubble'));
            this._setPrivate('elements', elements);
            
            this.updateTimestamps();
            this.initImageViewer();
            
            const boundHandleInteraction = this.handleInteraction.bind(this);
            const boundHandleTouchStart = this.handleTouchStart.bind(this);
            const boundHandleTouchMove = this.handleTouchMove.bind(this);
            const boundHandleTouchEnd = this.handleTouchEnd.bind(this);
            
            const addEventListenerSafe = (element, event, handler) => {
                try {
                    element.addEventListener(event, handler, { passive: event !== 'touchstart' });
                } catch (error) {
                    console.error(`Error adding ${event} listener:`, error);
                }
            };
            
            addEventListenerSafe(document, 'click', boundHandleInteraction);
            addEventListenerSafe(document, 'touchend', boundHandleInteraction);
            addEventListenerSafe(document, 'touchstart', boundHandleTouchStart);
            addEventListenerSafe(document, 'touchmove', boundHandleTouchMove);
            addEventListenerSafe(document, 'touchend', boundHandleTouchEnd);
            
            addEventListenerSafe(document, 'keydown', (e) => {
                const isEditable = e.target.isContentEditable || 
                                  e.target.tagName === 'INPUT' || 
                                  e.target.tagName === 'TEXTAREA';
                
                if (!isEditable && (e.code === 'Space' || e.code === 'Enter')) {
                    e.preventDefault();
                    this.showNextMessage();
                }
            });

            this._setPrivate('initialized', true);
            
            window.addEventListener('beforeunload', () => {
                this.cleanup();
            });
            
        } catch (error) {
            console.error('Failed to initialize ChatDemo:', error);
        }
    }

    // Clean up resources
    cleanup() {
        try {
            document.removeEventListener('click', this.handleInteraction);
            document.removeEventListener('touchend', this.handleInteraction);
            document.removeEventListener('touchstart', this.handleTouchStart);
            document.removeEventListener('touchmove', this.handleTouchMove);
            document.removeEventListener('touchend', this.handleTouchEnd);
            document.removeEventListener('keydown', this.handleInteraction);
            
            this._private.delete(this);
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }
}
