import { AnimationController } from '../../core/AnimationController.js';

export class LinkedListVisualizer {
    constructor(animationController) {
        this.ac = animationController;
        this.container = document.getElementById('ll-canvas');
        this.currentType = 'singly'; // Default
        this.opSelect = document.getElementById('ll-operation-select');
        this.valueInput = document.getElementById('ll-value');
        this.indexInput = document.getElementById('ll-index');

        this.btnRun = document.getElementById('btn-ll-run');
        this.btnReset = document.getElementById('btn-ll-reset');
        this.btnRandom = document.getElementById('btn-ll-random'); // New

        this.logContainer = document.getElementById('ll-step-log');

        this.head = null;
        this.size = 0;

        // Node Structure: { value, next, prev, id, domElement }

        this.bindEvents();
        this.initList();
    }




    setType(type) {
        this.currentType = type;
        this.initList();
    }

    initList() {
        this.container.innerHTML = '';
        this.head = null;
        this.size = 0;
        this.log('Reset Linked List.');
    }

    get isCircular() {
        return this.currentType === 'circular';
    }

    bindEvents() {
        this.btnRun.onclick = async () => {
            if (this.ac.paused && this.ac.resolver) {
                this.ac.play();
                return;
            }
            await this.executeOperation();
        };

        this.btnReset.onclick = () => {
            this.ac.reset();
            this.initList();
        };

        this.btnRandom.onclick = () => this.generateRandom();


    }

    log(message) {
        const line = document.createElement('div');
        line.innerText = `> ${message}`;
        this.logContainer.appendChild(line);
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }

    createNodeElement(value) {
        const node = document.createElement('div');
        node.classList.add('ll-node');

        const valueDiv = document.createElement('div');
        valueDiv.classList.add('ll-val');
        valueDiv.innerText = value;

        const pointerDiv = document.createElement('div');
        pointerDiv.classList.add('ll-pointer');

        node.appendChild(valueDiv);
        node.appendChild(pointerDiv);

        // If doubly, add prev pointer visual? 
        // For simplicity now, we'll just change the arrow style in CSS based on class
        if (this.currentType === 'doubly') {
            node.classList.add('doubly');
        }

        return node;
    }

    updateCircularVisuals() {
        if (!this.isCircular) return;

        const nodes = this.container.children;
        // Remove existing circular markers
        Array.from(nodes).forEach(n => n.classList.remove('circular-tail'));

        if (nodes.length > 0) {
            nodes[nodes.length - 1].classList.add('circular-tail');
        }
    }

    async executeOperation() {
        const op = this.opSelect.value;
        const val = this.valueInput.value || Math.floor(Math.random() * 100);
        const idx = parseInt(this.indexInput.value) || 0;

        try {
            switch (op) {
                case 'insert-head': await this.insertHead(val); break;
                case 'insert-tail': await this.insertTail(val); break;
                case 'insert-index': await this.insertIndex(val, idx); break;
                case 'delete-head': await this.deleteHead(); break;
                case 'delete-tail': await this.deleteTail(); break;
                case 'delete-index': await this.deleteIndex(idx); break;
            }
        } catch (e) {
            console.error(e);
        }
    }

    async highlight(node, className = 'active') {
        if (node && node.domElement) {
            node.domElement.classList.add(className);
        }
    }

    async unhighlight(node, className = 'active') {
        if (node && node.domElement) {
            node.domElement.classList.remove(className);
        }
    }

    // --- Operations ---

    async insertHead(value) {
        this.log(`Inserting ${value} at Head`);
        const newNode = {
            value: value,
            next: null,
            prev: null,
            domElement: this.createNodeElement(value)
        };

        newNode.domElement.style.opacity = '0';
        this.container.prepend(newNode.domElement);

        // Animation
        await this.ac.sleep();
        newNode.domElement.style.opacity = '1';
        await this.highlight(newNode, 'active');
        await this.ac.sleep();

        if (this.head) {
            newNode.next = this.head;
            this.head.prev = newNode;
            // Visual: update arrows? HTML structure flow handles next automatically for singly
        } else {
            // If circular and first node, it points to itself?
            // Visually we often just show it pointing to null until >1 nodes or just mark it as tail
        }

        this.head = newNode;
        this.size++;

        this.updateCircularVisuals();
        await this.unhighlight(newNode, 'active');
    }

