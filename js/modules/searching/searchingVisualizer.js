import { AnimationController } from '../../core/AnimationController.js';

export class SearchingVisualizer {
    constructor(animationController) {
        this.ac = animationController;
        this.array = [];
        this.container = document.getElementById('searching-canvas');
        this.sizeSlider = document.getElementById('search-array-size');
        this.speedSlider = document.getElementById('search-speed');
        this.speedSlider = document.getElementById('search-speed');
        this.targetInput = document.getElementById('search-target');
        this.currentAlgorithm = 'linear'; // Default

        // Buttons
        this.btnGenerate = document.getElementById('btn-search-generate');
        this.btnPlay = document.getElementById('btn-search-play');
        this.btnPause = document.getElementById('btn-search-pause');
        this.btnReset = document.getElementById('btn-search-reset');

        // Stats
        this.statComparisons = document.getElementById('stats-search-comparisons');
        this.statStatus = document.getElementById('stats-search-status');
        this.logContainer = document.getElementById('search-step-log');

        this.comparisons = 0;

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
            this.clearVisuals();
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
        const isBinary = this.currentAlgorithm === 'binary';

        // Generate random numbers
        for (let i = 0; i < size; i++) {
            this.array.push(Math.floor(Math.random() * 99) + 1);
        }

        if (isBinary) {
            this.array.sort((a, b) => a - b);
        }

        // Render boxes
        this.array.forEach((value, index) => {
            const box = document.createElement('div');
            box.classList.add('search-box-item'); // We'll add this class in CSS
            box.innerText = value;
            box.dataset.index = index;
            this.container.appendChild(box);
        });

        this.log(`Generated ${isBinary ? 'Sorted' : 'Random'} array of size ${size}`);

        // Pick a random target to populate input for convenience
        const randomTarget = this.array[Math.floor(Math.random() * size)];
        this.targetInput.value = randomTarget;
    }

    resetStats() {
        this.comparisons = 0;
        this.statComparisons.innerText = '0';
        this.statStatus.innerText = 'Idle';
        this.statStatus.style.color = 'var(--text-secondary)';
        this.logContainer.innerText = '';
    }

    log(message) {
        const line = document.createElement('div');
        line.innerText = `> ${message}`;
        this.logContainer.appendChild(line);
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }



    setAlgorithm(algo) {
        this.currentAlgorithm = algo;
        this.generateArray(); // Logic changes (Sorted vs Random)
    }

    getBoxes() {
        return document.querySelectorAll('.search-box-item');
    }

    clearVisuals() {
        const boxes = this.getBoxes();
        boxes.forEach(b => {
            b.classList.remove('active', 'found', 'eliminated', 'range-start', 'range-end');
            b.style.opacity = '1';
        });
    }

    async runAlgorithm() {
        const algo = this.currentAlgorithm;
        const target = parseInt(this.targetInput.value);

        if (isNaN(target)) {
            this.log('Please enter a valid target number');
            return;
        }

        this.clearVisuals();
        this.ac.play();
        this.statStatus.innerText = 'Running...';
        this.statStatus.style.color = 'var(--warning)';

        try {
            if (algo === 'linear') {
                await this.linearSearch(target);
            } else {
                await this.binarySearch(target);
            }
        } catch (e) {
            if (e.message === 'Animation Aborted') {
                this.log('Search stopped.');
            } else {
                console.error(e);
            }
        }
    }

    async highlight(index, className) {
        const boxes = this.getBoxes();
        if (boxes[index]) boxes[index].classList.add(className);
    }

    async unhighlight(index, className) {
        const boxes = this.getBoxes();
        if (boxes[index]) boxes[index].classList.remove(className);
    }

    async linearSearch(target) {
        const n = this.array.length;

        for (let i = 0; i < n; i++) {
            this.log(`Checking index ${i} (Value: ${this.array[i]})`);
            await this.highlight(i, 'active');
            this.comparisons++;
            this.statComparisons.innerText = this.comparisons;
            await this.ac.sleep();

            if (this.array[i] === target) {
                this.log(`Target ${target} found at index ${i}!`);
                await this.highlight(i, 'found');
                await this.unhighlight(i, 'active');
                this.finish(true);
                return;
            }

            await this.unhighlight(i, 'active');
            // optional: mark checked as visited?
            // this.getBoxes()[i].style.opacity = '0.5';
        }

        this.log(`Target ${target} not found.`);
        this.finish(false);
    }

    async binarySearch(target) {
        let low = 0;
        let high = this.array.length - 1;
        const boxes = this.getBoxes();

        while (low <= high) {
            const mid = Math.floor((low + high) / 2);

            // Visualize Range
            this.log(`Range: [${low}, ${high}], Mid: ${mid} (${this.array[mid]})`);
            boxes[low].classList.add('range-start');
            boxes[high].classList.add('range-end');

            // Dim outside range
            for (let i = 0; i < this.array.length; i++) {
                if (i < low || i > high) {
                    boxes[i].classList.add('eliminated');
                } else {
                    boxes[i].classList.remove('eliminated');
                }
            }

            await this.highlight(mid, 'active'); // Mid
            this.comparisons++;
            this.statComparisons.innerText = this.comparisons;
            await this.ac.sleep();

            if (this.array[mid] === target) {
                this.log(`Target found at index ${mid}`);
                boxes[mid].classList.remove('active');
                boxes[mid].classList.add('found');
                this.finish(true);
                return;
            }

            if (this.array[mid] < target) {
                this.log(`${this.array[mid]} < ${target}, look right.`);
                low = mid + 1;
            } else {
                this.log(`${this.array[mid]} > ${target}, look left.`);
                high = mid - 1;
            }

            boxes[mid].classList.remove('active');
            boxes[Math.max(0, low - 1)].classList.remove('range-start'); // cleanup old range markers
            boxes[Math.min(this.array.length - 1, high + 1)].classList.remove('range-end');
        }

        this.log('Target not found.');
        this.finish(false);
    }

    finish(found) {
        this.statStatus.innerText = found ? 'Found!' : 'Not Found';
        this.statStatus.style.color = found ? 'var(--success)' : 'var(--danger)';
    }

    destroy() {
        this.container.innerHTML = '';
        this.ac.reset();
    }
}
