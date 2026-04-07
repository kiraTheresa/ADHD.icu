export class Session {
    constructor(state) {
        this.state = state;
        this.timerElement = document.getElementById('session-timer');
        this.intervalId = null;
        this.startTime = null;
        this.duration = 0;
        this.timeLeft = 0;
        this.isPaused = false;
    }

    start(duration) {
        this.stop();
        
        this.duration = duration;
        this.timeLeft = duration;
        this.startTime = Date.now();
        this.isPaused = false;

        this.state.update({
            sessionActive: true,
            sessionTimeLeft: duration
        });

        this.updateDisplay();
        
        this.intervalId = setInterval(() => {
            this.tick();
        }, 1000);
    }

    tick() {
        if (this.isPaused) return;

        this.timeLeft--;
        
        this.state.update({
            sessionTimeLeft: this.timeLeft
        });

        this.updateDisplay();

        if (this.timeLeft <= 0) {
            this.end();
        } else if (this.timeLeft <= 30) {
            this.prepareEnd();
        }
    }

    updateDisplay() {
        if (!this.timerElement) return;

        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        this.timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    prepareEnd() {
        this.state.update({
            stimulus: this.state.stimulus * 0.8,
            contrast: this.state.contrast * 0.8,
            complexity: this.state.complexity * 0.8
        });
    }

    end() {
        this.stop();
        
        this.state.update({
            stimulus: 0.1,
            contrast: 0.1,
            complexity: 0.05,
            sessionActive: false,
            sessionTimeLeft: 0
        });

        if (this.timerElement) {
            this.timerElement.textContent = 'Done ✓';
            setTimeout(() => {
                this.timerElement.textContent = '';
            }, 3000);
        }

        document.querySelectorAll('.session-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.state.update({
            sessionActive: false,
            sessionTimeLeft: 0
        });

        if (this.timerElement) {
            this.timerElement.textContent = '';
        }
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    getElapsedTime() {
        if (!this.startTime) return 0;
        return Math.floor((Date.now() - this.startTime) / 1000);
    }

    isActive() {
        return this.state.sessionActive && this.timeLeft > 0;
    }

    getRemainingTime() {
        return this.timeLeft;
    }

    getProgress() {
        if (this.duration === 0) return 0;
        return 1 - (this.timeLeft / this.duration);
    }
}
