export class Controller {
    constructor(state, modePresets) {
        this.state = state;
        this.modePresets = modePresets;
        this.transitionDuration = 500;
    }

    setMode(mode) {
        if (!this.modePresets[mode]) {
            console.warn(`Unknown mode: ${mode}`);
            return;
        }

        const preset = this.modePresets[mode];
        this.smoothTransition(preset);
        this.state.update({ mode });
    }

    smoothTransition(targetValues) {
        const currentValues = {
            stimulus: this.state.stimulus,
            contrast: this.state.contrast,
            complexity: this.state.complexity
        };

        const startTime = performance.now();
        const duration = this.transitionDuration;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = this.easeInOutCubic(progress);

            const newValues = {
                stimulus: this.lerp(currentValues.stimulus, targetValues.stimulus, eased),
                contrast: this.lerp(currentValues.contrast, targetValues.contrast, eased),
                complexity: this.lerp(currentValues.complexity, targetValues.complexity, eased)
            };

            this.state.update(newValues);

            this.updateSliders(newValues);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    lerp(start, end, progress) {
        return start + (end - start) * progress;
    }

    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    updateSliders(values) {
        const stimulusSlider = document.getElementById('stimulus-slider');
        const contrastSlider = document.getElementById('contrast-slider');
        const complexitySlider = document.getElementById('complexity-slider');

        if (stimulusSlider) {
            stimulusSlider.value = Math.round(values.stimulus * 100);
        }
        if (contrastSlider) {
            contrastSlider.value = Math.round(values.contrast * 100);
        }
        if (complexitySlider) {
            complexitySlider.value = Math.round(values.complexity * 100);
        }
    }

    setStimulus(value) {
        this.state.update({ stimulus: value });
    }

    setContrast(value) {
        this.state.update({ contrast: value });
    }

    setComplexity(value) {
        this.state.update({ complexity: value });
    }

    getModeInfo(mode) {
        const modeDescriptions = {
            calm: {
                name: 'Calm',
                description: '放松/恢复',
                features: '低速度 + 低对比 + 低复杂度'
            },
            focus: {
                name: 'Focus',
                description: '专注前',
                features: '中速 + 中对比 + 规律变化'
            },
            scroll: {
                name: 'Scroll',
                description: '替代刷手机',
                features: '中高速度 + 中复杂度'
            },
            sleep: {
                name: 'Sleep',
                description: '睡前',
                features: '极低速度 + 低亮度 + 近静态'
            }
        };

        return modeDescriptions[mode] || modeDescriptions.calm;
    }

    getCurrentState() {
        return {
            mode: this.state.mode,
            stimulus: this.state.stimulus,
            contrast: this.state.contrast,
            complexity: this.state.complexity,
            sessionActive: this.state.sessionActive,
            sessionTimeLeft: this.state.sessionTimeLeft
        };
    }

    reset() {
        this.setMode('calm');
    }
}
