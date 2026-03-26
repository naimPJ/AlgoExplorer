# AlgoExplorer

An interactive algorithm visualizer built as a **Senior Design Project** at the International Burch University, developed under the mentorship of **STA Aldin Kovacevic**.

AlgoExplorer lets you watch sorting algorithms and data structures operate step by step — every comparison, swap, merge, and tree traversal is animated in real time with a live execution log that records the full history of what happened.

---

## Features

### Sorting Algorithms
Nine classic algorithms are available, each with animated bar charts and a color-coded execution log:

| Algorithm | Category | Time (avg) | Space |
|---|---|---|---|
| Bubble Sort | Comparison | O(n²) | O(1) |
| Selection Sort | Comparison | O(n²) | O(1) |
| Insertion Sort | Comparison | O(n²) | O(1) |
| Shell Sort | Comparison | O(n log² n) | O(1) |
| Merge Sort | Divide & Conquer | O(n log n) | O(n) |
| Bottom-Up Merge Sort | Divide & Conquer | O(n log n) | O(n) |
| Quick Sort | Divide & Conquer | O(n log n) | O(n) |
| Radix Sort | Non-comparison | O(nk) | O(n+k) |
| Counting Sort | Non-comparison | O(n+k) | O(k) |

- Enter your own array (comma-separated) or use the default
- Step through at adjustable speed (0.5×, 1×, 2×, 3×)
- Pause and resume at any point
- Execution log stacks every step — compare, swap, pivot, merge — so you can review the full operation history

Merge sort algorithms get a dedicated split/merge canvas that visualizes the recursive partition state with colored segment blocks showing left group, right group, and merged regions.

### Interactive Binary Search Tree
A fully interactive BST canvas where you can:

- **Insert** a value and watch the algorithm walk the tree to find the correct position
- **Search** for a value and follow the comparison path node by node
- **Delete** a node — handles all three cases (leaf, one child, two children via inorder successor) with each case shown in the log
- **Traverse** inorder, preorder, or postorder — nodes light up as they are visited, and the final sequence is displayed in a result banner
- **Generate a random tree** with 8 values for a quick start
- Adjustable animation speed and pause control
- Full execution log with color-coded badges per action type (go left/right, found, not found, find successor, replace with successor, etc.)

### Landing Dashboard
The home page is a dashboard with:
- An animated live bubble sort demo in the hero section
- Algorithm cards grouped by category (Comparison, Divide & Conquer, Non-comparison, Data Structures), each showing a mini bar chart preview and Big-O complexity badges
- One-click navigation to any visualizer

---

## Tech Stack

- **React 18** — component-based UI with hooks (useState, useEffect, useCallback, useRef)
- **Vite** — build tool and dev server (migrated from Create React App)
- **D3.js** — SVG rendering for bar charts and the BST canvas
- **Inter** — UI font (via Google Fonts)

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm

### Install dependencies

```bash
npm install
```

### Run in development

```bash
npm run dev
```

Opens at `http://localhost:5173` by default. The page hot-reloads on every save.

### Build for production

```bash
npm run build
```

Output goes to `dist/`. Preview the production build locally with:

```bash
npm run preview
```

---

## Project Structure

```
src/
├── algorithms/          # Pure algorithm logic — each returns { steps, tree/array }
│   ├── bubbleSort.js
│   ├── selectionSort.js
│   ├── insertionSort.js
│   ├── shellSort.js
│   ├── mergeSort.js
│   ├── bottomUpMergeSort.js
│   ├── quickSort.js
│   ├── radixSort.js
│   ├── countingSort.js
│   └── bst.js           # BST: insert, search, remove, traverse, buildTree
├── components/
│   ├── Navbar.jsx        # Context-aware breadcrumb navbar
│   ├── VisualizationCanvas.jsx  # Sorting canvas + execution log
│   ├── MergeCanvas.jsx   # Dedicated split/merge visualization
│   ├── TreeCanvas.jsx    # D3 BST renderer with inorder layout
│   └── ...css
├── pages/
│   ├── LandingPage.jsx   # Dashboard with hero + algorithm cards
│   ├── TreePage.jsx      # Interactive BST page
│   └── ...css
├── assets/
│   └── logo.png
├── App.jsx               # Root — manages view state (landing / visualization / tree)
└── index.jsx
```

---

## Academic Context

This project was developed as part of the **Senior Design** curriculum at the **International Burch University (IBU)**, under the mentorship of **STA Aldin Kovacevic**. The goal was to build an educational tool that makes abstract algorithmic concepts tangible and approachable — bridging the gap between textbook pseudocode and actual runtime behavior.
