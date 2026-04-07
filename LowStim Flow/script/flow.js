import { CardFactory } from './cardFactory.js';
import { Animation } from './animation.js';

export class Flow {
    constructor(state) {
        this.state = state;
        this.container = document.getElementById('main-flow');
        this.cardFactory = new CardFactory(state);
        this.animation = new Animation(state);
        
        this.cards = [];
        this.maxCards = 100;
        this.initialCardCount = 20;
        this.loadMoreThreshold = 200;
        this.isRunning = false;
        this.lowPerformance = false;
        
        this.state.subscribe(this.handleStateChange.bind(this));
    }

    handleStateChange(newState) {
        this.animation.updateAllAnimations();
        
        if (newState.mode === 'sleep') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.loadInitialCards();
        this.setupInfiniteScroll();
    }

    stop() {
        this.isRunning = false;
        this.animation.clearAll();
    }

    setLowPerformance(enabled) {
        this.lowPerformance = enabled;
        this.animation.setLowPerformance(enabled);
    }

    loadInitialCards() {
        const cards = this.cardFactory.generateBatch(this.initialCardCount);
        cards.forEach(card => this.addCard(card));
    }

    addCard(card) {
        if (this.cards.length >= this.maxCards) {
            this.removeOldestCard();
        }

        const element = this.createCardElement(card);
        this.container.appendChild(element);
        
        this.cards.push({
            id: card.id,
            element,
            data: card
        });

        this.animation.applyAnimation(element, card);
    }

    createCardElement(card) {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.id = card.id;
        cardEl.style.height = `${card.height}px`;

        const contentEl = document.createElement('div');
        contentEl.className = 'card-content';
        contentEl.style.background = this.createGradient(card.palette);

        card.shapes.forEach(shape => {
            const shapeEl = document.createElement('div');
            shapeEl.className = 'card-shape';
            shapeEl.style.cssText = `
                width: ${shape.size}px;
                height: ${shape.size}px;
                left: ${shape.x}%;
                top: ${shape.y}%;
                background: ${shape.color};
                opacity: ${shape.opacity};
                transform: translate(-50%, -50%);
            `;
            contentEl.appendChild(shapeEl);
        });

        cardEl.appendChild(contentEl);
        return cardEl;
    }

    createGradient(palette) {
        const angle = Math.random() * 360;
        const colors = palette.slice(0, 2);
        return `linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]})`;
    }

    removeOldestCard() {
        if (this.cards.length === 0) return;

        const oldest = this.cards[0];
        this.animation.removeAnimation(`anim-${oldest.id}`);
        
        if (oldest.element && oldest.element.parentNode) {
            oldest.element.parentNode.removeChild(oldest.element);
        }
        
        this.cards.shift();
    }

    setupInfiniteScroll() {
        let scrollTimeout;
        
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            
            scrollTimeout = setTimeout(() => {
                this.checkScrollPosition();
            }, 100);
        });
    }

    checkScrollPosition() {
        if (!this.isRunning) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        if (scrollTop + windowHeight >= documentHeight - this.loadMoreThreshold) {
            this.loadMoreCards();
        }

        this.cleanupInvisibleCards();
    }

    loadMoreCards() {
        const batchSize = this.lowPerformance ? 5 : 10;
        const cards = this.cardFactory.generateBatch(batchSize);
        cards.forEach(card => this.addCard(card));
    }

    cleanupInvisibleCards() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;

        const visibleCards = [];
        const cardsToRemove = [];

        this.cards.forEach(card => {
            if (!card.element) return;

            const rect = card.element.getBoundingClientRect();
            const isVisible = rect.bottom > -windowHeight && rect.top < windowHeight * 2;

            if (isVisible) {
                visibleCards.push(card);
            } else if (this.cards.length > this.initialCardCount) {
                cardsToRemove.push(card);
            }
        });

        cardsToRemove.forEach(card => {
            this.animation.removeAnimation(`anim-${card.id}`);
            if (card.element && card.element.parentNode) {
                card.element.parentNode.removeChild(card.element);
            }
        });

        if (cardsToRemove.length > 0) {
            this.cards = visibleCards;
        }
    }

    refresh() {
        this.cards.forEach(card => {
            if (card.element && card.data) {
                this.animation.applyAnimation(card.element, card.data);
            }
        });
    }

    pause() {
        this.animation.pauseAll();
    }

    resume() {
        this.animation.resumeAll();
    }
}
