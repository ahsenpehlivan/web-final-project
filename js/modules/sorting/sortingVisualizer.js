import { AnimationController } from '../../core/AnimationController.js';

export class SortingVisualizer {
    constructor(animationController) {
        this.ac = animationController;
        this.array = [];
        this.container = document.getElementById('sorting-canvas');
        this.sizeSlider = document.getElementById('array-size');
        this.speedSlider = document.getElementById('anim-speed');
        this.speedSlider = document.getElementById('anim-speed');
        this.currentAlgorithm = 'bubble'; // Default

        // Buttons
        this.btnGenerate = document.getElementById('btn-generate');
        this.btnPlay = document.getElementById('btn-play');
        this.btnPause = document.getElementById('btn-pause');
        this.btnReset = document.getElementById('btn-reset');

        // Stats
        this.statComparisons = document.getElementById('stats-comparisons');
        this.statSwaps = document.getElementById('stats-swaps');
        this.logContainer = document.getElementById('step-log');

        this.comparisons = 0;
        this.swaps = 0;

        this.bindEvents();
        this.generateArray();
    }

    bindEvents() {
        this.btnGenerate.onclick = () => {
            this.ac.reset();
            this.generateArray();
        };

        this.btnPlay.onclick = () => {
            if (this.ac.paused) {
                this.ac.play();
            } else {
                this.runAlgorithm();
            }
        };

        this.btnPause.onclick = () => this.ac.pause();
        this.btnReset.onclick = () => {
            this.ac.reset();
            this.resetStats();
            this.generateArray();
            this.log('Reset.');
        };

        this.sizeSlider.oninput = () => this.generateArray();
        this.speedSlider.oninput = (e) => this.ac.setSpeed(e.target.value);
    }

    generateArray() {
        this.resetStats();
        this.container.innerHTML = '';
        this.array = [];
        const size = parseInt(this.sizeSlider.value);

        for (let i = 0; i < size; i++) {
            // Random value 5-100
            const value = Math.floor(Math.random() * 95) + 5;
            this.array.push(value);

            const bar = document.createElement('div');
            bar.classList.add('sorting-bar');
            bar.style.height = `${value * 3}px`; // Scale for visibility
            // bar.innerText = value; // Optional: debug
            this.container.appendChild(bar);
        }
        this.log(`Generated new array of size ${size}`);
    }

    resetStats() {
        this.comparisons = 0;
        this.swaps = 0;
        this.updateStats();
        this.logContainer.innerText = '';
    }

    updateStats() {
        this.statComparisons.innerText = this.comparisons;
        this.statSwaps.innerText = this.swaps;
    }

    log(message) {
        const line = document.createElement('div');
        line.innerText = `> ${message}`;
        this.logContainer.appendChild(line);
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }

    getBars() {
        return document.querySelectorAll('.sorting-bar');
    }

    async runAlgorithm() {
        const algo = this.currentAlgorithm;
        this.log(`Starting ${algo} sort...`);
        this.ac.play(); // Ensure unpaused

        try {
            switch (algo) {
                case 'bubble':
                    await this.bubbleSort();
                    break;
                case 'selection':
                    await this.selectionSort();
                    break;
                case 'insertion':
                    await this.insertionSort();
                    break;
                // Add others
                default:
                    this.log('Algorithm not implemented yet.');
            }
            this.log('Sorting Completed!');
        } catch (e) {
            if (e.message === 'Animation Aborted') {
                this.log('Animation stopped.');
            } else {
                console.error(e);
            }
        }
    }



    setAlgorithm(algo) {
        this.currentAlgorithm = algo;
        this.log(`Selected algorithm: ${algo}`);
        this.ac.reset();
        this.resetStats();
        this.generateArray();
    }

    // --- Helper Methods for Animation ---

    async highlight(indices, className) {
        const bars = this.getBars();
        indices.forEach(i => bars[i].classList.add(className));
    }

    async unhighlight(indices, className) {
        const bars = this.getBars();
        indices.forEach(i => bars[i].classList.remove(className));
    }

