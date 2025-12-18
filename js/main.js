/**
 * Main Application Logic
 * Handles global state, navigation, and module loading.
 */

import { AnimationController } from './core/AnimationController.js';
import { SortingVisualizer } from './modules/sorting/sortingVisualizer.js';
import { SearchingVisualizer } from './modules/searching/searchingVisualizer.js';
import { LinkedListVisualizer } from './modules/linkedList/linkedListVisualizer.js';
import { ListVisualizer } from './modules/lists/listVisualizer.js';
import { StackQueueVisualizer } from './modules/stacksQueues/stackQueueVisualizer.js';
import { TreeVisualizer } from './modules/trees/treeVisualizer.js';
import { learningContent } from './data/learningContent.js';

class App {
    constructor() {
        this.currentModule = null;
        this.animationController = new AnimationController();
        this.dom = {
            navItems: document.querySelectorAll('.nav-item'),
            navSubItems: document.querySelectorAll('.nav-sub-item'),
            dashboardLinks: document.querySelectorAll('.dashboard-link'),
            views: document.querySelectorAll('.view'),
            pageTitle: document.getElementById('page-title'),
            themeToggle: document.getElementById('theme-toggle'),
        };

        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupTheme();

        // Render Dashboard Content
        this.renderDashboard();

        // Load default module or dashboard
        this.loadModule('dashboard');

        console.log('App Initialized');
    }

