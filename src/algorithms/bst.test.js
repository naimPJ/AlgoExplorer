import { describe, it, expect } from 'vitest';
import { insert, search, remove, traverse, buildTree } from './bst';

// Tree shape used across tests:
//        5
//      /   \
//     3     8
//    / \   / \
//   1   4 7   9
const buildSample = () => buildTree([5, 3, 8, 1, 4, 7, 9]);

describe('insert', () => {
    it('inserts into an empty tree as the root', () => {
        const { tree, steps } = insert(null, 10);
        expect(tree).toEqual({ value: 10, left: null, right: null });
        expect(steps[steps.length - 1].action).toBe('insert');
    });

    it('descends left/right to find the correct empty slot', () => {
        const root = buildSample();
        const { tree } = insert(root, 6);
        // 6 should land as the left child of 7 (5 -> right(8) -> left(7) -> left)
        expect(tree.right.left.left).toEqual({ value: 6, left: null, right: null });
    });

    it('marks a duplicate value without changing the tree', () => {
        const root = buildSample();
        const { tree, steps } = insert(root, 5);
        expect(tree).toEqual(root);
        expect(steps[steps.length - 1].action).toBe('duplicate');
    });

    it('attaches the resulting tree only to the final step', () => {
        const root = buildSample();
        const { steps } = insert(root, 6);
        steps.slice(0, -1).forEach((s) => expect(s.treeAfter).toBeUndefined());
        expect(steps[steps.length - 1].treeAfter).toBeDefined();
    });
});

describe('search', () => {
    it('finds a value that exists and records the path to it', () => {
        const root = buildSample();
        const { found, steps } = search(root, 7);
        expect(found).toBe(true);
        expect(steps[steps.length - 1].action).toBe('found');
        // path includes every visited node, including the found node itself
        expect(steps[steps.length - 1].path).toEqual([5, 8, 7]);
    });

    it('reports not found for a missing value', () => {
        const root = buildSample();
        const { found, steps } = search(root, 42);
        expect(found).toBe(false);
        expect(steps[steps.length - 1].action).toBe('not_found');
    });

    it('reports not found on an empty tree', () => {
        const { found } = search(null, 1);
        expect(found).toBe(false);
    });
});

describe('remove', () => {
    it('removes a leaf node', () => {
        const root = buildSample();
        const { tree, steps } = remove(root, 1);
        expect(tree.left.left).toBeNull();
        expect(steps[steps.length - 1].action).toBe('delete_leaf');
    });

    it('removes a node with a single child', () => {
        // give 8 a single child by removing 9 first, then remove 8 (only left child 7 remains)
        let root = buildSample();
        root = remove(root, 9).tree;
        const { tree } = remove(root, 8);
        expect(tree.right).toEqual({ value: 7, left: null, right: null });
    });

    it('removes a node with two children via inorder successor', () => {
        const root = buildSample();
        const { tree, steps } = remove(root, 3);
        // inorder successor of 3 (right subtree = {4}) is 4; 4 takes 3's place,
        // keeps 3's original left child (1), and loses its own (empty) right slot
        expect(tree.left.value).toBe(4);
        expect(tree.left.left.value).toBe(1);
        expect(tree.left.right).toBeNull();
        expect(steps.some((s) => s.action === 'find_successor' && s.successorValue === 4)).toBe(true);
    });

    it('reports not found when removing a missing value', () => {
        const root = buildSample();
        const { tree, steps } = remove(root, 42);
        expect(tree).toEqual(root);
        expect(steps[steps.length - 1].action).toBe('not_found');
    });
});

describe('traverse', () => {
    const root = buildSample();

    it('inorder visits values in ascending order', () => {
        const { result } = traverse(root, 'inorder');
        expect(result).toEqual([1, 3, 4, 5, 7, 8, 9]);
    });

    it('preorder visits root before children', () => {
        const { result } = traverse(root, 'preorder');
        expect(result).toEqual([5, 3, 1, 4, 8, 7, 9]);
    });

    it('postorder visits children before root', () => {
        const { result } = traverse(root, 'postorder');
        expect(result).toEqual([1, 4, 3, 7, 9, 8, 5]);
    });

    it('only attaches treeAfter-equivalent completion to the final step', () => {
        const { steps } = traverse(root, 'inorder');
        expect(steps[steps.length - 1].action).toBe('traverse_done');
        steps.slice(0, -1).forEach((s) => expect(s.action).toBe('traverse_visit'));
    });
});

describe('buildTree', () => {
    it('returns null for an empty array', () => {
        expect(buildTree([])).toBeNull();
    });

    it('builds a BST honoring insertion order', () => {
        const tree = buildTree([2, 1, 3]);
        expect(tree).toEqual({
            value: 2,
            left: { value: 1, left: null, right: null },
            right: { value: 3, left: null, right: null },
        });
    });
});
