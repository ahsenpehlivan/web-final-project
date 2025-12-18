export const learningContent = {
    // Sorting
    'bubble-sort': {
        title: 'Bubble Sort',
        description: 'A simple sorting algorithm. Repeatedly swaps adjacent elements if they are wrong. Best case O(n) applies only with an "early-exit" flag optimization.',
        complexity: {
            best: 'O(n) (optimized)',
            average: 'O(n²)',
            worst: 'O(n²)',
            space: 'O(1)'
        },
        usage: 'Educational purposes, small datasets where simplicity is key.'
    },
    'selection-sort': {
        title: 'Selection Sort',
        description: 'Sorts an array by repeatedly finding the minimum element (considering ascending order) from unsorted part and putting it at the beginning.',
        complexity: {
            best: 'O(n²)',
            average: 'O(n²)',
            worst: 'O(n²)',
            space: 'O(1)'
        },
        usage: 'Simple implementation, good for small lists where swap cost is high.'
    },
    'insertion-sort': {
        title: 'Insertion Sort',
        description: 'Builds the final sorted array one item at a time. Efficient for small or mostly sorted data.',
        complexity: {
            best: 'O(n)',
            average: 'O(n²)',
            worst: 'O(n²)',
            space: 'O(1)'
        },
        usage: 'Small datasets, or when the array is already mostly sorted.'
    },
    'merge-sort': {
        title: 'Merge Sort',
        description: 'A divide and conquer algorithm that divides the input array into two halves, calls itself for the two halves, and then merges the two sorted halves.',
        complexity: {
            best: 'O(n log n)',
            average: 'O(n log n)',
            worst: 'O(n log n)',
            space: 'O(n)'
        },
        usage: 'Sorting linked lists, external sorting (large datasets).'
    },
    'quick-sort': {
        title: 'Quick Sort',
        description: 'A divide and conquer algorithm. It picks an element as pivot and partitions the given array around the picked pivot.',
        complexity: {
            best: 'O(n log n)',
            average: 'O(n log n)',
            worst: 'O(n²)',
            space: 'O(log n)'
        },
        usage: 'General purpose sorting, widely used in system libraries.'
    },

    // Searching
    'linear-search': {
        title: 'Linear Search',
        description: 'Sequentially checks each element of the list until a match is found or the whole list has been searched.',
        complexity: {
            best: 'O(1)',
            average: 'O(n)',
            worst: 'O(n)',
            space: 'O(1)'
        },
        usage: 'Unsorted small lists, searching in a stream of data.'
    },
    'binary-search': {
        title: 'Binary Search',
        description: 'Search a sorted array by repeatedly dividing the search interval in half.',
        complexity: {
            best: 'O(1)',
            average: 'O(log n)',
            worst: 'O(log n)',
            space: 'O(1)'
        },
        usage: 'Searching in sorted arrays, dictionary lookup.'
    },

    // Data Structures
    'singly-linked-list': {
        title: 'Singly Linked List',
        description: 'A linear data structure where each element collects a value and a reference to the next element.',
        complexity: {
            access: 'O(n)',
            search: 'O(n)',
            insertion: 'O(1) (head) / O(n) (no ref)',
            deletion: 'O(1) (head) / O(n) (no ref)'
        },
        usage: 'Dynamic memory allocation, implementing stacks/queues.'
    },
    'doubly-linked-list': {
        title: 'Doubly Linked List',
        description: 'A linked list where each node contains a pointer to the next node and the previous node.',
        complexity: {
            access: 'O(n)',
            search: 'O(n)',
            insertion: 'O(1) (w/ ref) / O(n) (search)',
            deletion: 'O(1) (w/ ref) / O(n) (search)'
        },
        usage: 'Browser history (back/forward), music players (prev/next).'
    },
    'circular-linked-list': {
        title: 'Circular Linked List',
        description: 'A linked list where all nodes are connected to form a circle. There is no NULL at the end.',
        complexity: {
            access: 'O(n)',
            search: 'O(n)',
            insertion: 'O(1) (w/ ref) / O(n)',
            deletion: 'O(1) (w/ ref) / O(n)'
        },
        usage: 'Round-robin scheduling, multiplayer games turn management.'
    },
    'stack': {
        title: 'Stack',
        description: 'A linear data structure which follows a particular order in which the operations are performed: LIFO (Last In First Out).',
        complexity: {
            access: 'O(n)',
            search: 'O(n)',
            insertion: 'O(1) (Push)',
            deletion: 'O(1) (Pop)'
        },
        usage: 'Function calls (recursion), undo mechanisms, expression parsing.'
    },
    'queue': {
        title: 'Queue',
        description: 'A linear structure which follows a particular order in which the operations are performed: FIFO (First In First Out).',
        complexity: {
            access: 'O(n)',
            search: 'O(n)',
            insertion: 'O(1) (Enqueue)',
            deletion: 'O(1) (Dequeue)'
        },
        usage: 'Task scheduling, printer spooling, breadth-first search.'
    },
    'static-list': {
        title: 'Static Array',
        description: 'A collection of items stored at contiguous memory locations. Size is fixed.',
        complexity: {
            access: 'O(1)',
            search: 'O(n)',
            insertion: 'O(n) (shift) / Fixed Size',
            deletion: 'O(n) (shift)'
        },
        usage: 'Storing fixed-size data, lookup tables.'
    },
    'dynamic-list': {
        title: 'Dynamic Array (ArrayList)',
        description: 'An array that resizes itself. Offers index-based access in O(1) time.',
        complexity: {
            access: 'O(1)',
            search: 'O(n)',
            insertion: 'O(1) (Amortized)',
            deletion: 'O(n)'
        },
        usage: 'General purpose list storage where size is unknown.'
    },
    'bst': {
        title: 'Binary Search Tree',
        description: 'A node-based binary tree data structure. Left subtree < node < Right subtree.',
        complexity: {
            access: 'O(h) / Worst O(n)',
            search: 'O(h) / Worst O(n)',
            insertion: 'O(h) / Worst O(n)',
            deletion: 'O(h) / Worst O(n)'
        },
        usage: 'Hierarchical data storage, efficient searching/sorting.'
    },
    'avl': {
        title: 'AVL Tree',
        description: 'A self-balancing Binary Search Tree where the difference between heights of left and right subtrees cannot be more than one.',
        complexity: {
            access: 'O(log n)',
            search: 'O(log n)',
            insertion: 'O(log n)',
            deletion: 'O(log n)'
        },
        usage: 'Databases where frequent lookups are required.'
    }
};
