import { AnimationController } from '../../core/AnimationController.js';

export class ListVisualizer {
    constructor(animationController) {
        this.ac = animationController;
        this.container = document.getElementById('lists-canvas');

        this.capacityInput = document.getElementById('list-capacity');
        this.valueInput = document.getElementById('list-value');
        this.indexInput = document.getElementById('list-index');

        this.btnAdd = document.getElementById('btn-list-add');
        this.btnGet = document.getElementById('btn-list-get');
        this.btnRemove = document.getElementById('btn-list-remove');
        this.btnReset = document.getElementById('btn-list-reset');
        this.btnRandom = document.getElementById('btn-list-random');

        this.logContainer = document.getElementById('list-step-log');
        this.statSize = document.getElementById('stats-list-size');
        this.statCapacity = document.getElementById('stats-list-capacity');

        this.data = []; // Actual data
        this.capacity = 5;
        this.size = 0;

        this.bindEvents();
        this.initList();
    }

    bindEvents() {
        this.btnAdd.onclick = () => this.handleAdd();
        this.btnRemove.onclick = () => this.handleRemove();
        this.btnGet.onclick = () => this.handleGet();
        this.btnReset.onclick = () => this.initList();
        this.btnRandom.onclick = () => this.generateRandom();
    }

    log(message) {
        const line = document.createElement('div');
        line.innerText = `> ${message}`;
        this.logContainer.appendChild(line);
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }



    setType(type) {
        this.currentType = type;
        this.initList();
    }

    initList() {
        this.container.innerHTML = '';
        this.capacity = parseInt(this.capacityInput.value) || 5;
        this.size = 0;
        this.data = new Array(this.capacity).fill(null);
        if (this.currentType === 'dynamic') {
            // Dynamic starts empty but with initial capacity
            this.size = 0;
        } else {
            // Static starts 'full' of null/empty slots implies fixed size
            this.size = this.capacity; // Conceptually size = capacity for static array access
            this.data.fill(0); // Initialize with 0s
        }

        this.renderGrid();
        this.updateStats();
        this.log(`Initialized ${this.currentType} list with capacity ${this.capacity}`);
    }

    renderGrid() {
        this.container.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'list-grid';

        for (let i = 0; i < this.capacity; i++) {
            const slot = document.createElement('div');
            slot.className = 'list-slot';
            slot.dataset.index = i;

            const idxLabel = document.createElement('div');
            idxLabel.className = 'slot-index';
            idxLabel.innerText = i;

            const valDiv = document.createElement('div');
            valDiv.className = 'slot-val';

            // logic for content
            if (this.currentType === 'dynamic') {
                if (i < this.size) {
                    valDiv.innerText = this.data[i];
                    slot.classList.add('filled');
                } else {
                    slot.classList.add('empty'); // capacity slot
                }
            } else {
                valDiv.innerText = this.data[i];
                slot.classList.add('filled'); // Static always 'filled'
            }

            slot.appendChild(idxLabel);
            slot.appendChild(valDiv);
            grid.appendChild(slot);
        }
        this.container.appendChild(grid);
    }

    getSlots() {
        return document.querySelectorAll('.list-slot');
    }

    updateStats() {
        this.statSize.innerText = this.size;
        this.statCapacity.innerText = this.capacity;
    }

    async handleAdd() {
        const val = parseInt(this.valueInput.value) || Math.floor(Math.random() * 100);
        const idx = parseInt(this.indexInput.value) || 0;
        if (this.currentType === 'static') {
            await this.setStatic(idx, val);
        } else {
            // Logic: if index is provided, insert at index? Or just push if index is ignored/default?
            // "Add" usually implies push for dynamic list unless Set is explicit. 
            // Let's assume standard ArrayList `add(val)` appends, `set(idx, val)` sets.
            // But we only have one button. Let's say if Index is 0 and Size > 0, we might strictly check user intent?
            // Let's implement Push for simplicity if Index is default/empty, Set if Index is valid?
            // Actually, let's just implement Push for Dynamic to demonstrate resizing.
            await this.pushDynamic(val);
        }
    }

    async setStatic(index, value) {
        if (index < 0 || index >= this.capacity) {
            this.log(`Index ${index} out of bounds (0-${this.capacity - 1})`);
            return;
        }
        this.log(`Setting arr[${index}] = ${value}`);

        const slots = this.getSlots();
        const slot = slots[index];
        const valDiv = slot.querySelector('.slot-val');

        slot.classList.add('active');
        await this.ac.sleep();

        this.data[index] = value;
        valDiv.innerText = value;
        valDiv.classList.add('highlight-text');

        await this.ac.sleep();
        slot.classList.remove('active');
        valDiv.classList.remove('highlight-text');
    }

