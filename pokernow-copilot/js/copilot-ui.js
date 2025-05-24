/**
 * PokerNow GTO Copilot - UI Component
 * Creates and manages the copilot sidebar interface
 */

class CopilotUI {
    constructor(gtoAdvisor, parser) {
        this.advisor = gtoAdvisor;
        this.parser = parser;
        this.isVisible = true;
        this.isMinimized = false;
        this.currentAdvice = null;
        
        // Blind level configuration
        this.blindLevels = {
            smallBlind: 0.5,
            bigBlind: 1.0
        };
        
        this.ui = {
            container: null,
            header: null,
            content: null,
            advice: null,
            gameInfo: null,
            toggleButton: null,
            chatbot: null
        };
        
        this.animations = {
            fadeIn: 'copilot-fade-in 0.3s ease-out',
            slideIn: 'copilot-slide-in 0.3s ease-out',
            pulse: 'copilot-pulse 1s infinite'
        };
    }

    /**
     * Initialize and inject the copilot UI
     */
    initialize() {
        console.log('🎯 PokerNow Copilot: Initializing UI...');
        
        this.createCopilotContainer();
        this.setupEventListeners();
        this.startAdviceUpdates();
        
        console.log('🎯 PokerNow Copilot: UI active!');
    }

    /**
     * Create the main copilot container and UI elements
     */
    createCopilotContainer() {
        // Remove any existing copilot
        const existingCopilot = document.getElementById('pokernow-copilot');
        if (existingCopilot) {
            existingCopilot.remove();
        }

        // Create main container
        this.ui.container = document.createElement('div');
        this.ui.container.id = 'pokernow-copilot';
        this.ui.container.className = 'copilot-container';
        
        // Create header
        this.ui.header = document.createElement('div');
        this.ui.header.className = 'copilot-header';
        this.ui.header.innerHTML = `
            <div class="copilot-title">
                <span class="copilot-icon">🎯</span>
                <span class="copilot-title-text">GTO Copilot</span>
                <div class="copilot-status">
                    <span class="status-indicator"></span>
                    <span class="status-text">Analyzing...</span>
                </div>
            </div>
            <div class="copilot-controls">
                <button class="copilot-btn copilot-minimize" title="Minimize">−</button>
                <button class="copilot-btn copilot-close" title="Close">×</button>
            </div>
        `;

        // Create content area
        this.ui.content = document.createElement('div');
        this.ui.content.className = 'copilot-content';
        
        // Create game info section
        this.ui.gameInfo = document.createElement('div');
        this.ui.gameInfo.className = 'copilot-game-info';
        this.ui.gameInfo.innerHTML = `
            <div class="game-status">
                <div class="game-indicator">
                    <span class="game-status-dot"></span>
                    <span class="game-status-text">Waiting for game...</span>
                </div>
            </div>
            <div class="blind-controls" style="margin: 8px 0; padding: 8px; background: rgba(255, 255, 255, 0.05); border-radius: 6px;">
                <div style="color: #f39c12; font-weight: 600; margin-bottom: 6px; font-size: 12px;">💰 Blind Levels</div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <div style="flex: 1;">
                        <label style="font-size: 11px; color: #bdc3c7;">Small Blind:</label>
                        <input type="number" class="blind-input sb-input" value="0.5" min="0.01" step="0.01" 
                               style="width: 100%; padding: 4px; border: 1px solid #555; background: #333; color: white; border-radius: 4px; font-size: 11px;">
                    </div>
                    <div style="flex: 1;">
                        <label style="font-size: 11px; color: #bdc3c7;">Big Blind:</label>
                        <input type="number" class="blind-input bb-input" value="1.00" min="0.02" step="0.01"
                               style="width: 100%; padding: 4px; border: 1px solid #555; background: #333; color: white; border-radius: 4px; font-size: 11px;">
                    </div>
                    <button class="copilot-btn-secondary update-blinds" style="padding: 4px 8px; font-size: 11px; margin-top: 16px;">Update</button>
                </div>
            </div>
            <div class="hand-info" style="display: none;">
                <div class="cards-display">
                    <div class="hole-cards">
                        <span class="label">Your Cards:</span>
                        <div class="cards"></div>
                    </div>
                    <div class="board-cards">
                        <span class="label">Board:</span>
                        <div class="cards"></div>
                    </div>
                </div>
                <div class="game-stats">
                    <div class="stat">
                        <span class="stat-label">Pot:</span>
                        <span class="stat-value pot-size">$0</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">To Call:</span>
                        <span class="stat-value to-call">$0</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Stack:</span>
                        <span class="stat-value stack-size">$100</span>
                    </div>
                </div>
                <div class="position-info" style="margin-top: 8px;">
                    <div class="stat">
                        <span class="stat-label">Position:</span>
                        <span class="stat-value position-name">--</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Facing:</span>
                        <span class="stat-value facing-bet">$0</span>
                    </div>
                </div>
                <div class="stack-analysis" style="margin-top: 8px; padding: 6px; background: rgba(255, 255, 255, 0.03); border-radius: 4px;">
                    <div style="font-size: 11px; color: #95a5a6; margin-bottom: 2px;">Stack Analysis:</div>
                    <div style="font-size: 10px; color: #ecf0f1;">
                        <span class="stack-bb-ratio">-- BB</span> • 
                        <span class="stack-depth-category">--</span>
                    </div>
                </div>
                <div class="opponent-info" style="margin-top: 8px; display: none;">
                    <div class="opponent-bets-container">
                        <span class="stat-label">Opponent Bets:</span>
                        <div class="opponent-bets-list"></div>
                    </div>
                </div>
            </div>
        `;

        // Create advice section
        this.ui.advice = document.createElement('div');
        this.ui.advice.className = 'copilot-advice';
        this.ui.advice.innerHTML = `
            <div class="advice-header">
                <h3>Recommended Action</h3>
                <div class="confidence-badge">
                    <span class="confidence-level">--</span>
                    <span class="confidence-text">Confidence</span>
                </div>
            </div>
            <div class="advice-content">
                <div class="primary-action">
                    <div class="action-recommendation">
                        <span class="action-text">Waiting for hand...</span>
                        <span class="action-amount"></span>
                    </div>
                    <div class="action-reasoning">
                        Connect to a poker game to receive GTO advice
                    </div>
                </div>
                <div class="detailed-stats" style="display: none;">
                    <div class="stat-row">
                        <span class="stat-name">Hand Strength:</span>
                        <span class="stat-value hand-strength">--</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-name">Equity:</span>
                        <span class="stat-value equity">--</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-name">Outs:</span>
                        <span class="stat-value outs">--</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-name">Pot Odds:</span>
                        <span class="stat-value pot-odds">--</span>
                    </div>
                </div>
            </div>
            <div class="advice-footer">
                <button class="copilot-btn-secondary toggle-details">Show Details</button>
                <button class="copilot-btn-primary force-update">Refresh</button>
            </div>
        `;

        // --- Claude Chatbot Section ---
        this.ui.chatbot = document.createElement('div');
        this.ui.chatbot.className = 'copilot-chatbot';
        this.ui.chatbot.innerHTML = `
            <div class="chatbot-header" style="font-weight:600;color:#4CAF50;padding:8px 12px;">💬 Chat with Claude</div>
            <div class="chatbot-body" style="display:flex;flex-direction:column;height:200px;background:#1e232f;border-radius:0 0 8px 8px;padding:10px 8px 8px 8px;">
                <div class="chat-messages" style="flex:1;overflow-y:auto;margin-bottom:8px;"></div>
                <div class="chat-input-row" style="display:flex;gap:8px;">
                    <input type="text" class="chat-input" placeholder="Ask about this hand..." style="flex:1;padding:8px 12px;border-radius:6px;border:1px solid #333;background:#232b3a;color:#fff;">
                </div>
            </div>
        `;

        // Assemble the UI
        this.ui.content.appendChild(this.ui.gameInfo);
        this.ui.content.appendChild(this.ui.advice);
        this.ui.content.appendChild(this.ui.chatbot);
        this.ui.container.appendChild(this.ui.header);
        this.ui.container.appendChild(this.ui.content);

        // Inject into page
        document.body.appendChild(this.ui.container);

        // Store references to frequently used elements
        this.cacheUIElements();
        
        // Initialize blind levels
        this.initializeBlindLevels();
        
        // Show with animation
        this.ui.container.style.animation = this.animations.slideIn;
    }

