const PALETTES = {
    calm: [
        ['#E8F4F8', '#B8D4E3', '#8FB8D0', '#6A9FB5'],
        ['#F0E6F6', '#D4B8E0', '#B890C8', '#9B68B0'],
        ['#E6F6F0', '#B8E0C8', '#90C8A0', '#68B078'],
        ['#F6F0E6', '#E0D4B8', '#C8B890', '#B0A068']
    ],
    focus: [
        ['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6'],
        ['#F3E5F5', '#E1BEE7', '#CE93D8', '#BA68C8'],
        ['#E8F5E9', '#C8E6C9', '#A5D6A7', '#81C784']
    ],
    scroll: [
        ['#FFF3E0', '#FFE0B2', '#FFCC80', '#FFB74D'],
        ['#FCE4EC', '#F8BBD0', '#F48FB1', '#F06292'],
        ['#E0F2F1', '#B2DFDB', '#80CBC4', '#4DB6AC']
    ],
    sleep: [
        ['#263238', '#37474F', '#455A64', '#546E7A'],
        ['#1A237E', '#283593', '#303F9F', '#3949AB'],
        ['#1B5E20', '#2E7D32', '#388E3C', '#43A047']
    ]
};

const ANIMATION_TYPES = ['float', 'pulse', 'morph', 'drift'];

export class CardFactory {
    constructor(state) {
        this.state = state;
        this.cardId = 0;
    }

    generateCard() {
        const mode = this.state.mode;
        const stimulus = this.state.stimulus;
        const contrast = this.state.contrast;
        const complexity = this.state.complexity;

        const palette = this.selectPalette(mode, contrast);
        const animationType = this.selectAnimation(complexity);
        const speed = this.calculateSpeed(stimulus);
        const height = this.calculateHeight();

        return {
            id: `card-${++this.cardId}`,
            palette,
            animationType,
            speed,
            contrast,
            complexity,
            height,
            shapes: this.generateShapes(complexity, palette)
        };
    }

    selectPalette(mode, contrast) {
        const modePalettes = PALETTES[mode] || PALETTES.calm;
        const paletteIndex = Math.floor(Math.random() * modePalettes.length);
        const basePalette = modePalettes[paletteIndex];
        
        if (contrast > 0.5) {
            return this.enhanceContrast(basePalette);
        }
        
        return basePalette;
    }

    enhanceContrast(palette) {
        return palette.map((color, index) => {
            if (index === 0) return this.lightenColor(color, 20);
            if (index === palette.length - 1) return this.darkenColor(color, 20);
            return color;
        });
    }

    lightenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    }

    darkenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    }

    selectAnimation(complexity) {
        if (complexity < 0.2) {
            return 'float';
        } else if (complexity < 0.4) {
            return Math.random() > 0.5 ? 'float' : 'pulse';
        } else if (complexity < 0.6) {
            return ANIMATION_TYPES[Math.floor(Math.random() * 3)];
        } else {
            return ANIMATION_TYPES[Math.floor(Math.random() * ANIMATION_TYPES.length)];
        }
    }

    calculateSpeed(stimulus) {
        const baseSpeed = 3;
        const maxSpeed = 0.5;
        const speed = baseSpeed - (stimulus * (baseSpeed - maxSpeed));
        return Math.max(maxSpeed, speed);
    }

    calculateHeight() {
        const minHeight = 150;
        const maxHeight = 400;
        return minHeight + Math.random() * (maxHeight - minHeight);
    }

    generateShapes(complexity, palette) {
        const minShapes = 2;
        const maxShapes = 6;
        const shapeCount = Math.floor(minShapes + complexity * (maxShapes - minShapes));
        
        const shapes = [];
        for (let i = 0; i < shapeCount; i++) {
            shapes.push({
                color: palette[Math.floor(Math.random() * palette.length)],
                size: 20 + Math.random() * 80,
                x: Math.random() * 100,
                y: Math.random() * 100,
                delay: Math.random() * 2,
                opacity: 0.3 + Math.random() * 0.7
            });
        }
        
        return shapes;
    }

    generateBatch(count) {
        const cards = [];
        for (let i = 0; i < count; i++) {
            cards.push(this.generateCard());
        }
        return cards;
    }
}