    async pushDynamic(value) {
        if (this.size >= this.capacity) {
            await this.resize();
        }

        this.log(`Pushing ${value} at index ${this.size}`);
        this.data[this.size] = value;
        this.size++;

        this.renderGrid(); // Re-render to show update
        const slots = this.getSlots();
        const slot = slots[this.size - 1];

        slot.classList.add('active');
        await this.ac.sleep();
        slot.classList.remove('active');

        this.updateStats();
    }

    async resize() {
        this.log(`Capacity full! Resizing from ${this.capacity} to ${this.capacity * 2}`);
        const oldCapacity = this.capacity;
        this.capacity *= 2;

        // Visualize: maybe show new bigger grid appearing?
        // For now, just re-rendering with new capacity shows empty slots added
        const oldData = [...this.data];
        this.data = new Array(this.capacity).fill(null);

        this.renderGrid(); // Shows big empty grid

        // Copy Animation
        const slots = this.getSlots();
        for (let i = 0; i < this.size; i++) {
            this.log(`Copying index ${i}: ${oldData[i]}`);
            slots[i].classList.add('copying'); // Yellow or something
            await this.ac.sleep();

            this.data[i] = oldData[i];
            slots[i].querySelector('.slot-val').innerText = this.data[i];
            slots[i].classList.remove('copying');
            slots[i].classList.add('filled');
        }
        this.updateStats();
    }

    async handleRemove() {
        if (this.currentType === 'static') {
            const idx = parseInt(this.indexInput.value) || 0;
            await this.setStatic(idx, 0); // "Remove" in static just clears to 0?
        } else {
            const idx = parseInt(this.indexInput.value);
            if (isNaN(idx) || idx < 0 || idx >= this.size) {
                // Pop if invalid index?
                await this.popDynamic();
            } else {
                await this.removeDynamic(idx);
            }
        }
    }

    async popDynamic() {
        if (this.size === 0) {
            this.log('List empty');
            return;
        }
        this.log('Popping last element');
        const slots = this.getSlots();
        slots[this.size - 1].classList.add('delete');
        await this.ac.sleep();

        this.data[this.size - 1] = null;
        this.size--;
        this.renderGrid();
        this.updateStats();
    }

    async removeDynamic(index) {
        this.log(`Removing at index ${index}`);
        // Shift logic?
        const slots = this.getSlots();
        slots[index].classList.add('delete');
        await this.ac.sleep();

        // Shift
        for (let i = index; i < this.size - 1; i++) {
            this.data[i] = this.data[i + 1];
            // Visualize shift?
            slots[i].querySelector('.slot-val').innerText = this.data[i];
            await this.ac.sleep();
        }
        this.data[this.size - 1] = null;
        this.size--;
        this.renderGrid();
        this.updateStats();
    }

    async handleGet() {
        const idx = parseInt(this.indexInput.value) || 0;
        if (idx < 0 || idx >= this.capacity) { // capacity check for static, size for dynamic?
            this.log('Index out of bounds');
            return;
        }
        if (this.currentType === 'dynamic' && idx >= this.size) {
            this.log('Index out of bounds (current size)');
            return;
        }

        this.log(`Getting value at [${idx}]`);
        const slots = this.getSlots();
        slots[idx].classList.add('found'); // Green flash
        await this.ac.sleep();
        slots[idx].classList.remove('found');
    }

    destroy() {
        this.container.innerHTML = '';
    }

    async generateRandom() {
        this.log('Generating random data...');
        if (this.currentType === 'static') {
            // Fill all slots
            for (let i = 0; i < this.capacity; i++) {
                const val = Math.floor(Math.random() * 99) + 1;
                await this.setStatic(i, val);
                // small delay
                await this.ac.sleep();
            }
        } else {
            // Dynamic: add 5-8 items
            this.initList(); // Reset first
            const count = Math.floor(Math.random() * 4) + 5; // 5 to 8
            for (let i = 0; i < count; i++) {
                const val = Math.floor(Math.random() * 99) + 1;
                await this.pushDynamic(val);
                await this.ac.sleep();
            }
        }
    }
}