    /**
     * Cache frequently used UI elements
     */
    cacheUIElements() {
        this.elements = {
            statusIndicator: this.ui.container.querySelector('.status-indicator'),
            statusText: this.ui.container.querySelector('.status-text'),
            gameStatusDot: this.ui.container.querySelector('.game-status-dot'),
            gameStatusText: this.ui.container.querySelector('.game-status-text'),
            handInfo: this.ui.container.querySelector('.hand-info'),
            holeCards: this.ui.container.querySelector('.hole-cards .cards'),
            boardCards: this.ui.container.querySelector('.board-cards .cards'),
            potSize: this.ui.container.querySelector('.pot-size'),
            toCall: this.ui.container.querySelector('.to-call'),
            stackSize: this.ui.container.querySelector('.stack-size'),
            confidenceLevel: this.ui.container.querySelector('.confidence-level'),
            confidenceBadge: this.ui.container.querySelector('.confidence-badge'),
            actionText: this.ui.container.querySelector('.action-text'),
            actionAmount: this.ui.container.querySelector('.action-amount'),
            actionReasoning: this.ui.container.querySelector('.action-reasoning'),
            detailedStats: this.ui.container.querySelector('.detailed-stats'),
            handStrength: this.ui.container.querySelector('.hand-strength'),
            equity: this.ui.container.querySelector('.equity'),
            outs: this.ui.container.querySelector('.outs'),
            potOdds: this.ui.container.querySelector('.pot-odds'),
            positionName: this.ui.container.querySelector('.position-name'),
            facingBet: this.ui.container.querySelector('.facing-bet'),
            opponentInfo: this.ui.container.querySelector('.opponent-info'),
            opponentBetsList: this.ui.container.querySelector('.opponent-bets-list'),
            // Blind control elements
            sbInput: this.ui.container.querySelector('.sb-input'),
            bbInput: this.ui.container.querySelector('.bb-input'),
            updateBlindsBtn: this.ui.container.querySelector('.update-blinds'),
            // Stack analysis elements
            stackBBRatio: this.ui.container.querySelector('.stack-bb-ratio'),
            stackDepthCategory: this.ui.container.querySelector('.stack-depth-category')
        };
    }

