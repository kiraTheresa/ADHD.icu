const STORAGE_KEY = 'lowstimflow_data';

export class DataStore {
    constructor() {
        this.cache = null;
    }

    load() {
        if (this.cache) {
            return this.cache;
        }

        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                this.cache = JSON.parse(stored);
                return this.cache;
            }
        } catch (error) {
            console.warn('Failed to load data from localStorage:', error);
        }

        const defaultData = {
            lastMode: 'calm',
            totalUsageTime: 0,
            lastSessionDuration: 0,
            defaultMode: 'calm',
            defaultDuration: 300,
            lowPerformance: false
        };

        this.cache = defaultData;
        return defaultData;
    }

    save(data) {
        try {
            const currentData = this.load();
            const newData = { ...currentData, ...data };
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
            this.cache = newData;
            
            return true;
        } catch (error) {
            console.warn('Failed to save data to localStorage:', error);
            return false;
        }
    }

    clear() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            this.cache = null;
            return true;
        } catch (error) {
            console.warn('Failed to clear data from localStorage:', error);
            return false;
        }
    }

    get(key) {
        const data = this.load();
        return data[key];
    }

    set(key, value) {
        return this.save({ [key]: value });
    }

    increment(key, amount = 1) {
        const data = this.load();
        const currentValue = data[key] || 0;
        return this.save({ [key]: currentValue + amount });
    }

    getLastMode() {
        return this.get('lastMode') || 'calm';
    }

    setLastMode(mode) {
        return this.set('lastMode', mode);
    }

    getTotalUsageTime() {
        return this.get('totalUsageTime') || 0;
    }

    addToTotalUsageTime(seconds) {
        return this.increment('totalUsageTime', seconds);
    }

    getDefaultMode() {
        return this.get('defaultMode') || 'calm';
    }

    setDefaultMode(mode) {
        return this.set('defaultMode', mode);
    }

    getDefaultDuration() {
        return this.get('defaultDuration') || 300;
    }

    setDefaultDuration(duration) {
        return this.set('defaultDuration', duration);
    }

    isLowPerformance() {
        return this.get('lowPerformance') || false;
    }

    setLowPerformance(enabled) {
        return this.set('lowPerformance', enabled);
    }
}
