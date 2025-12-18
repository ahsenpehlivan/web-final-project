import { AnimationController } from '../../core/AnimationController.js';

class TreeNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.height = 1; // For AVL
        this.x = 0;
        this.y = 0;
        this.domElement = null; // Associated DOM element
        this.id = Math.random().toString(36).substr(2, 9);
    }
}

export class TreeVisualizer {
    constructor(animationController) {
        this.ac = animationController;
        this.container = document.getElementById('tree-canvas');
        this.svgLayer = document.getElementById('tree-svg-layer');

        this.valueInput = document.getElementById('tree-value');

        this.btnInsert = document.getElementById('btn-tree-insert');
        this.btnFind = document.getElementById('btn-tree-find');
        this.btnDelete = document.getElementById('btn-tree-delete');
        this.btnTraverse = document.getElementById('btn-tree-traverse');
        this.btnReset = document.getElementById('btn-tree-reset');
        this.btnRandom = document.getElementById('btn-tree-random');

        this.logContainer = document.getElementById('tree-step-log');
        this.statNodes = document.getElementById('stats-tree-nodes');
        this.statHeight = document.getElementById('stats-tree-height');

        this.root = null;
        this.nodeCount = 0;

        this.bindEvents();
    }

    setType(type) {
        this.currentType = type;
        this.reset();
    }

    bindEvents() {
        this.btnInsert.onclick = () => this.handleInsert();
        this.btnFind.onclick = () => this.handleFind();
        this.btnDelete.onclick = () => this.handleDelete();
        this.btnTraverse.onclick = () => this.handleTraverse();
        this.btnReset.onclick = () => this.reset();
        this.btnRandom.onclick = () => this.generateRandom();

    }

    log(message) {
        const line = document.createElement('div');
        line.innerText = `> ${message}`;
        this.logContainer.appendChild(line);
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }

    reset() {
        this.container.innerHTML = '';
        // restore SVG layer which was inside container
        this.container.appendChild(this.svgLayer);
        this.svgLayer.innerHTML = '';

        this.root = null;
        this.nodeCount = 0;
        this.updateStats();
        this.log(`Initialized ${this.currentType.toUpperCase()}`);
    }

    updateStats() {
        this.statNodes.innerText = this.nodeCount;
        this.statHeight.innerText = this.getHeight(this.root);
    }

    getHeight(node) {
        if (!node) return 0;
        return node.height; // AVL usually maintains this, BST might need recalc but we'll maintain on insert
    }

    // --- Visualization Core ---

    createNodeElement(node) {
        const el = document.createElement('div');
        el.className = 'tree-node';
        el.innerText = node.value;
        el.id = `node-${node.id}`;
        this.container.appendChild(el);
        node.domElement = el;
        return el;
    }

    displayTree() {
        // Clear SVG lines
        this.svgLayer.innerHTML = '';

        if (!this.root) return;

        const width = this.container.clientWidth;
        // Simple recursive layout
        this.calculatePositions(this.root, width / 2, 40, width / 4);

        // Draw Edges first so they are behind nodes
        this.drawEdges(this.root);

        // Update DOM positions
        this.updateNodePositions(this.root);
    }

    calculatePositions(node, x, y, offset) {
        if (!node) return;
        node.x = x;
        node.y = y;

        this.calculatePositions(node.left, x - offset, y + 60, offset / 1.8);
        this.calculatePositions(node.right, x + offset, y + 60, offset / 1.8);
    }

    updateNodePositions(node) {
        if (!node) return;
        if (node.domElement) {
            node.domElement.style.left = `${node.x}px`;
            node.domElement.style.top = `${node.y}px`;
        }
        this.updateNodePositions(node.left);
        this.updateNodePositions(node.right);
    }

    drawEdges(node) {
        if (!node) return;
        if (node.left) {
            this.drawSVGLine(node.x, node.y, node.left.x, node.left.y);
            this.drawEdges(node.left);
        }
        if (node.right) {
            this.drawSVGLine(node.x, node.y, node.right.x, node.right.y);
            this.drawEdges(node.right);
        }
    }

