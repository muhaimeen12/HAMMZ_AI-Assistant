// AI Assistant Application
class AIAssistant {
    constructor() {
        this.conversations = [];
        this.currentConversationId = null;
        this.settings = {
            theme: 'dark',
            fontSize: 'medium',
            autoSave: true,
            showTypingIndicator: true,
            streamResponse: true,
            maxTokens: 2000,
            temperature: 0.7,
            openaiKey: '',
            geminiKey: ''
        };
        this.currentModel = 'openai-gpt4';
        this.isTyping = false;
        
        this.aiProviders = {
            'openai-gpt4': {
                name: 'OpenAI GPT-4',
                apiEndpoint: 'https://api.openai.com/v1/chat/completions',
                model: 'gpt-4',
                description: 'Most capable OpenAI model for complex tasks'
            },
            'openai-gpt35': {
                name: 'OpenAI GPT-3.5',
                apiEndpoint: 'https://api.openai.com/v1/chat/completions',
                model: 'gpt-3.5-turbo',
                description: 'Fast and efficient for most tasks'
            },
            'gemini-pro': {
                name: 'Google Gemini Pro',
                apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
                model: 'gemini-pro',
                description: 'Google\'s latest AI model with multimodal capabilities'
            }
        };

        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
                this.loadSettings();
                this.applyTheme();
                this.createWelcomeConversation();
                this.updateUI();
            });
        } else {
            this.setupEventListeners();
            this.loadSettings();
            this.applyTheme();
            this.createWelcomeConversation();
            this.updateUI();
        }
    }

    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('aiAssistantSettings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
        } catch (error) {
            console.warn('Could not load settings:', error);
        }
    }

    saveSettingsToStorage() {
        try {
            localStorage.setItem('aiAssistantSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Could not save settings:', error);
        }
    }

    setupEventListeners() {
        // Sidebar
        const sidebarToggle = document.getElementById('sidebarToggle');
        const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
        const newChatBtn = document.getElementById('newChatBtn');
        
        if (sidebarToggle) sidebarToggle.addEventListener('click', () => this.closeSidebar());
        if (mobileSidebarToggle) mobileSidebarToggle.addEventListener('click', () => this.toggleSidebar());
        if (newChatBtn) newChatBtn.addEventListener('click', () => this.createNewChat());
        
        // Chat input
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        if (messageInput) {
            messageInput.addEventListener('keydown', (e) => this.handleInputKeydown(e));
            messageInput.addEventListener('input', () => this.autoResizeTextarea());
        }
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        // Model selector
        const modelSelect = document.getElementById('modelSelect');
        if (modelSelect) {
            modelSelect.addEventListener('change', (e) => {
                this.currentModel = e.target.value;
                this.updateModelInfo();
            });
        }
        
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Settings modal
        const settingsBtn = document.getElementById('settingsBtn');
        const closeSettingsModal = document.getElementById('closeSettingsModal');
        const settingsOverlay = document.getElementById('settingsOverlay');
        const cancelSettings = document.getElementById('cancelSettings');
        const saveSettings = document.getElementById('saveSettings');
        
        if (settingsBtn) settingsBtn.addEventListener('click', () => this.openSettingsModal());
        if (closeSettingsModal) closeSettingsModal.addEventListener('click', () => this.closeSettingsModal());
        if (settingsOverlay) settingsOverlay.addEventListener('click', () => this.closeSettingsModal());
        if (cancelSettings) cancelSettings.addEventListener('click', () => this.closeSettingsModal());
        if (saveSettings) saveSettings.addEventListener('click', () => this.saveSettings());
        
        // Settings controls
        const maxTokens = document.getElementById('maxTokens');
        const temperature = document.getElementById('temperature');
        
        if (maxTokens) {
            maxTokens.addEventListener('input', (e) => {
                const maxTokensValue = document.getElementById('maxTokensValue');
                if (maxTokensValue) maxTokensValue.textContent = e.target.value;
            });
        }
        
        if (temperature) {
            temperature.addEventListener('input', (e) => {
                const temperatureValue = document.getElementById('temperatureValue');
                if (temperatureValue) temperatureValue.textContent = e.target.value;
            });
        }
        
        // Export
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportConversation());
        }
        
        // Hosting info
        const hostingInfoBtn = document.getElementById('hostingInfoBtn');
        const closeHostingModal = document.getElementById('closeHostingModal');
        const hostingOverlay = document.getElementById('hostingOverlay');
        const closeHostingInfo = document.getElementById('closeHostingInfo');
        
        if (hostingInfoBtn) hostingInfoBtn.addEventListener('click', () => this.openHostingModal());
        if (closeHostingModal) closeHostingModal.addEventListener('click', () => this.closeHostingModal());
        if (hostingOverlay) hostingOverlay.addEventListener('click', () => this.closeHostingModal());
        if (closeHostingInfo) closeHostingInfo.addEventListener('click', () => this.closeHostingModal());
        
        // Handle clicks outside sidebar on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                const sidebar = document.getElementById('sidebar');
                const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
                
                if (sidebar && mobileSidebarToggle && 
                    !sidebar.contains(e.target) && 
                    !mobileSidebarToggle.contains(e.target)) {
                    this.closeSidebar();
                }
            }
        });
    }

    createWelcomeConversation() {
        const welcomeConversation = {
            id: 'welcome-' + Date.now(),
            title: 'Getting Started',
            messages: [
                {
                    role: 'assistant',
                    content: 'Hello! I\'m your AI assistant. I can help you with a wide variety of tasks including:\n\n• Answering questions and providing information\n• Writing and editing content\n• Coding and technical support\n• Creative tasks like brainstorming\n• Analysis and problem-solving\n\nTo get started, you\'ll need to configure your API keys in the settings (⚙️ button). Once configured, just type your question or request in the chat box below.\n\nYou can switch between different AI models using the dropdown menu and customize your experience in settings.\n\nWhat would you like to know or work on today?',
                    timestamp: new Date().toISOString()
                }
            ],
            createdAt: new Date().toISOString()
        };
        
        this.conversations.push(welcomeConversation);
        this.currentConversationId = welcomeConversation.id;
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('open');
        }
    }

    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('open');
        }
    }

    createNewChat() {
        const newConversation = {
            id: 'chat-' + Date.now(),
            title: 'New Chat',
            messages: [],
            createdAt: new Date().toISOString()
        };
        
        this.conversations.unshift(newConversation);
        this.currentConversationId = newConversation.id;
        this.updateUI();
        this.closeSidebar();
    }

    getCurrentConversation() {
        return this.conversations.find(conv => conv.id === this.currentConversationId);
    }

    handleInputKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    autoResizeTextarea() {
        const textarea = document.getElementById('messageInput');
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
            this.updateTokenCount();
        }
    }

    updateTokenCount() {
        const messageInput = document.getElementById('messageInput');
        const tokenCountEl = document.getElementById('tokenCount');
        if (messageInput && tokenCountEl) {
            const tokenCount = this.estimateTokens(messageInput.value);
            tokenCountEl.textContent = `${tokenCount} tokens`;
        }
    }

    estimateTokens(text) {
        // Rough estimation: ~4 characters per token
        return Math.ceil(text.length / 4);
    }

    async sendMessage() {
        const messageInput = document.getElementById('messageInput');
        if (!messageInput) return;
        
        const message = messageInput.value.trim();
        
        if (!message || this.isTyping) return;
        
        // Check if API key is configured
        const needsOpenAI = this.currentModel.startsWith('openai');
        const needsGemini = this.currentModel === 'gemini-pro';
        
        if ((needsOpenAI && !this.settings.openaiKey) || (needsGemini && !this.settings.geminiKey)) {
            this.showNotification('Please configure your API key in settings first!', 'error');
            this.openSettingsModal();
            return;
        }
        
        const currentConversation = this.getCurrentConversation();
        if (!currentConversation) return;

        // Add user message
        const userMessage = {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        };
        
        currentConversation.messages.push(userMessage);
        
        // Update conversation title if it's the first user message
        if (currentConversation.messages.filter(m => m.role === 'user').length === 1) {
            currentConversation.title = message.length > 30 ? message.substring(0, 30) + '...' : message;
        }
        
        // Clear input and update UI
        messageInput.value = '';
        messageInput.style.height = 'auto';
        this.updateUI();
        this.updateTokenCount();
        
        // Disable send button and show typing indicator
        this.isTyping = true;
        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn) sendBtn.disabled = true;
        
        if (this.settings.showTypingIndicator) {
            const typingIndicator = document.getElementById('typingIndicator');
            if (typingIndicator) typingIndicator.classList.remove('hidden');
        }
        
        try {
            const aiResponse = await this.getAIResponse(currentConversation.messages);
            
            // Add AI response
            const assistantMessage = {
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date().toISOString()
            };
            
            currentConversation.messages.push(assistantMessage);
            
            if (this.settings.streamResponse) {
                await this.streamMessage(aiResponse);
            } else {
                this.updateUI();
            }
            
        } catch (error) {
            console.error('Error getting AI response:', error);
            
            const errorMessage = {
                role: 'assistant',
                content: `I apologize, but I encountered an error: ${error.message}\n\nPlease check your API key configuration in settings and try again.`,
                timestamp: new Date().toISOString()
            };
            
            currentConversation.messages.push(errorMessage);
            this.updateUI();
            this.showNotification('Error getting AI response. Check your API key.', 'error');
        } finally {
            // Re-enable send button and hide typing indicator
            this.isTyping = false;
            if (sendBtn) sendBtn.disabled = false;
            const typingIndicator = document.getElementById('typingIndicator');
            if (typingIndicator) typingIndicator.classList.add('hidden');
        }
    }

    async getAIResponse(messages) {
        const provider = this.aiProviders[this.currentModel];
        
        if (this.currentModel.startsWith('openai')) {
            return await this.callOpenAI(messages, provider);
        } else if (this.currentModel === 'gemini-pro') {
            return await this.callGemini(messages, provider);
        }
        
        throw new Error('Unsupported AI model');
    }

    async callOpenAI(messages, provider) {
        if (!this.settings.openaiKey) {
            throw new Error('OpenAI API key not configured. Please add your API key in settings.');
        }

        const response = await fetch(provider.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.settings.openaiKey}`
            },
            body: JSON.stringify({
                model: provider.model,
                messages: messages.map(m => ({ role: m.role, content: m.content })),
                max_tokens: this.settings.maxTokens,
                temperature: this.settings.temperature
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'OpenAI API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    async callGemini(messages, provider) {
        if (!this.settings.geminiKey) {
            throw new Error('Google Gemini API key not configured. Please add your API key in settings.');
        }

        // Convert messages to Gemini format
        const contents = messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const response = await fetch(`${provider.apiEndpoint}?key=${this.settings.geminiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: contents,
                generationConfig: {
                    maxOutputTokens: this.settings.maxTokens,
                    temperature: this.settings.temperature
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Gemini API request failed');
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    async streamMessage(content) {
        // Simulate streaming effect
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageElement = this.createMessageElement('assistant', '', new Date().toISOString());
        chatMessages.appendChild(messageElement);
        
        const messageContent = messageElement.querySelector('.message-bubble');
        let displayedContent = '';
        
        for (let i = 0; i < content.length; i++) {
            displayedContent += content[i];
            if (messageContent) messageContent.innerHTML = this.formatMessage(displayedContent);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Random delay between 10-50ms for realistic typing effect
            await new Promise(resolve => setTimeout(resolve, Math.random() * 40 + 10));
        }
        
        this.updateConversationList();
    }

    createMessageElement(role, content, timestamp) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const timeStr = new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                ${role === 'user' ? 'U' : 'AI'}
            </div>
            <div class="message-content">
                <div class="message-bubble">${this.formatMessage(content)}</div>
                <div class="message-time">${timeStr}</div>
            </div>
        `;
        
        return messageDiv;
    }

    formatMessage(content) {
        // Simple formatting for code blocks and line breaks
        return content
            .replace(/\n/g, '<br>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/```([^```]+)```/g, '<pre><code>$1</code></pre>');
    }

    updateUI() {
        this.updateChatMessages();
        this.updateConversationList();
        this.updateModelInfo();
    }

    updateChatMessages() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const currentConversation = this.getCurrentConversation();
        
        if (!currentConversation) {
            chatMessages.innerHTML = '<div class="welcome-message"><div class="welcome-content"><h1>No conversation selected</h1></div></div>';
            return;
        }
        
        // Clear existing messages
        chatMessages.innerHTML = '';
        
        // Show welcome message if no messages
        if (currentConversation.messages.length === 0) {
            chatMessages.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-content">
                        <h1>Welcome to AI Assistant</h1>
                        <p>Your personal AI helper powered by multiple AI models. Configure your API keys in settings to get started!</p>
                        <div class="feature-list">
                            <div class="feature-item">💬 Real-time conversations</div>
                            <div class="feature-item">🤖 Multiple AI models</div>
                            <div class="feature-item">🎨 Customizable themes</div>
                            <div class="feature-item">📱 Mobile responsive</div>
                        </div>
                    </div>
                </div>
            `;
            return;
        }
        
        // Add all messages
        currentConversation.messages.forEach(message => {
            const messageElement = this.createMessageElement(
                message.role, 
                message.content, 
                message.timestamp
            );
            chatMessages.appendChild(messageElement);
        });
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    updateConversationList() {
        const conversationList = document.getElementById('conversationList');
        if (!conversationList) return;
        
        conversationList.innerHTML = '';
        
        this.conversations.forEach(conversation => {
            const conversationDiv = document.createElement('div');
            conversationDiv.className = `conversation-item ${conversation.id === this.currentConversationId ? 'active' : ''}`;
            
            const timeStr = new Date(conversation.createdAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric'
            });
            
            conversationDiv.innerHTML = `
                <span class="conversation-title">${conversation.title}</span>
                <span class="conversation-time">${timeStr}</span>
            `;
            
            conversationDiv.addEventListener('click', () => {
                this.currentConversationId = conversation.id;
                this.updateUI();
                this.closeSidebar();
            });
            
            conversationList.appendChild(conversationDiv);
        });
    }

    updateModelInfo() {
        const provider = this.aiProviders[this.currentModel];
        const currentModelEl = document.getElementById('currentModel');
        if (currentModelEl && provider) {
            currentModelEl.textContent = provider.name.replace('OpenAI ', '').replace('Google ', '');
        }
    }

    toggleTheme() {
        this.settings.theme = this.settings.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
        this.saveSettingsToStorage();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-color-scheme', this.settings.theme);
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.textContent = this.settings.theme === 'dark' ? '☀️' : '🌙';
        }
    }

    openSettingsModal() {
        const settingsModal = document.getElementById('settingsModal');
        if (!settingsModal) return;
        
        // Load current settings into modal
        const openaiKey = document.getElementById('openaiKey');
        const geminiKey = document.getElementById('geminiKey');
        const maxTokens = document.getElementById('maxTokens');
        const temperature = document.getElementById('temperature');
        const streamResponse = document.getElementById('streamResponse');
        const showTypingIndicator = document.getElementById('showTypingIndicator');
        
        if (openaiKey) openaiKey.value = this.settings.openaiKey;
        if (geminiKey) geminiKey.value = this.settings.geminiKey;
        if (maxTokens) maxTokens.value = this.settings.maxTokens;
        if (temperature) temperature.value = this.settings.temperature;
        if (streamResponse) streamResponse.checked = this.settings.streamResponse;
        if (showTypingIndicator) showTypingIndicator.checked = this.settings.showTypingIndicator;
        
        // Update display values
        const maxTokensValue = document.getElementById('maxTokensValue');
        const temperatureValue = document.getElementById('temperatureValue');
        if (maxTokensValue) maxTokensValue.textContent = this.settings.maxTokens;
        if (temperatureValue) temperatureValue.textContent = this.settings.temperature;
        
        settingsModal.classList.remove('hidden');
    }

    closeSettingsModal() {
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            settingsModal.classList.add('hidden');
        }
    }

    saveSettings() {
        const openaiKey = document.getElementById('openaiKey');
        const geminiKey = document.getElementById('geminiKey');
        const maxTokens = document.getElementById('maxTokens');
        const temperature = document.getElementById('temperature');
        const streamResponse = document.getElementById('streamResponse');
        const showTypingIndicator = document.getElementById('showTypingIndicator');
        
        if (openaiKey) this.settings.openaiKey = openaiKey.value;
        if (geminiKey) this.settings.geminiKey = geminiKey.value;
        if (maxTokens) this.settings.maxTokens = parseInt(maxTokens.value);
        if (temperature) this.settings.temperature = parseFloat(temperature.value);
        if (streamResponse) this.settings.streamResponse = streamResponse.checked;
        if (showTypingIndicator) this.settings.showTypingIndicator = showTypingIndicator.checked;
        
        this.saveSettingsToStorage();
        this.closeSettingsModal();
        
        // Show success message
        this.showNotification('Settings saved successfully!', 'success');
    }

    exportConversation() {
        const currentConversation = this.getCurrentConversation();
        if (!currentConversation || currentConversation.messages.length === 0) {
            this.showNotification('No conversation to export', 'warning');
            return;
        }
        
        const exportData = {
            title: currentConversation.title,
            createdAt: currentConversation.createdAt,
            messages: currentConversation.messages.map(msg => ({
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp
            }))
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `${currentConversation.title.replace(/[^a-z0-9]/gi, '_')}_conversation.json`;
        link.click();
        
        this.showNotification('Conversation exported successfully!', 'success');
    }

    openHostingModal() {
        const hostingModal = document.getElementById('hostingModal');
        if (hostingModal) {
            hostingModal.classList.remove('hidden');
        }
    }

    closeHostingModal() {
        const hostingModal = document.getElementById('hostingModal');
        if (hostingModal) {
            hostingModal.classList.add('hidden');
        }
    }

    showNotification(message, type = 'success') {
        // Simple notification system
        const notification = document.createElement('div');
        const bgColor = type === 'error' ? 'var(--color-error)' : 
                       type === 'warning' ? 'var(--color-warning)' : 
                       'var(--color-success)';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: var(--color-btn-primary-text);
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 3000;
            opacity: 0;
            transition: opacity 300ms ease;
            max-width: 300px;
            box-shadow: var(--shadow-lg);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.style.opacity = '1', 10);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AIAssistant();
});

// Fallback initialization in case DOMContentLoaded already fired
if (document.readyState !== 'loading') {
    new AIAssistant();
}