    /**
     * Set up event listeners for UI interactions
     */
    setupEventListeners() {
        // Header controls
        this.ui.container.querySelector('.copilot-minimize').addEventListener('click', () => {
            this.toggleMinimize();
        });

        this.ui.container.querySelector('.copilot-close').addEventListener('click', () => {
            this.hide();
        });

        // Advice controls
        this.ui.container.querySelector('.toggle-details').addEventListener('click', (e) => {
            this.toggleDetails();
        });

        this.ui.container.querySelector('.force-update').addEventListener('click', () => {
            this.forceUpdate();
        });

        // Blind level controls
        this.ui.container.querySelector('.update-blinds').addEventListener('click', () => {
            this.updateBlindLevels();
        });

        // Auto-update blinds when values change
        this.ui.container.querySelector('.sb-input').addEventListener('change', () => {
            this.updateBlindLevels();
        });

        this.ui.container.querySelector('.bb-input').addEventListener('change', () => {
            this.updateBlindLevels();
        });

        // Game state updates
        document.addEventListener('pokerGameStateUpdate', (event) => {
            this.updateGameState(event.detail);
        });

        // Draggable functionality
        this.makeDraggable();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                e.preventDefault();
                this.toggle();
            }
        });

        // --- Chatbot Logic ---
        const chatMessages = this.ui.chatbot.querySelector('.chat-messages');
        const chatInput = this.ui.chatbot.querySelector('.chat-input');

        // Send message on Enter
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });

        // Chat message logic
        const addChatMessage = (text, sender) => {
            const msgDiv = document.createElement('div');
            msgDiv.className = sender === 'user' ? 'chat-msg user' : 'chat-msg bot';
            msgDiv.style.margin = '4px 0';
            msgDiv.style.padding = '7px 12px';
            msgDiv.style.borderRadius = '12px';
            msgDiv.style.maxWidth = '80%';
            msgDiv.style.background = sender === 'user' ? '#4CAF50' : '#232b3a';
            msgDiv.style.color = sender === 'user' ? '#fff' : '#e0e0e0';
            msgDiv.style.alignSelf = sender === 'user' ? 'flex-end' : 'flex-start';
            msgDiv.textContent = text;
            chatMessages.appendChild(msgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        const sendChatMessage = async () => {
            const message = chatInput.value.trim();
            if (!message) return;
            addChatMessage(message, 'user');
            chatInput.value = '';
            // Get current game context
            const gameState = this.parser.getGameState ? this.parser.getGameState() : {};
            try {
                const res = await fetch('http://localhost:8000/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message, gameState })
                });
                const data = await res.json();
                addChatMessage(data.response || 'No response from Claude.', 'bot');
            } catch (err) {
                addChatMessage('Error: Could not reach Claude. Is the backend running?', 'bot');
            }
        };
    }

    /**
     * Make the copilot draggable
     */
    makeDraggable() {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        this.ui.header.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('copilot-btn')) return;
            
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            isDragging = true;
            this.ui.header.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;
                
                this.ui.container.style.transform = `translate(${currentX}px, ${currentY}px)`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            this.ui.header.style.cursor = 'grab';
        });
    }

    /**
     * Update the UI with current game state
     */
    updateGameState(gameState) {
        // Update status with more detailed information
        if (gameState.isActive) {
            this.elements.gameStatusDot.className = 'game-status-dot active';
            
            let statusText = 'In Game';
            if (gameState.isMyTurn) {
                statusText = '🎯 Your Turn!';
            } else if (gameState.waitingForAction) {
                statusText = 'Opponent Acting...';
            }
            
            this.elements.gameStatusText.textContent = statusText;
            this.elements.handInfo.style.display = 'block';
            
            this.elements.statusIndicator.className = 'status-indicator active';
            this.elements.statusText.textContent = 'Analyzing';
        } else {
            this.elements.gameStatusDot.className = 'game-status-dot';
            
            // Show debugging info when no game detected
            const debugText = `Searching... (v2.1 - Enhanced Detection)`;
            this.elements.gameStatusText.textContent = debugText;
            this.elements.handInfo.style.display = 'none';
            
            this.elements.statusIndicator.className = 'status-indicator';
            this.elements.statusText.textContent = 'Searching for game...';
        }

        // Update cards
        this.updateCards(gameState.holeCards, gameState.boardCards);

        // Update game stats
        this.elements.potSize.textContent = `$${gameState.potSize}`;
        this.elements.toCall.textContent = `$${gameState.toCall}`;
        this.elements.stackSize.textContent = `$${gameState.stackSize}`;

        // Update position and betting info
        this.elements.positionName.textContent = gameState.positionName || '--';
        this.elements.facingBet.textContent = `$${gameState.facingBet || 0}`;
        
        // Update stack analysis with current blind levels
        const stackBBs = gameState.stackSize / this.blindLevels.bigBlind;
        let stackCategory;
        if (stackBBs < 20) stackCategory = 'Very Short';
        else if (stackBBs < 40) stackCategory = 'Short';
        else if (stackBBs < 100) stackCategory = 'Medium';
        else if (stackBBs < 200) stackCategory = 'Deep';
        else stackCategory = 'Very Deep';
        
        this.elements.stackBBRatio.textContent = `${stackBBs.toFixed(1)} BB`;
        this.elements.stackDepthCategory.textContent = stackCategory;
        
        // Update opponent betting info
        if (gameState.opponentBets && gameState.opponentBets.length > 0) {
            this.elements.opponentInfo.style.display = 'block';
            this.updateOpponentBets(gameState.opponentBets);
        } else {
            this.elements.opponentInfo.style.display = 'none';
        }

        // Get and update advice with frequencies and custom blind levels
        if (gameState.isActive && gameState.holeCards.length === 2) {
            // Pass blind levels to advisor before getting advice
            this.advisor.updateBlindLevels(this.blindLevels);
            this.updateAdvice(gameState);
        } else {
            this.clearAdvice();
        }
    }

    /**
     * Update card displays
     */
    updateCards(holeCards, boardCards) {
        // Update hole cards
        this.elements.holeCards.innerHTML = '';
        holeCards.forEach(card => {
            const cardElement = this.createCardElement(card);
            this.elements.holeCards.appendChild(cardElement);
        });

        // Update board cards
        this.elements.boardCards.innerHTML = '';
        boardCards.forEach(card => {
            const cardElement = this.createCardElement(card);
            this.elements.boardCards.appendChild(cardElement);
        });

        // Add placeholders for missing board cards
        for (let i = boardCards.length; i < 5; i++) {
            const placeholder = document.createElement('div');
            placeholder.className = 'card-placeholder';
            this.elements.boardCards.appendChild(placeholder);
        }
    }

    /**
     * Create a card display element
     */
    createCardElement(card) {
        const cardEl = document.createElement('div');
        cardEl.className = 'poker-card';
        
        const suitSymbols = { 's': '♠', 'h': '♥', 'd': '♦', 'c': '♣' };
        const suitColors = { 's': '#000', 'h': '#e74c3c', 'd': '#e74c3c', 'c': '#000' };
        
        let rank, suit;
        
        // Handle different card formats
        if (typeof card === 'object' && card.rank && card.suit) {
            // Card object format
            rank = card.rank;
            suit = card.suit;
        } else if (typeof card === 'string' && card.length >= 2) {
            // String format like "Ah", "Kd", etc.
            rank = card.slice(0, -1);
            suit = card.slice(-1);
        } else {
            // Invalid or unknown format
            console.warn('🃏 Invalid card format in createCardElement:', card);
            rank = '?';
            suit = 's';
        }
        
        const suitSymbol = suitSymbols[suit] || suit;
        const suitColor = suitColors[suit] || '#000';
        
        cardEl.innerHTML = `
            <span class="card-rank">${rank}</span>
            <span class="card-suit" style="color: ${suitColor}">${suitSymbol}</span>
        `;
        
        return cardEl;
    }

    /**
     * Update advice display with comprehensive GTO analysis
     */
    updateAdvice(gameState) {
        try {
            const advice = this.advisor.getAdvice(gameState);
            this.currentAdvice = advice;

            // Update confidence (primary action frequency)
            this.elements.confidenceLevel.textContent = `${advice.confidence}%`;
            this.elements.confidenceBadge.style.background = this.advisor.getConfidenceColor(advice.confidence);

            // Update primary action with frequency and purpose
            let primaryActionHtml = `
                <div class="primary-action-main">${this.advisor.getPrimaryActionDisplay(advice.primaryAction, advice.strategy)}</div>
                <div class="strategy-frequencies">${this.advisor.getStrategyDisplay(advice.strategy)}</div>
            `;
            
            // Add betting purpose and hand type
            if (advice.bettingPurpose && advice.handType) {
                const purposeColor = this.getPurposeColor(advice.bettingPurpose);
                primaryActionHtml += `
                    <div class="betting-analysis" style="margin-top: 8px; font-size: 11px;">
                        <span class="hand-type" style="color: #f39c12; font-weight: 600;">${this.formatHandType(advice.handType)}</span>
                        <span class="betting-purpose" style="color: ${purposeColor}; font-weight: 600; margin-left: 8px;">
                            ${this.formatBettingPurpose(advice.bettingPurpose)}
                        </span>
                    </div>
                `;
            }
            
            this.elements.actionText.innerHTML = primaryActionHtml;
            
            if (advice.betSize && advice.betSize > 0) {
                this.elements.actionAmount.textContent = `$${advice.betSize}`;
                this.elements.actionAmount.style.display = 'inline';
            } else {
                this.elements.actionAmount.style.display = 'none';
            }

            this.elements.actionReasoning.innerHTML = this.formatReasoning(advice.reasoning);

            // Update detailed stats with comprehensive information
            if (advice.handStrength !== undefined) {
                this.elements.handStrength.textContent = `${Math.round(advice.handStrength)}%`;
            }
            
            // Enhanced equity display
            if (advice.equity !== undefined) {
                const equityText = typeof advice.equity === 'number' 
                    ? `${advice.equity.toFixed(1)}%` 
                    : advice.equity;
                this.elements.equity.textContent = equityText;
            }
            
            if (advice.outs) {
                this.elements.outs.textContent = advice.outs;
            }
            if (advice.potOdds) {
                this.elements.potOdds.textContent = advice.potOdds;
            }

            // Add comprehensive analysis panel
            this.updateComprehensiveAnalysis(advice, gameState);

            // Add frequency bars for visual representation
            this.addFrequencyBars(advice.strategy);

            // Add urgency animation if it's player's turn
            if (gameState.isMyTurn) {
                this.elements.confidenceBadge.style.animation = this.animations.pulse;
            } else {
                this.elements.confidenceBadge.style.animation = 'none';
            }
            
        } catch (error) {
            console.error('❌ Error getting GTO advice:', error);
            
            // Provide fallback advice when there's an error
            this.showFallbackAdvice(gameState, error);
        }
    }

    /**
     * Show fallback advice when the main advisor fails
     */
    showFallbackAdvice(gameState, error) {
        // Basic fallback advice based on simple game state
        let fallbackAction = 'Check';
        let fallbackReasoning = 'Basic advice due to parsing error. ';
        let confidence = 50;
        
        // Simple heuristics for fallback advice
        if (gameState.toCall > 0) {
            if (gameState.toCall < gameState.potSize * 0.3) {
                fallbackAction = 'Call';
                fallbackReasoning += 'Small bet relative to pot size.';
                confidence = 60;
            } else {
                fallbackAction = 'Fold';
                fallbackReasoning += 'Large bet - be cautious.';
                confidence = 70;
            }
        } else if (gameState.isMyTurn) {
            fallbackAction = 'Check';
            fallbackReasoning += 'No bet to face - check to see more cards.';
            confidence = 55;
        }
        
        // Update UI with fallback advice
        this.elements.confidenceLevel.textContent = `${confidence}%`;
        this.elements.confidenceBadge.style.background = '#6c757d';
        
        this.elements.actionText.innerHTML = `
            <div class="primary-action-main">${fallbackAction} (${confidence}%)</div>
            <div class="strategy-frequencies">Basic fallback advice</div>
        `;
        
        this.elements.actionAmount.style.display = 'none';
        this.elements.actionReasoning.innerHTML = fallbackReasoning + `<br><small style="color: #e74c3c;">Error: ${error.message}</small>`;
        
        // Clear detailed stats
        this.elements.handStrength.textContent = '--';
        this.elements.equity.textContent = '--';
        this.elements.outs.textContent = '--';
        this.elements.potOdds.textContent = '--';
        
        // Remove any existing frequency bars
        const existingBars = this.ui.advice.querySelector('.frequency-bars');
        if (existingBars) {
            existingBars.remove();
        }
        
        console.log('🔧 Fallback advice provided due to error:', error);
    }

    /**
     * Update comprehensive analysis panel
     */
    updateComprehensiveAnalysis(advice, gameState) {
        // Remove existing comprehensive analysis
        const existingAnalysis = this.ui.advice.querySelector('.comprehensive-analysis');
        if (existingAnalysis) {
            existingAnalysis.remove();
        }

        // Create comprehensive analysis panel
        const analysisPanel = document.createElement('div');
        analysisPanel.className = 'comprehensive-analysis';
        analysisPanel.style.cssText = `
            margin-top: 15px;
            padding: 12px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 11px;
            line-height: 1.4;
        `;

        let analysisHtml = '';

        // Game context section
        analysisHtml += `
            <div class="analysis-section" style="margin-bottom: 10px;">
                <div style="color: #f39c12; font-weight: 600; margin-bottom: 4px;">📊 Game Context</div>
                <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                    <span>Position: <strong style="color: #3498db;">${gameState.positionName || advice.position}</strong></span>
                    <span>Street: <strong style="color: #e74c3c;">${gameState.street || 'preflop'}</strong></span>
                </div>
                <div style="display: flex; justify-content: space-between; flex-wrap: wrap; margin-top: 2px;">
                    <span>Players: <strong>${gameState.activePlayers || 2}</strong></span>
                    <span>Stack: <strong>$${gameState.stackSize}</strong></span>
                </div>
                ${advice.stackDepthInfo ? `<div style="margin-top: 2px; font-size: 10px; color: #95a5a6;">Stack Analysis: <strong style="color: #f1c40f;">${advice.stackDepthInfo.description}</strong></div>` : ''}
            </div>
        `;

        // Our strategic approach section
        if (advice.bettingPurpose) {
            const approachExplanation = this.getApproachExplanation(advice.bettingPurpose, advice.handType);
            analysisHtml += `
                <div class="analysis-section" style="margin-bottom: 10px;">
                    <div style="color: #2ecc71; font-weight: 600; margin-bottom: 4px;">🎯 Our Approach</div>
                    <div style="color: #ecf0f1; font-size: 10px;">${approachExplanation}</div>
                </div>
            `;
        }

        // Opponent range analysis
        if (advice.detailedOpponentRange) {
            const oppRange = advice.detailedOpponentRange;
            analysisHtml += `
                <div class="analysis-section" style="margin-bottom: 10px;">
                    <div style="color: #e67e22; font-weight: 600; margin-bottom: 4px;">👥 Opponent Range Analysis</div>
                    <div style="margin-bottom: 4px;">
                        <span style="color: #95a5a6; font-size: 10px;">Range Strength: </span>
                        <strong style="color: ${this.getRangeStrengthColor(oppRange.strength)};">${oppRange.strength}</strong>
                        <span style="color: #95a5a6; font-size: 10px; margin-left: 8px;">Frequency: </span>
                        <strong style="color: #f39c12;">${oppRange.percentage}</strong>
                    </div>
                    <div style="color: #bdc3c7; font-size: 10px; margin-bottom: 2px;">${oppRange.description}</div>
                    <div style="color: #7f8c8d; font-size: 9px;">Action: ${oppRange.sizingContext}</div>
                </div>
            `;
        }

        // Board texture analysis (postflop)
        if (advice.boardTexture && gameState.boardCards && gameState.boardCards.length >= 3) {
            analysisHtml += `
                <div class="analysis-section" style="margin-bottom: 10px;">
                    <div style="color: #27ae60; font-weight: 600; margin-bottom: 4px;">🎯 Board Analysis</div>
                    <div style="color: #ecf0f1;">${advice.boardTexture}</div>
                </div>
            `;
        }

        // Equity and mathematical analysis
        if (advice.equity || advice.impliedOdds) {
            analysisHtml += `
                <div class="analysis-section" style="margin-bottom: 10px;">
                    <div style="color: #9b59b6; font-weight: 600; margin-bottom: 4px;">📈 Equity Analysis</div>
                    <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                        ${advice.equity ? `<span>Equity: <strong style="color: #1abc9c;">${typeof advice.equity === 'number' ? advice.equity.toFixed(1) + '%' : advice.equity}</strong></span>` : ''}
                        ${advice.potOdds !== 'N/A' ? `<span>Pot Odds: <strong>${advice.potOdds}</strong></span>` : ''}
                    </div>
                    ${advice.impliedOdds ? `<div style="margin-top: 2px;">Implied Odds: <strong style="color: #f1c40f;">${advice.impliedOdds}</strong></div>` : ''}
                </div>
            `;
        }

        // Opponent action analysis
        if (advice.opponentAction || advice.actionAnalysis) {
            const opponentInfo = advice.opponentAction || advice.actionAnalysis;
            analysisHtml += `
                <div class="analysis-section" style="margin-bottom: 10px;">
                    <div style="color: #e67e22; font-weight: 600; margin-bottom: 4px;">👥 Opponent Analysis</div>
                    <div style="color: #bdc3c7; font-size: 10px;">${opponentInfo}</div>
                </div>
            `;
        }

        // Strategy reasoning
        if (advice.reasoning) {
            analysisHtml += `
                <div class="analysis-section">
                    <div style="color: #34495e; font-weight: 600; margin-bottom: 4px;">🧠 Strategy Logic</div>
                    <div style="color: #95a5a6; font-size: 10px; font-style: italic;">${advice.reasoning}</div>
                </div>
            `;
        }

        analysisPanel.innerHTML = analysisHtml;

        // Insert after the frequency bars or action recommendation
        const insertAfter = this.ui.advice.querySelector('.frequency-bars') || 
                           this.ui.advice.querySelector('.action-recommendation');
        insertAfter.insertAdjacentElement('afterend', analysisPanel);
    }

    /**
     * Format betting purpose for display
     */
    formatBettingPurpose(purpose) {
        const purposeMap = {
            'value': '💰 VALUE',
            'bluff': '🎭 BLUFF', 
            'semi_bluff': '🎯 SEMI-BLUFF',
            'mixed': '⚖️ MIXED',
            'fold': '🚫 FOLD',
            'bluff_catcher': '🛡️ BLUFF CATCH'
        };
        return purposeMap[purpose] || purpose.toUpperCase();
    }

    /**
     * Format hand type for display
     */
    formatHandType(type) {
        const typeMap = {
            'premium': '⭐ PREMIUM',
            'strong': '💪 STRONG',
            'medium': '📊 MEDIUM',
            'nuts_strong': '🔥 NUTS/STRONG',
            'strong_made': '✅ STRONG MADE',
            'medium_made': '📈 MEDIUM MADE',
            'strong_draw': '🎯 STRONG DRAW',
            'medium_draw': '📊 MEDIUM DRAW',
            'weak_draw': '📉 WEAK DRAW',
            'bluff_candidate': '🎭 BLUFF CANDIDATE',
            'semi_bluff': '🎯 SEMI-BLUFF',
            'air_bluff': '💨 AIR BLUFF',
            'air': '💨 AIR',
            'weak': '📉 WEAK'
        };
        return typeMap[type] || type.toUpperCase();
    }

    /**
     * Get color for betting purpose
     */
    getPurposeColor(purpose) {
        const colorMap = {
            'value': '#27ae60',
            'bluff': '#e74c3c',
            'semi_bluff': '#f39c12',
            'mixed': '#9b59b6',
            'fold': '#95a5a6',
            'bluff_catcher': '#3498db'
        };
        return colorMap[purpose] || '#ecf0f1';
    }

    /**
     * Format reasoning text with highlighting
     */
    formatReasoning(reasoning) {
        if (!reasoning) return '';
        
        // Highlight key terms
        let formatted = reasoning
            .replace(/(\d+\.?\d*%)/g, '<strong style="color: #f39c12;">$1</strong>')
            .replace(/(value|bluff|semi-bluff)/gi, '<strong style="color: #27ae60;">$1</strong>')
            .replace(/(fold|check)/gi, '<strong style="color: #e74c3c;">$1</strong>')
            .replace(/(raise|bet|call)/gi, '<strong style="color: #3498db;">$1</strong>')
            .replace(/(\$\d+)/g, '<strong style="color: #f1c40f;">$1</strong>');
            
        return formatted;
    }

    /**
     * Toggle detailed stats visibility
     */
    toggleDetails() {
        const detailsVisible = this.elements.detailedStats.style.display !== 'none';
        const button = this.ui.container.querySelector('.toggle-details');
        
        if (detailsVisible) {
            this.elements.detailedStats.style.display = 'none';
            button.textContent = 'Show Details';
        } else {
            this.elements.detailedStats.style.display = 'block';
            button.textContent = 'Hide Details';
        }
    }

    /**
     * Toggle minimize state
     */
    toggleMinimize() {
        const button = this.ui.container.querySelector('.copilot-minimize');
        
        if (this.isMinimized) {
            this.ui.content.style.display = 'block';
            button.textContent = '−';
            this.isMinimized = false;
        } else {
            this.ui.content.style.display = 'none';
            button.textContent = '+';
            this.isMinimized = true;
        }
    }

    /**
     * Toggle copilot visibility
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Show copilot
     */
    show() {
        if (this.ui.container) {
            this.ui.container.style.display = 'block';
            this.ui.container.style.animation = this.animations.slideIn;
            this.isVisible = true;
        }
    }

    /**
     * Hide copilot
     */
    hide() {
        if (this.ui.container) {
            this.ui.container.style.display = 'none';
            this.isVisible = false;
        }
    }

    /**
     * Force update advice
     */
    forceUpdate() {
        this.parser.forceUpdate();
        const button = this.ui.container.querySelector('.force-update');
        button.textContent = 'Refreshing...';
        
        setTimeout(() => {
            button.textContent = 'Refresh';
        }, 1000);
    }

    /**
     * Start periodic advice updates - now more frequent for real-time updates
     */
    startAdviceUpdates() {
        // Update advice every 1 second for real-time updates
        setInterval(() => {
            const gameState = this.parser.getGameState();
            if (gameState.isActive && gameState.holeCards.length === 2) {
                this.updateAdvice(gameState);
            }
        }, 1000);
    }

    /**
     * Show welcome message when copilot activates
     */
    showWelcomeMessage() {
        // Create welcome notification
        const welcome = document.createElement('div');
        welcome.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            z-index: 10001;
            font-family: 'Segoe UI', sans-serif;
            font-size: 14px;
            font-weight: 600;
            animation: ${this.animations.slideIn};
            cursor: pointer;
            max-width: 300px;
        `;
        
        welcome.innerHTML = `
            🎯 <strong>GTO Copilot Active!</strong><br>
            <small style="font-weight: 400; opacity: 0.9;">
                • Press Ctrl+Shift+P to toggle<br>
                • Real-time strategy frequencies<br>
                • Updates automatically with each action
            </small>
        `;
        
        welcome.id = 'pokernow-copilot-welcome';
        
        document.body.appendChild(welcome);
        
        // Auto-remove after 6 seconds or on click
        const remove = () => {
            welcome.style.animation = 'copilot-fade-out 0.3s ease-out';
            setTimeout(() => welcome.remove(), 300);
        };
        
        welcome.addEventListener('click', remove);
        setTimeout(remove, 6000);
    }

    /**
     * Clear advice when not in game
     */
    clearAdvice() {
        this.elements.actionText.innerHTML = 'Waiting for hand...';
        this.elements.actionAmount.style.display = 'none';
        this.elements.actionReasoning.textContent = 'Join a poker game to receive real-time GTO strategy advice with frequencies';
        this.elements.confidenceLevel.textContent = '--';
        this.elements.confidenceBadge.style.background = '#6c757d';
        this.elements.confidenceBadge.style.animation = 'none';
        
        // Clear detailed stats
        this.elements.handStrength.textContent = '--';
        this.elements.equity.textContent = '--';
        this.elements.outs.textContent = '--';
        this.elements.potOdds.textContent = '--';

        // Remove frequency bars
        const existingBars = this.ui.advice.querySelector('.frequency-bars');
        if (existingBars) {
            existingBars.remove();
        }
    }

    /**
     * Update opponent bets
     */
    updateOpponentBets(opponentBets) {
        this.elements.opponentBetsList.innerHTML = '';
        opponentBets.forEach(player => {
            const betElement = document.createElement('div');
            betElement.className = 'opponent-bet';
            betElement.style.cssText = 'font-size: 11px; margin: 2px 0; color: #e0e0e0;';
            
            if (player.bet > 0) {
                betElement.textContent = `${player.name}: $${player.bet}`;
            } else {
                betElement.textContent = `${player.name}: Check`;
            }
            
            this.elements.opponentBetsList.appendChild(betElement);
        });
    }

    /**
     * Add visual frequency bars for each action
     */
    addFrequencyBars(strategy) {
        // Remove existing frequency bars
        const existingBars = this.ui.advice.querySelector('.frequency-bars');
        if (existingBars) {
            existingBars.remove();
        }

        // Create frequency bars container
        const barsContainer = document.createElement('div');
        barsContainer.className = 'frequency-bars';
        
        // Sort actions by frequency
        const sortedActions = Object.entries(strategy)
            .filter(([action, freq]) => freq > 0)
            .sort(([,a], [,b]) => b - a);

        sortedActions.forEach(([action, frequency]) => {
            const barWrapper = document.createElement('div');
            barWrapper.className = 'frequency-bar-wrapper';
            
            const barLabel = document.createElement('div');
            barLabel.className = 'frequency-bar-label';
            barLabel.textContent = `${this.advisor.capitalizeAction(action)}: ${frequency}%`;
            
            const barContainer = document.createElement('div');
            barContainer.className = 'frequency-bar-container';
            
            const bar = document.createElement('div');
            bar.className = 'frequency-bar';
            bar.style.width = `${frequency}%`;
            bar.style.backgroundColor = this.advisor.getActionColor(action, frequency);
            
            barContainer.appendChild(bar);
            barWrapper.appendChild(barLabel);
            barWrapper.appendChild(barContainer);
            barsContainer.appendChild(barWrapper);
        });

        // Insert after the action recommendation
        const actionRecommendation = this.ui.advice.querySelector('.action-recommendation');
        actionRecommendation.insertAdjacentElement('afterend', barsContainer);
    }

    /**
     * Update blind levels
     */
    updateBlindLevels() {
        this.blindLevels.smallBlind = parseFloat(this.elements.sbInput.value);
        this.blindLevels.bigBlind = parseFloat(this.elements.bbInput.value);
        this.advisor.updateBlindLevels(this.blindLevels);
    }

    /**
     * Get approach explanation for betting purpose
     */
    getApproachExplanation(purpose, handType) {
        const explanations = {
            'value': {
                'premium': 'Betting aggressively for maximum value with our premium hand. We want to build the pot and get called by weaker hands.',
                'strong': 'Betting for value with our strong hand. We aim to extract value from medium-strength hands and draws.',
                'nuts_strong': 'Betting heavily for value with our monster hand. We want to charge draws and get maximum value.',
                'strong_made': 'Betting our strong made hand for value, protecting against draws and building the pot.',
                'default': 'Betting for value - we have a strong enough hand to get called by worse hands.'
            },
            'bluff': {
                'bluff_candidate': 'Pure bluffing with our weak hand. We\'re representing strength to fold out better hands.',
                'air_bluff': 'Bluffing with complete air. We need fold equity to make this profitable.',
                'weak': 'Bluffing with our weak hand, trying to win the pot immediately through fold equity.',
                'default': 'Bluffing - representing a strong hand to make better hands fold.'
            },
            'semi_bluff': {
                'strong_draw': 'Semi-bluffing with our strong draw. We have good equity if called and fold equity against weak hands.',
                'medium_draw': 'Semi-bluffing with our draw. We have backup equity plus the chance to win immediately.',
                'weak_draw': 'Semi-bluffing with limited equity. We\'re relying more on fold equity than card equity.',
                'default': 'Semi-bluffing - betting with a drawing hand that has equity if called.'
            },
            'mixed': {
                'medium': 'Mixed strategy with our medium-strength hand. Sometimes betting for thin value, sometimes controlling pot size.',
                'medium_made': 'Playing mixed strategy for pot control and thin value extraction.',
                'default': 'Mixed approach - our hand strength allows for multiple profitable strategies.'
            },
            'bluff_catcher': {
                'weak_draw': 'Calling as a bluff catcher. Our hand beats bluffs but loses to value bets.',
                'default': 'Playing as bluff catcher - calling to catch opponent bluffs while folding to heavy pressure.'
            },
            'fold': {
                'air': 'Folding our weak hand. We have insufficient equity and no profitable bluffing opportunity.',
                'weak': 'Folding due to unfavorable pot odds and weak hand strength.',
                'default': 'Folding - our hand is too weak to continue profitably.'
            }
        };

        const purposeExplanations = explanations[purpose] || explanations['mixed'];
        return purposeExplanations[handType] || purposeExplanations['default'] || 'Strategic approach based on hand strength and position.';
    }

    /**
     * Get range strength color
     */
    getRangeStrengthColor(strength) {
        const colorMap = {
            'Ultra Strong': '#8e44ad',
            'Very Strong': '#c0392b', 
            'Strong': '#e74c3c',
            'Medium-Strong': '#f39c12',
            'Medium': '#f1c40f',
            'Wide': '#27ae60',
            'Polarized': '#3498db',
            'Unknown': '#95a5a6'
        };
        return colorMap[strength] || '#ecf0f1';
    }

    /**
     * Initialize blind levels
     */
    initializeBlindLevels() {
        this.blindLevels.smallBlind = parseFloat(this.elements.sbInput.value);
        this.blindLevels.bigBlind = parseFloat(this.elements.bbInput.value);
        this.advisor.updateBlindLevels(this.blindLevels);
    }
}

// Export for use in other modules
window.CopilotUI = CopilotUI; 
