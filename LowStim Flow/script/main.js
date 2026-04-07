import { Flow } from './flow.js';
import { Controller } from './controller.js';
import { Session } from './session.js';
import { DataStore } from './dataStore.js';

class AppState {
    constructor() {
        this.mode = 'calm';
        this.stimulus = 0.3;
        this.contrast = 0.2;
        this.complexity = 0.1;
        this.sessionActive = false;
        this.sessionTimeLeft = 0;
        this.listeners = [];
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(listener => listener(this));
    }

    update(updates) {
        Object.assign(this, updates);
        this.notify();
    }
}

const MODE_PRESETS = {
    calm: {
        stimulus: 0.2,
        contrast: 0.15,
        complexity: 0.1
    },
    focus: {
        stimulus: 0.4,
        contrast: 0.3,
        complexity: 0.3
    },
    scroll: {
        stimulus: 0.6,
        contrast: 0.4,
        complexity: 0.5
    },
    sleep: {
        stimulus: 0.05,
        contrast: 0.1,
        complexity: 0.05
    }
};

class LowStimFlow {
    constructor() {
        this.state = new AppState();
        this.dataStore = new DataStore();
        this.flow = null;
        this.controller = null;
        this.session = null;
        
        this.init();
    }

    async init() {
        this.loadSavedState();
        
        this.flow = new Flow(this.state);
        this.controller = new Controller(this.state, MODE_PRESETS);
        this.session = new Session(this.state);
        
        this.setupEventListeners();
        
        this.applyMode(this.state.mode);
        
        this.flow.start();
    }

    loadSavedState() {
        const saved = this.dataStore.load();
        if (saved.lastMode) {
            this.state.mode = saved.lastMode;
        }
        if (saved.totalUsageTime !== undefined) {
            this.totalUsageTime = saved.totalUsageTime;
        }
    }

    setupEventListeners() {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.setMode(mode);
            });
        });

        document.getElementById('stimulus-slider').addEventListener('input', (e) => {
            this.state.update({ stimulus: e.target.value / 100 });
        });

        document.getElementById('contrast-slider').addEventListener('input', (e) => {
            this.state.update({ contrast: e.target.value / 100 });
        });

        document.getElementById('complexity-slider').addEventListener('input', (e) => {
            this.state.update({ complexity: e.target.value / 100 });
        });

        document.querySelectorAll('.session-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const duration = parseInt(e.target.dataset.duration);
                this.startSession(duration);
            });
        });

        document.getElementById('settings-btn').addEventListener('click', () => {
            this.openSettings();
        });

        document.getElementById('close-settings').addEventListener('click', () => {
            this.closeSettings();
        });

        document.getElementById('settings-modal').addEventListener('click', (e) => {
            if (e.target.id === 'settings-modal') {
                this.closeSettings();
            }
        });

        document.getElementById('default-mode').addEventListener('change', (e) => {
            this.dataStore.save({ defaultMode: e.target.value });
        });

        document.getElementById('default-duration').addEventListener('change', (e) => {
            this.dataStore.save({ defaultDuration: parseInt(e.target.value) });
        });

        document.getElementById('low-performance').addEventListener('change', (e) => {
            this.dataStore.save({ lowPerformance: e.target.checked });
            if (this.flow) {
                this.flow.setLowPerformance(e.target.checked);
            }
        });

        window.addEventListener('beforeunload', () => {
            this.dataStore.save({
                lastMode: this.state.mode,
                totalUsageTime: (this.totalUsageTime || 0) + this.session.getElapsedTime()
            });
        });
    }

    setMode(mode) {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        this.state.update({ mode });
        this.applyMode(mode);
    }

    applyMode(mode) {
        const preset = MODE_PRESETS[mode];
        if (preset) {
            this.state.update(preset);
            
            document.getElementById('stimulus-slider').value = preset.stimulus * 100;
            document.getElementById('contrast-slider').value = preset.contrast * 100;
            document.getElementById('complexity-slider').value = preset.complexity * 100;
        }
    }

    startSession(duration) {
        document.querySelectorAll('.session-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        this.session.start(duration);
    }

    openSettings() {
        const modal = document.getElementById('settings-modal');
        modal.classList.remove('hidden');
        
        const settings = this.dataStore.load();
        if (settings.defaultMode) {
            document.getElementById('default-mode').value = settings.defaultMode;
        }
        if (settings.defaultDuration) {
            document.getElementById('default-duration').value = settings.defaultDuration;
        }
        if (settings.lowPerformance !== undefined) {
            document.getElementById('low-performance').checked = settings.lowPerformance;
        }
    }

    closeSettings() {
        const modal = document.getElementById('settings-modal');
        modal.classList.add('hidden');
    }
}

const app = new LowStimFlow();
