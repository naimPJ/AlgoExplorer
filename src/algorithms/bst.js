// Pure functional BST — every operation returns { tree, steps }
// Tree node: { value, left: null, right: null }

export const insert = (root, value) => {
    const steps = [];
    const path = [];

    const rec = (node) => {
        if (!node) {
            steps.push({
                action: 'insert',
                path: [...path],
                currentValue: value,
                description: `Empty position found — inserting ${value}`,
            });
            return { value, left: null, right: null };
        }

        path.push(node.value);

        if (value === node.value) {
            steps.push({
                action: 'duplicate',
                path: [...path],
                currentValue: node.value,
                description: `${value} already exists in the tree — skipping`,
            });
            return node;
        }

        if (value < node.value) {
            steps.push({
                action: 'go_left',
                path: [...path],
                currentValue: node.value,
                description: `${value} < ${node.value} — going left`,
            });
            return { ...node, left: rec(node.left) };
        }

        steps.push({
            action: 'go_right',
            path: [...path],
            currentValue: node.value,
            description: `${value} > ${node.value} — going right`,
        });
        return { ...node, right: rec(node.right) };
    };

    const newTree = rec(root);
    if (steps.length) steps[steps.length - 1].treeAfter = newTree;
    return { tree: newTree, steps };
};

export const search = (root, value) => {
    const steps = [];
    const path = [];

    const rec = (node) => {
        if (!node) {
            steps.push({
                action: 'not_found',
                path: [...path],
                currentValue: null,
                description: `${value} not found in the tree`,
            });
            return false;
        }

        path.push(node.value);

        if (value === node.value) {
            steps.push({
                action: 'found',
                path: [...path],
                currentValue: node.value,
                description: `Found ${value}!`,
            });
            return true;
        }

        if (value < node.value) {
            steps.push({
                action: 'go_left',
                path: [...path],
                currentValue: node.value,
                description: `${value} < ${node.value} — searching left`,
            });
            return rec(node.left);
        }

        steps.push({
            action: 'go_right',
            path: [...path],
            currentValue: node.value,
            description: `${value} > ${node.value} — searching right`,
        });
        return rec(node.right);
    };

    const found = rec(root);
    return { tree: root, found, steps };
};

export const remove = (root, value) => {
    const steps = [];
    const path = [];

    const findMin = (node) => {
        while (node.left) node = node.left;
        return node;
    };

    // Removes the minimum node from a subtree (used for successor removal)
    const removeMin = (node) => {
        if (!node.left) return node.right;
        return { ...node, left: removeMin(node.left) };
    };

    const rec = (node) => {
        if (!node) {
            steps.push({
                action: 'not_found',
                path: [...path],
                currentValue: null,
                description: `${value} not found in the tree`,
            });
            return null;
        }

        path.push(node.value);

        if (value < node.value) {
            steps.push({
                action: 'go_left',
                path: [...path],
                currentValue: node.value,
                description: `${value} < ${node.value} — going left`,
            });
            return { ...node, left: rec(node.left) };
        }

        if (value > node.value) {
            steps.push({
                action: 'go_right',
                path: [...path],
                currentValue: node.value,
                description: `${value} > ${node.value} — going right`,
            });
            return { ...node, right: rec(node.right) };
        }

        // Found
        steps.push({
            action: 'found',
            path: [...path],
            currentValue: node.value,
            description: `Found ${value}`,
        });

        if (!node.left && !node.right) {
            steps.push({
                action: 'delete_leaf',
                path: [...path],
                currentValue: node.value,
                description: `${value} is a leaf — removing it`,
            });
            return null;
        }

        if (!node.left) {
            steps.push({
                action: 'delete_one_child',
                path: [...path],
                currentValue: node.value,
                description: `${value} has only a right child — replacing with it`,
            });
            return node.right;
        }

        if (!node.right) {
            steps.push({
                action: 'delete_one_child',
                path: [...path],
                currentValue: node.value,
                description: `${value} has only a left child — replacing with it`,
            });
            return node.left;
        }

        // Two children: find inorder successor (min of right subtree)
        const successor = findMin(node.right);
        steps.push({
            action: 'find_successor',
            path: [...path],
            currentValue: node.value,
            successorValue: successor.value,
            description: `${value} has two children — inorder successor is ${successor.value} (smallest in right subtree)`,
        });
        steps.push({
            action: 'replace_with_successor',
            path: [...path],
            currentValue: successor.value,
            description: `Replacing ${value} with ${successor.value}, then removing ${successor.value} from right subtree`,
        });

        return {
            ...node,
            value: successor.value,
            right: removeMin(node.right),
        };
    };

    const newTree = rec(root);
    if (steps.length) steps[steps.length - 1].treeAfter = newTree;
    return { tree: newTree, steps };
};

export const traverse = (root, type) => {
    const steps = [];
    const result = [];

    const inorder = (node) => {
        if (!node) return;
        inorder(node.left);
        result.push(node.value);
        steps.push({
            action: 'traverse_visit',
            path: [],
            currentValue: node.value,
            result: [...result],
            description: `Visiting ${node.value}`,
        });
        inorder(node.right);
    };

    const preorder = (node) => {
        if (!node) return;
        result.push(node.value);
        steps.push({
            action: 'traverse_visit',
            path: [],
            currentValue: node.value,
            result: [...result],
            description: `Visiting ${node.value}`,
        });
        preorder(node.left);
        preorder(node.right);
    };

    const postorder = (node) => {
        if (!node) return;
        postorder(node.left);
        postorder(node.right);
        result.push(node.value);
        steps.push({
            action: 'traverse_visit',
            path: [],
            currentValue: node.value,
            result: [...result],
            description: `Visiting ${node.value}`,
        });
    };

    if (type === 'inorder')   inorder(root);
    if (type === 'preorder')  preorder(root);
    if (type === 'postorder') postorder(root);

    const label = type.charAt(0).toUpperCase() + type.slice(1);
    steps.push({
        action: 'traverse_done',
        path: [],
        currentValue: null,
        result: [...result],
        description: `${label} traversal complete: [${result.join(' → ')}]`,
    });

    return { tree: root, steps, result };
};

// Instantly build a tree from an array of values (no steps — used for random generation)
export const buildTree = (values) => {
    let root = null;
    values.forEach(v => {
        root = insert(root, v).tree;
    });
    return root;
};
