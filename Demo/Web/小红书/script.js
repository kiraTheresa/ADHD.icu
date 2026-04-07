const CONFIG = {
    morandiColors: [
        '#c4b7a6', '#b5c4b1', '#a7c4c4', '#c4b1b5', '#c4c1a7',
        '#b8a9a9', '#a9b8b8', '#b8b8a9', '#c9b8a9', '#a9b8c9',
        '#d4c5b5', '#b5d4c5', '#c5b5d4', '#d4b5c5', '#c5d4b5',
        '#bfc9bf', '#c9bfbf', '#bfbfc9', '#c9c9bf', '#bfc9c9'
    ],
    animationTypes: ['gradient', 'shapes', 'breathe', 'drift'],
    cardHeightRange: [150, 350],
    initialCardCount: 10,
    loadMoreCount: 6
};

let stimulusLevel = 50;
let isMinimalMode = false;
let isLoading = false;
let cardIdCounter = 0;

const leftColumn = document.getElementById('column-left');
const rightColumn = document.getElementById('column-right');
const stimulusSlider = document.getElementById('stimulus-slider');
const stimulusValue = document.getElementById('stimulus-value');
const minimalBtn = document.getElementById('minimal-mode');
const loadingEl = document.getElementById('loading');

function getRandomColor() {
    return CONFIG.morandiColors[Math.floor(Math.random() * CONFIG.morandiColors.length)];
}

function getRandomHeight() {
    const range = CONFIG.cardHeightRange;
    return Math.floor(Math.random() * (range[1] - range[0]) + range[0]);
}

function getRandomAnimationType() {
    return CONFIG.animationTypes[Math.floor(Math.random() * CONFIG.animationTypes.length)];
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function adjustColorIntensity(hex, intensity) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    
    const factor = 0.3 + (intensity / 100) * 0.7;
    const r = Math.floor(rgb.r * factor);
    const g = Math.floor(rgb.g * factor);
    const b = Math.floor(rgb.b * factor);
    
    return `rgb(${r}, ${g}, ${b})`;
}

function createGradientCard(card, color1, color2) {
    const inner = document.createElement('div');
    inner.className = 'card-inner';
    
    const gradient = document.createElement('div');
    gradient.className = 'card-gradient';
    
    const intensity = isMinimalMode ? 20 : stimulusLevel;
    const adjustedColor1 = adjustColorIntensity(color1, intensity);
    const adjustedColor2 = adjustColorIntensity(color2, intensity);
    
    const angle = Math.floor(Math.random() * 360);
    gradient.style.background = `linear-gradient(${angle}deg, ${adjustedColor1}, ${adjustedColor2})`;
    gradient.style.backgroundSize = '200% 200%';
    
    const duration = isMinimalMode ? 20 : (15 - (stimulusLevel / 10));
    gradient.style.animation = `gradientShift ${duration}s ease-in-out infinite`;
    
    inner.appendChild(gradient);
    card.appendChild(inner);
}

function createShapesCard(card, baseColor) {
    const inner = document.createElement('div');
    inner.className = 'card-inner';
    
    const gradient = document.createElement('div');
    gradient.className = 'card-gradient';
    const intensity = isMinimalMode ? 20 : stimulusLevel;
    gradient.style.background = adjustColorIntensity(baseColor, intensity * 0.5);
    inner.appendChild(gradient);
    
    const shapesContainer = document.createElement('div');
    shapesContainer.className = 'card-shapes';
    
    const shapeCount = isMinimalMode ? 1 : Math.floor(Math.random() * 2 + 1);
    
    for (let i = 0; i < shapeCount; i++) {
        const shape = document.createElement('div');
        shape.className = 'shape';
        
        const size = Math.floor(Math.random() * 40 + 30);
        const x = Math.floor(Math.random() * 70 + 10);
        const y = Math.floor(Math.random() * 70 + 10);
        
        shape.style.width = `${size}px`;
        shape.style.height = `${size}px`;
        shape.style.left = `${x}%`;
        shape.style.top = `${y}%`;
        shape.style.background = adjustColorIntensity(getRandomColor(), intensity);
        
        const animType = Math.random() > 0.5 ? 'breathe' : 'drift';
        const duration = isMinimalMode ? 15 : (10 - (stimulusLevel / 20));
        shape.style.animation = `${animType} ${duration}s ease-in-out infinite`;
        shape.style.animationDelay = `${Math.random() * 2}s`;
        
        shapesContainer.appendChild(shape);
    }
    
    inner.appendChild(shapesContainer);
    card.appendChild(inner);
}