    setupNavigation() {
        // Main Items
        // Main Items (e.g., Dashboard)
        this.dom.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const moduleName = item.dataset.module;
                if (moduleName) this.loadModule(moduleName);
            });
        });

        // Sub Items
        this.dom.navSubItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const moduleName = item.dataset.module;
                const subType = item.dataset.sub;
                this.loadModule(moduleName, subType);
            });
        });

        // Dashboard Links (Delegation might be safer if content changed, but static is fine)
        // Re-query in case DOM wasn't ready in constructor (though it should be)
        const dashboardLinks = document.querySelectorAll('.dashboard-link');
        dashboardLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Allow text selection, only navigate on actual click
                const moduleName = link.dataset.module;
                const subType = link.dataset.sub;
                this.loadModule(moduleName, subType);
            });
        });


    }

    showContextInfo(value, module) {
        // Map selector values to learningContent keys if they differ
        let key = value;

        // Mappings
        if (module === 'sorting') key = value + '-sort'; // bubble -> bubble-sort
        if (module === 'searching') key = value + '-search'; // linear -> linear-search
        if (module === 'linked-list') key = value + '-linked-list';
        if (module === 'lists') key = value + '-list'; // static -> static-list

        // Trees & Stacks/Queues match directly (bst, avl, stack, queue)

        this.showInfo(key);
    }

    setupTheme() {
        // Simple theme toggle placeholder
        this.isDark = true;
        this.dom.themeToggle.addEventListener('click', () => {
            this.isDark = !this.isDark;
            document.body.style.filter = this.isDark ? 'none' : 'invert(1) hue-rotate(180deg)';
            this.dom.themeToggle.innerText = this.isDark ? '🌙' : '☀️';
        });
    }



    loadModule(moduleName, subType = null) {
        // Update Navigation UI (Main Links)
        this.dom.navItems.forEach(item => {
            if (item.dataset.module === moduleName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update Sub Links UI
        this.dom.navSubItems.forEach(item => {
            if (item.dataset.module === moduleName && (subType && item.dataset.sub === subType)) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Hide all views
        this.dom.views.forEach(view => {
            view.classList.remove('active');
        });

        // Show selected view
        // Show selected view
        const targetView = document.getElementById(`${moduleName}-view`);
        if (targetView) {
            targetView.classList.add('active');

            // Determine Title
            let title = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
            if (subType) {
                title = this.getDisplayName(subType, moduleName);
            } else {
                // Default Titles if no subType selected
                switch (moduleName) {
                    case 'sorting': title = 'Sorting Algorithms'; break;
                    case 'searching': title = 'Searching Algorithms'; break;
                    case 'linked-list': title = 'Linked Lists'; break;
                    case 'lists': title = 'Static vs Dynamic Lists'; break;
                    case 'stacks-queues': title = 'Stacks & Queues'; break;
                    case 'trees': title = 'Trees'; break;
                    case 'dashboard': title = 'Dashboard'; break;
                }
            }

            // Update Top Bar Title
            this.dom.pageTitle.innerText = title;

            // Update Module Specific Header
            const moduleTitle = document.getElementById(`${moduleName}-title`);
            if (moduleTitle) {
                moduleTitle.innerText = title;
            }
        }

        // Initialize Module Logic
        this.cleanupCurrentModule();

        switch (moduleName) {
            case 'sorting':
                this.currentModule = new SortingVisualizer(this.animationController);
                if (subType) this.currentModule.setAlgorithm(subType);
                break;
            case 'searching':
                this.currentModule = new SearchingVisualizer(this.animationController);
                if (subType) this.currentModule.setAlgorithm(subType);
                break;
            case 'linked-list':
                this.currentModule = new LinkedListVisualizer(this.animationController);
                if (subType) this.currentModule.setType(subType);
                break;
            case 'lists':
                this.currentModule = new ListVisualizer(this.animationController);
                if (subType) this.currentModule.setType(subType);
                break;
            case 'stacks-queues':
                this.currentModule = new StackQueueVisualizer(this.animationController);
                if (subType) this.currentModule.setType(subType);
                break;
            case 'trees':
                this.currentModule = new TreeVisualizer(this.animationController);
                if (subType) this.currentModule.setType(subType);
                break;
            // Add other cases here
            default:
                this.currentModule = null;
        }
    }

    cleanupCurrentModule() {
        if (this.currentModule && typeof this.currentModule.destroy === 'function') {
            this.currentModule.destroy();
        }
        this.animationController.reset(); // Stop any running animations
    }

    // Modal Logic
    showInfo(key) {
        const content = learningContent[key];
        if (!content) return;

        document.getElementById('modal-title').innerText = content.title;
        document.getElementById('modal-desc').innerText = content.description;

        // Complexity
        const comp = content.complexity;
        document.getElementById('comp-best').innerText = comp.best || comp.access || '-';
        document.getElementById('comp-avg').innerText = comp.average || comp.search || '-';
        document.getElementById('comp-worst').innerText = comp.worst || comp.insertion || '-';
        document.getElementById('comp-space').innerText = comp.space || comp.deletion || '-';

        if (comp.access) {
            const labels = document.querySelectorAll('.complexity-item .label');
            if (labels.length >= 4) {
                labels[0].innerText = 'Access';
                labels[1].innerText = 'Search';
                labels[2].innerText = 'Insertion';
                labels[3].innerText = 'Deletion';
            }
        } else {
            const labels = document.querySelectorAll('.complexity-item .label');
            if (labels.length >= 4) {
                labels[0].innerText = 'Best Case';
                labels[1].innerText = 'Average Case';
                labels[2].innerText = 'Worst Case';
                labels[3].innerText = 'Space Complexity';
            }
        }

        document.getElementById('modal-usage').innerText = content.usage;

        document.getElementById('info-modal').classList.remove('hidden');
    }

    closeInfo() {
        document.getElementById('info-modal').classList.add('hidden');
    }
    renderDashboard() {
        const grids = document.querySelectorAll('.info-grid[data-category]');

        grids.forEach(grid => {
            const categories = grid.dataset.category.split(',');
            grid.innerHTML = ''; // Clear existing

            categories.forEach(cat => {
                // Determine keys based on category
                let keys = [];
                if (cat === 'sorting') keys = ['bubble-sort', 'selection-sort', 'insertion-sort', 'merge-sort', 'quick-sort'];
                if (cat === 'searching') keys = ['linear-search', 'binary-search'];
                if (cat === 'linked-list') keys = ['singly-linked-list', 'doubly-linked-list', 'circular-linked-list'];
                if (cat === 'lists') keys = ['static-list', 'dynamic-list'];
                if (cat === 'stacks-queues') keys = ['stack', 'queue'];
                if (cat === 'trees') keys = ['bst', 'avl'];

                keys.forEach(key => {
                    const content = learningContent[key];
                    if (!content) return;

                    const card = document.createElement('div');
                    card.className = 'info-card dashboard-link';
                    // Re-construct module/sub identifiers from key for navigation
                    // This is a bit reverse-engineered but keeps data localized
                    let moduleName = cat;
                    let subType = key.replace('-sort', '').replace('-search', '').replace('-linked-list', '').replace('-list', '');

                    // Special case fixups if needed
                    if (cat === 'lists') {
                        moduleName = 'lists';
                        subType = key.includes('static') ? 'static' : 'dynamic';
                    }
                    if (cat === 'stacks-queues') {
                        moduleName = 'stacks-queues';
                    }
                    if (cat === 'trees') {
                        moduleName = 'trees';
                    }

                    card.dataset.module = moduleName;
                    card.dataset.sub = subType;

                    let icon = '❓';
                    if (key.includes('bubble')) icon = '🫧';
                    else if (key.includes('selection')) icon = '🎯';
                    else if (key.includes('insertion')) icon = '📥';
                    else if (key.includes('merge')) icon = '🔗';
                    else if (key.includes('quick')) icon = '⚡';
                    else if (key.includes('linear')) icon = '🔍';
                    else if (key.includes('binary')) icon = '➗';
                    else if (key.includes('singly')) icon = '➡️';
                    else if (key.includes('doubly')) icon = '↔️';
                    else if (key.includes('circular')) icon = '🔄';
                    else if (key.includes('static')) icon = '📦';
                    else if (key.includes('dynamic')) icon = '📈';
                    else if (key.includes('stack')) icon = '🥞';
                    else if (key.includes('queue')) icon = '🚶';
                    else if (key.includes('bst')) icon = '🌲';
                    else if (key.includes('avl')) icon = '⚖️';

                    // Complexity Text Generation (Compact)
                    let complexityText = '';
                    if (content.complexity) {
                        const c = content.complexity;
                        if (c.average && c.worst) {
                            complexityText = `Avg: <strong>${c.average}</strong> | Worst: <strong>${c.worst}</strong>`;
                        } else if (c.access && c.search) {
                            complexityText = `Acc: <strong>${c.access}</strong> | Srch: <strong>${c.search}</strong>`;
                        } else {
                            // Fallback
                            complexityText = 'Click to view details';
                        }
                    }

                    card.innerHTML = `
                        <div class="card-header">
                            <div class="card-icon">${icon}</div>
                            <h3>${content.title}</h3>
                        </div>
                        <div class="card-body">
                            ${content.description}
                        </div>
                        <div class="card-stats">
                            ${complexityText}
                        </div>
                        <div class="card-glow"></div>
                    `;

                    card.addEventListener('click', (e) => {
                        this.loadModule(moduleName, subType);
                    });

                    grid.appendChild(card);
                });
            });
        });
    }

    getDisplayName(subType, module) {
        const map = {
            // Sorting
            'bubble': 'Bubble Sort',
            'selection': 'Selection Sort',
            'insertion': 'Insertion Sort',
            'merge': 'Merge Sort',
            'quick': 'Quick Sort',
            // Searching
            'linear': 'Linear Search',
            'binary': 'Binary Search',
            // Linked List
            'singly': 'Singly Linked List',
            'doubly': 'Doubly Linked List',
            'circular': 'Circular Linked List',
            // Lists
            'static': 'Static Array',
            'dynamic': 'Dynamic Array',
            // Stacks/Queues
            'stack': 'Stack (LIFO)',
            'queue': 'Queue (FIFO)',
            // Trees
            'bst': 'Binary Search Tree',
            'avl': 'AVL Tree'
        };

        if (subType === 'dashboard') return 'Dashboard';

        return map[subType] || (subType.charAt(0).toUpperCase() + subType.slice(1));
    }
}

// Global App Instance
window.app = new App();
