import { AnimationController } from '../../core/AnimationController.js';

export class StackQueueVisualizer {
    constructor(animationController) {
        this.ac = animationController;
        this.containerBox = document.getElementById('sq-container-box');

        this.valueInput = document.getElementById('sq-value');

        this.btnPush = document.getElementById('btn-sq-push');
        this.btnPop = document.getElementById('btn-sq-pop');
        this.btnPeek = document.getElementById('btn-sq-peek');
        this.btnReset = document.getElementById('btn-sq-reset');
        this.btnRandom = document.getElementById('btn-sq-random');

        this.logContainer = document.getElementById('sq-step-log');
        this.statCount = document.getElementById('stats-sq-count');
        this.statTop = document.getElementById('stats-sq-top');

        this.currentType = 'stack'; // default

        this.data = []; // Internal storage

        this.bindEvents();
        this.initStructure();
    }

    setType(type) {
        this.currentType = type;
        this.initStructure();
    }

    bindEvents() {
        this.btnPush.onclick = () => this.handlePush();
        this.btnPop.onclick = () => this.handlePop();
        this.btnPeek.onclick = () => this.handlePeek();
        this.btnReset.onclick = () => this.initStructure();
        this.btnRandom.onclick = () => this.generateRandom();

    }

    log(message) {
        const line = document.createElement('div');
        line.innerText = `> ${message}`;
        this.logContainer.appendChild(line);
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }

    initStructure() {
        this.containerBox.innerHTML = '';
        this.data = [];
        this.updateStats();

        const type = this.currentType;
        this.containerBox.className = 'sq-container'; // reset
        if (type === 'stack') {
            this.containerBox.classList.add('stack-container');
            this.btnPush.innerText = 'Push';
            this.btnPop.innerText = 'Pop';
        } else {
            this.containerBox.classList.add('queue-container');
            this.btnPush.innerText = 'Enqueue';
            this.btnPop.innerText = 'Dequeue';
        }
        this.log(`Initialized ${type === 'stack' ? 'Stack' : 'Queue'}`);
    }

    updateStats() {
        this.statCount.innerText = this.data.length;
        if (this.data.length === 0) {
            this.statTop.innerText = '-';
        } else {
            // For Stack, Top is end of array. For Queue, Front is start of array.
            if (this.currentType === 'stack') {
                this.statTop.innerText = this.data[this.data.length - 1]; // Top
            } else {
                this.statTop.innerText = this.data[0]; // Front
            }
        }
    }

    createItem(value) {
        const item = document.createElement('div');
        item.className = 'sq-item';
        item.innerText = value;
        return item;
    }

    async handlePush() {
        const val = this.valueInput.value || Math.floor(Math.random() * 100);
        const type = this.currentType;
        if (this.data.length >= 10) { // Limit visualization size
            this.log('Structure full (max 10 for visualization)');
            return;
        }

        this.log(`${type === 'stack' ? 'Pushing' : 'Enqueuing'} ${val}`);

        const item = this.createItem(val);
        item.style.opacity = '0';
        item.style.transform = 'scale(0.5)';

        // Add to data
        this.data.push(val);

        // Add to DOM
        if (type === 'stack') {
            // Stack: Add to top (which is start of Flex-column-reverse container?)
            // Or Flex-column-reverse makes appendChild appear at top
            this.containerBox.appendChild(item);
        } else {
            // Queue: Append to end (right side)
            this.containerBox.appendChild(item);
        }

        await this.ac.sleep();
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
        item.classList.add('active'); // Highlight new

        await this.ac.sleep();
        item.classList.remove('active');
        this.updateStats();
    }

    async handlePop() {
        if (this.data.length === 0) {
            this.log('Structure is empty!');
            return;
        }

        const type = this.currentType;
        const items = this.containerBox.children;
        let targetItem;
        let val;

        if (type === 'stack') {
            // Stack: Pop from top (last child in DOM if flex-column-reverse)
            targetItem = items[items.length - 1];
            val = this.data.pop(); // Remove from end
            this.log(`Popped ${val}`);
        } else {
            // Queue: Dequeue from front (first child, left)
            targetItem = items[0];
            val = this.data.shift(); // Remove from start
            this.log(`Dequeued ${val}`);
        }

        targetItem.classList.add('delete');
        await this.ac.sleep();

        targetItem.remove();
        this.updateStats();
    }

    async handlePeek() {
        if (this.data.length === 0) {
            this.log('Structure is empty!');
            return;
        }

        const type = this.currentType;
        const items = this.containerBox.children;
        let targetItem;

        if (type === 'stack') {
            targetItem = items[items.length - 1];
            this.log(`Peeking Top: ${this.data[this.data.length - 1]}`);
        } else {
            targetItem = items[0];
            this.log(`Peeking Front: ${this.data[0]}`);
        }

        targetItem.classList.add('active');
        await this.ac.sleep();
        targetItem.classList.remove('active');
    }

    destroy() {
        this.containerBox.innerHTML = '';
    }

    async generateRandom() {
        this.initStructure();
        const count = 5;
        this.log(`Generating ${count} random items...`);

        for (let i = 0; i < count; i++) {
            const val = Math.floor(Math.random() * 99) + 1;
            // Hack to override input momentarily or just pass val if supported? 
            // My handlePush reads from input. Let's patch it or just set input value.
            this.valueInput.value = val;
            await this.handlePush();
            await this.ac.sleep();
        }
        this.valueInput.value = '';
    }
}