function createBreatheCard(card, color) {
    const inner = document.createElement('div');
    inner.className = 'card-inner';
    
    const gradient = document.createElement('div');
    gradient.className = 'card-gradient';
    
    const intensity = isMinimalMode ? 20 : stimulusLevel;
    const adjustedColor = adjustColorIntensity(color, intensity);
    gradient.style.background = adjustedColor;
    
    const duration = isMinimalMode ? 8 : (6 - (stimulusLevel / 25));
    gradient.style.animation = `breathe ${duration}s ease-in-out infinite`;
    
    inner.appendChild(gradient);
    card.appendChild(inner);
}

function createDriftCard(card, color1, color2) {
    const inner = document.createElement('div');
    inner.className = 'card-inner';
    
    const gradient = document.createElement('div');
    gradient.className = 'card-gradient';
    
    const intensity = isMinimalMode ? 20 : stimulusLevel;
    const adjustedColor1 = adjustColorIntensity(color1, intensity);
    const adjustedColor2 = adjustColorIntensity(color2, intensity);
    
    gradient.style.background = `linear-gradient(135deg, ${adjustedColor1} 0%, ${adjustedColor2} 100%)`;
    
    const duration = isMinimalMode ? 20 : (15 - (stimulusLevel / 10));
    gradient.style.animation = `drift ${duration}s ease-in-out infinite`;
    
    inner.appendChild(gradient);
    card.appendChild(inner);
}

function createCard() {
    const card = document.createElement('div');
    card.className = 'card';
    card.id = `card-${cardIdCounter++}`;
    
    const height = getRandomHeight();
    card.style.height = `${height}px`;
    
    const animType = getRandomAnimationType();
    const color1 = getRandomColor();
    const color2 = getRandomColor();
    
    switch (animType) {
        case 'gradient':
            createGradientCard(card, color1, color2);
            break;
        case 'shapes':
            createShapesCard(card, color1);
            break;
        case 'breathe':
            createBreatheCard(card, color1);
            break;
        case 'drift':
            createDriftCard(card, color1, color2);
            break;
    }
    
    return card;
}

function getShorterColumn() {
    const leftHeight = leftColumn.scrollHeight;
    const rightHeight = rightColumn.scrollHeight;
    return leftHeight <= rightHeight ? leftColumn : rightColumn;
}

function loadMore(count = CONFIG.loadMoreCount) {
    if (isLoading) return;
    
    isLoading = true;
    loadingEl.classList.add('visible');
    
    setTimeout(() => {
        for (let i = 0; i < count; i++) {
            const card = createCard();
            const column = getShorterColumn();
            column.appendChild(card);
        }
        
        isLoading = false;
        loadingEl.classList.remove('visible');
    }, 300);
}

function updateStimulusLevel(value) {
    stimulusLevel = parseInt(value);
    stimulusValue.textContent = value;
}

function toggleMinimalMode() {
    isMinimalMode = !isMinimalMode;
    minimalBtn.classList.toggle('active', isMinimalMode);
    minimalBtn.textContent = isMinimalMode ? '标准模式' : '极简模式';
    
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const newCard = createCard();
        newCard.style.height = card.style.height;
        card.replaceWith(newCard);
    });
}

function handleScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (scrollTop + windowHeight >= documentHeight - 200) {
        loadMore();
    }
}

function init() {
    loadMore(CONFIG.initialCardCount);
    
    stimulusSlider.addEventListener('input', (e) => {
        updateStimulusLevel(e.target.value);
    });
    
    minimalBtn.addEventListener('click', toggleMinimalMode);
    
    window.addEventListener('scroll', handleScroll);
    
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            handleScroll();
        }, 200);
    });
}

document.addEventListener('DOMContentLoaded', init);