    drawSVGLine(x1, y1, x2, y2) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        // Add offset for center of node (assuming node width ~40px)
        const offset = 20;
        line.setAttribute('x1', x1 + offset);
        line.setAttribute('y1', y1 + offset);
        line.setAttribute('x2', x2 + offset);
        line.setAttribute('y2', y2 + offset);
        line.setAttribute('stroke', '#64748b'); // var(--text-secondary)
        line.setAttribute('stroke-width', '2');
        this.svgLayer.appendChild(line);
    }

    async highlight(node, className) {
        if (node && node.domElement) {
            node.domElement.classList.add(className);
            await this.ac.sleep();
        }
    }

    async unhighlight(node, className) {
        if (node && node.domElement) {
            node.domElement.classList.remove(className);
        }
    }

    // --- BST Logic ---

    async handleInsert() {
        const val = parseInt(this.valueInput.value);
        if (isNaN(val)) return;

        this.log(`Inserting ${val}`);

        if (!this.root) {
            const newNode = new TreeNode(val);
            this.root = newNode;
            this.createNodeElement(newNode);
            this.nodeCount++;
            this.updateStats();
            this.displayTree();
            await this.highlight(newNode, 'active');
            await this.unhighlight(newNode, 'active');
            return;
        }

        this.root = await this.insertRecursive(this.root, val);
        this.displayTree();
        this.updateStats();
    }

    async insertRecursive(node, value) {
        await this.highlight(node, 'compare');

        if (value < node.value) {
            if (!node.left) {
                this.log(`${value} < ${node.value}, inserting left`);
                const newNode = new TreeNode(value);
                node.left = newNode;
                this.createNodeElement(newNode);
                this.nodeCount++;
            } else {
                this.log(`${value} < ${node.value}, go left`);
                await this.unhighlight(node, 'compare');
                node.left = await this.insertRecursive(node.left, value);
            }
        } else if (value > node.value) {
            if (!node.right) {
                this.log(`${value} > ${node.value}, inserting right`);
                const newNode = new TreeNode(value);
                node.right = newNode;
                this.createNodeElement(newNode);
                this.nodeCount++;
            } else {
                this.log(`${value} > ${node.value}, go right`);
                await this.unhighlight(node, 'compare');
                node.right = await this.insertRecursive(node.right, value);
            }
        } else {
            this.log(`${value} exists, skipping`);
        }

        await this.unhighlight(node, 'compare');

        // Update Height
        node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));

        // AVL Balance check
        if (this.currentType === 'avl') {
            return await this.balance(node);
        }

        return node;
    }

    // --- AVL Logic ---

    getBalance(node) {
        return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
    }

    async balance(node) {
        const balanceFactor = this.getBalance(node);

        // Left Heavy
        if (balanceFactor > 1) {
            if (this.getBalance(node.left) < 0) {
                this.log('Rotate Left-Right');
                node.left = await this.rotateLeft(node.left);
                this.displayTree(); await this.ac.sleep();
            }
            this.log('Rotate Right');
            return await this.rotateRight(node); // returns new root
        }

        // Right Heavy
        if (balanceFactor < -1) {
            if (this.getBalance(node.right) > 0) {
                this.log('Rotate Right-Left');
                node.right = await this.rotateRight(node.right);
                this.displayTree(); await this.ac.sleep();
            }
            this.log('Rotate Left');
            return await this.rotateLeft(node);
        }

        return node;
    }

    async rotateRight(y) {
        const x = y.left;
        const T2 = x.right;

        // Perform rotation
        x.right = y;
        y.left = T2;

        // Update heights
        y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;
        x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;

        // Visual update is handled by displayTree() calling logic after return
        return x;
    }

    async rotateLeft(x) {
        const y = x.right;
        const T2 = y.left;

        // Perform rotation
        y.left = x;
        x.right = T2;

        // Update heights
        x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;
        y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;

        return y;
    }

    // --- Search & Delete ---

    async handleFind() {
        const val = parseInt(this.valueInput.value);
        if (isNaN(val)) return;
        this.log(`Searching for ${val}`);
        const found = await this.findRecursive(this.root, val);
        if (found) {
            this.log(`Found ${val}!`);
            await this.highlight(found, 'found');
            await this.ac.sleep(1000);
            await this.unhighlight(found, 'found');
        } else {
            this.log(`${val} not found.`);
        }
    }

    async findRecursive(node, value) {
        if (!node) return null;
        await this.highlight(node, 'compare');
        await this.ac.sleep();
        await this.unhighlight(node, 'compare');

        if (value === node.value) return node;
        if (value < node.value) return await this.findRecursive(node.left, value);
        return await this.findRecursive(node.right, value);
    }

    async handleDelete() {
        // Basic BST Delete for now (simplification for AVL interactions to avoid chaos)
        // Or trigger standard recursive delete with re-balancing
        const val = parseInt(this.valueInput.value);
        if (isNaN(val)) return;
        this.log(`Deleting ${val}`);
        this.root = await this.deleteRecursive(this.root, val);
        this.displayTree();
        this.updateStats();
    }

    async deleteRecursive(node, value) {
        if (!node) return null;

        // Search Phase
        if (value < node.value) {
            node.left = await this.deleteRecursive(node.left, value);
        } else if (value > node.value) {
            node.right = await this.deleteRecursive(node.right, value);
        } else {
            // Found node
            await this.highlight(node, 'delete');
            await this.ac.sleep();
            this.log(`Deleting node ${node.value}`);

            // Case 1: Leaf or single child
            if (!node.left || !node.right) {
                const temp = node.left ? node.left : node.right;
                if (!temp) { // Leaf
                    node.domElement.remove();
                    return null;
                } else { // Single Child
                    node.domElement.remove();
                    return temp;
                }
            }

            // Case 2: Two children -> Get Inorder Successor (Smallest in Right Subtree)
            const temp = this.getMinValueNode(node.right);
            this.log(`Replaced with successor ${temp.value}`);
            node.value = temp.value;
            node.domElement.innerText = temp.value; // Visual update logic hack

            // Delete successor
            node.right = await this.deleteRecursive(node.right, temp.value);
        }

        if (!node) return null;

        // Update Height
        node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));

        // Balance if AVL
        if (this.currentType === 'avl') {
            return await this.balance(node);
        }
        return node;
    }

    getMinValueNode(node) {
        let current = node;
        while (current.left) current = current.left;
        return current;
    }

    async handleTraverse() {
        if (!this.root) return;
        this.log('Inorder Traversal:');
        await this.inorder(this.root);
    }

    async inorder(node) {
        if (!node) return;
        await this.inorder(node.left);

        await this.highlight(node, 'active');
        this.log(node.value);
        await this.ac.sleep();
        await this.unhighlight(node, 'active');

        await this.inorder(node.right);
    }

    destroy() {
        this.container.innerHTML = '';
        this.svgLayer.innerHTML = '';
        this.container.appendChild(this.svgLayer);
    }

    async generateRandom() {
        this.reset();
        const count = 6; // Not too many to avoid chaos layout
        this.log(`Generating ${count} random nodes...`);

        const values = new Set();
        while (values.size < count) {
            values.add(Math.floor(Math.random() * 99) + 1);
        }

        for (let val of values) {
            this.valueInput.value = val;
            await this.handleInsert();
            await this.ac.sleep();
        }
        this.valueInput.value = '';
    }
}