    async swapVisual(i, j) {
        const bars = this.getBars();
        // Swap heights in DOM
        const tempHeight = bars[i].style.height;
        bars[i].style.height = bars[j].style.height;
        bars[j].style.height = tempHeight;

        this.swaps++;
        this.updateStats();
    }

    // --- Algorithms ---

    async bubbleSort() {
        const n = this.array.length;
        // working on a copy or directly on DOM? 
        // We need to keep this.array in sync if we use it for logic
        // But for visualization, we mainly care about indices.

        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                // Highlight comparison
                await this.highlight([j, j + 1], 'compare');
                this.log(`Comparing indices ${j} and ${j + 1}`);
                this.comparisons++;
                this.updateStats();
                this.updateStats();
                await this.ac.sleep();

                if (this.array[j] > this.array[j + 1]) {
                    // Swap logic
                    this.log(`Swapping ${this.array[j]} and ${this.array[j + 1]}`);
                    await this.highlight([j, j + 1], 'swap');

                    // Update internal array
                    let temp = this.array[j];
                    this.array[j] = this.array[j + 1];
                    this.array[j + 1] = temp;

                    // Update Visuals
                    await this.swapVisual(j, j + 1);
                    await this.ac.sleep();

                    await this.unhighlight([j, j + 1], 'swap');
                }

                await this.unhighlight([j, j + 1], 'compare');
            }
            // Mark last element as sorted
            const bars = this.getBars();
            bars[n - i - 1].classList.add('sorted');
        }
        this.getBars()[0].classList.add('sorted');
    }

    async selectionSort() {
        const n = this.array.length;
        for (let i = 0; i < n; i++) {
            let minIdx = i;
            this.highlight([i], 'pivot'); // Show current position
            await this.ac.sleep();

            for (let j = i + 1; j < n; j++) {
                this.highlight([j], 'compare');
                this.comparisons++;
                this.updateStats();
                this.updateStats();
                await this.ac.sleep();

                if (this.array[j] < this.array[minIdx]) {
                    if (minIdx !== i) this.unhighlight([minIdx], 'swap'); // Unmark old min
                    minIdx = j;
                    this.highlight([minIdx], 'swap'); // Mark new min
                    this.log(`New minimum found: ${this.array[j]}`);
                }

                this.unhighlight([j], 'compare');
            }

            if (minIdx !== i) {
                // Swap
                let temp = this.array[i];
                this.array[i] = this.array[minIdx];
                this.array[minIdx] = temp;
                await this.swapVisual(i, minIdx);
                this.swaps++;
                this.updateStats();
            }

            this.unhighlight([minIdx], 'swap');
            this.unhighlight([i], 'pivot');
            this.getBars()[i].classList.add('sorted');
        }
    }

    async insertionSort() {
        const n = this.array.length;
        for (let i = 1; i < n; i++) {
            let key = this.array[i];
            let j = i - 1;

            // Highlight key
            this.highlight([i], 'pivot');
            await this.ac.sleep();

            while (j >= 0 && this.array[j] > key) {
                this.highlight([j], 'compare');
                this.comparisons++;
                this.updateStats();
                this.updateStats();
                await this.ac.sleep();

                // Shift visual
                // conceptually array[j+1] = array[j]
                this.array[j + 1] = this.array[j];
                await this.swapVisual(j + 1, j); // visually moving j to j+1

                this.unhighlight([j], 'compare');
                j--;
            }
            this.array[j + 1] = key;
            this.unhighlight([i], 'pivot'); // actually it's likely moved, but for simplicity
            // In insertion sort, the sorted portion grows. 
            // Visualization is tricky because 'key' is technically out of the array in memory,
            // but in visual swap style we usually bubble it down.
        }
        // Mark all as sorted
        const bars = this.getBars();
        bars.forEach(b => b.classList.add('sorted'));
    }

    destroy() {
        // Cleanup if needed
        this.container.innerHTML = '';
        this.ac.reset();
    }
}