    async insertTail(value) {
        if (!this.head) {
            await this.insertHead(value);
            return;
        }

        this.log(`Inserting ${value} at Tail`);
        let current = this.head;

        // Traverse
        // For circular, we stop when next is head or null (if we simulate linear array for visual)
        // Since we are visually linear, iterate DOM logic based on size
        for (let i = 0; i < this.size - 1; i++) {
            // current = current.next in logic, but here we just traverse logic if connected
            // But simpler: just traverse `current` tracking variable
            if (current.next) {
                await this.highlight(current, 'active');
                await this.ac.sleep();
                await this.unhighlight(current, 'active');
                current = current.next;
            }
        }

        await this.highlight(current, 'active'); // Last node

        const newNode = {
            value: value,
            next: null,
            prev: current,
            domElement: this.createNodeElement(value)
        };

        newNode.domElement.style.opacity = '0';
        this.container.appendChild(newNode.domElement);
        await this.ac.sleep();

        newNode.domElement.style.opacity = '1';
        current.next = newNode;

        if (this.isCircular) {
            newNode.next = this.head; // Logic
        }

        await this.unhighlight(current, 'active');
        this.size++;
        this.updateCircularVisuals();
    }

    async insertIndex(value, index) {
        if (index < 0 || index > this.size) {
            this.log('Index out of bounds');
            return;
        }
        if (index === 0) return this.insertHead(value);
        if (index === this.size) return this.insertTail(value);

        this.log(`Inserting ${value} at index ${index}`);
        let current = this.head;
        let prev = null;
        let i = 0;

        // Traverse to index
        while (i < index) {
            await this.highlight(current, 'active');
            await this.ac.sleep();
            await this.unhighlight(current, 'active');
            prev = current;
            current = current.next;
            i++;
        }

        // Stop at `prev` and `current` (which will be next)
        await this.highlight(prev, 'active'); // insertion point

        const newNode = {
            value: value,
            next: current,
            prev: prev,
            domElement: this.createNodeElement(value)
        };

        // Insert in DOM
        // container.insertBefore(newNode, current.domElement)
        this.container.insertBefore(newNode.domElement, current.domElement);

        prev.next = newNode;
        current.prev = newNode;

        this.size++;
        await this.ac.sleep();
        await this.unhighlight(prev, 'active');
    }

    async deleteHead() {
        if (!this.head) {
            this.log('List is empty');
            return;
        }
        this.log('Deleting Head');

        const target = this.head;
        await this.highlight(target, 'delete');
        await this.ac.sleep();

        this.head = target.next;
        if (this.head) {
            this.head.prev = null;
            // update tail next if circular? 
            // In linear visualization, we don't have to explicitly update the *tail's* DOM next pointer 
            // because the tail node stays at the end of the container. 
            // We only update the 'circular-tail' marker.
        }
        this.size--;

        target.domElement.remove();
        this.updateCircularVisuals();
    }

    async deleteTail() {
        if (!this.head) return;
        if (!this.head.next || this.head.next === this.head) return this.deleteHead(); // Single element

        this.log('Deleting Tail');
        let current = this.head;
        // Traverse to second to last
        // For visual linear rep, traverse size-2
        for (let i = 0; i < this.size - 2; i++) {
            await this.highlight(current, 'active');
            await this.ac.sleep();
            await this.unhighlight(current, 'active');
            current = current.next;
        }

        // current is now second to last
        let tail = current.next;
        await this.highlight(tail, 'delete');
        await this.ac.sleep();

        current.next = this.head; // Circular logic
        if (current.prev) current.prev.next = current; // Doubly logic cleanup not really needed for next

        this.size--;
        tail.domElement.remove();
        this.updateCircularVisuals();
    }

    async deleteIndex(index) {
        if (index < 0 || index >= this.size) {
            this.log('Index out of bounds');
            return;
        }
        if (index === 0) return this.deleteHead();
        if (index === this.size - 1) return this.deleteTail();

        this.log(`Deleting node at index ${index}`);
        let current = this.head;
        let i = 0;

        while (i < index) {
            await this.highlight(current, 'active');
            await this.ac.sleep();
            await this.unhighlight(current, 'active');
            current = current.next;
            i++;
        }

        await this.highlight(current, 'delete');
        await this.ac.sleep();

        current.prev.next = current.next;
        current.next.prev = current.prev;

        this.size--;
        current.domElement.remove();
        this.updateCircularVisuals();
    }

    destroy() {
        this.container.innerHTML = '';
    }

    async generateRandom() {
        this.initList(); // Clear
        const count = 5;
        this.log(`Generating ${count} random nodes...`);
        for (let i = 0; i < count; i++) {
            const val = Math.floor(Math.random() * 99) + 1;
            // We'll just append directly visually to speed it up, or call insertTail?
            // Calling insertTail is easiest but might be slow if speed is low.
            // Let's speed it up temporarily?
            // For now standard insertTail is fine, user can set speed.
            await this.insertTail(val);
            await this.ac.sleep();
        }
    }
}
