/**
 * Controls the flow of animations (speed, pause, play, step).
 */
export class AnimationController {
    constructor() {
        this.speed = 500; // default delay in ms
        this.paused = false;
        this.resolver = null; // Function to resolve the current pause promise
        this.abortController = new AbortController(); // To cancel current operations
    }

    /**
     * Pauses execution for a duration determined by speed.
     * If paused, waits indefinitely until play() or step() is called.
     * @returns {Promise}
     */
    async sleep() {
        // Check if aborted
        if (this.abortController.signal.aborted) {
            return Promise.reject(new Error('Animation Aborted'));
        }

        // If paused, create a promise that waits for manual resolution
        if (this.paused) {
            return new Promise(resolve => {
                this.resolver = resolve;
            });
        }

        // Normal delay
        return new Promise(resolve => setTimeout(resolve, this.getDelay()));
    }

    /**
     * Calculates delay based on speed value (1-100).
     * 100 = fast (min delay), 1 = slow (max delay).
     */
    getDelay() {
        // Invert speed: higher value = lower delay
        // Range: 1 (2000ms) to 100 (10ms)
        const maxDelay = 1000;
        const minDelay = 10;
        // speed is 1-100
        // simple mapping:
        // delay = max - (speed/100 * (max-min))
        // or just
        // delay factors. 
        // Let's rely on the speed property directly being the delay for now?
        // No, UI slider is 1-100.

        // Linear interpolation
        // speed 100 -> 10ms
        // speed 1 -> 1010ms
        return 1010 - (this.speed * 10);
    }

    setSpeed(value) {
        // value 1-100
        this.speed = parseInt(value);
    }

    pause() {
        this.paused = true;
    }

    play() {
        this.paused = false;
        if (this.resolver) {
            this.resolver();
            this.resolver = null;
        }
    }

    step() {
        // Execute one step then pause again
        if (this.resolver) {
            this.resolver();
            this.resolver = null;
            this.paused = true; // Ensure we stay paused after this step
        }
    }

    reset() {
        this.abortController.abort(); // Signal cancellation
        this.abortController = new AbortController(); // New signal
        this.paused = false;
        this.resolver = null;
    }
}
