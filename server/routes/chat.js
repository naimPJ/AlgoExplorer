const express = require("express");
const Groq = require("groq-sdk");
const { authenticate } = require("../middleware/auth");

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function buildSystemPrompt(context, quizMode) {
    const {
        kind, algorithm, timeComplexity, stepIndex, totalSteps,
        currentStep, nextStep, executionLog, array, treeSnapshot,
    } = context;
    const isTree = kind === 'tree';

    const lines = [
        "You are an algorithm tutor embedded in AlgoExplorer, an interactive algorithm visualizer.",
        "Your job is to help students understand what is happening during a live algorithm execution.",
        "Keep answers short (2–4 sentences), concrete, and tied to the current execution state.",
        "Never just recite theory — always connect your answer to the specific step the user is on.",
        isTree
            ? "This is a binary search tree: reason in terms of nodes, left/right children, and the BST invariant (left < node < right) — never array positions or indices."
            : "This is an array-based algorithm: reason in terms of array positions, comparisons, and swaps.",
        "",
        `Algorithm: ${algorithm}`,
    ];

    if (timeComplexity) {
        lines.push(`Complexity: Best ${timeComplexity.best} | Average ${timeComplexity.average} | Worst ${timeComplexity.worst}`);
    }

    if (totalSteps > 0) {
        lines.push(`Progress: step ${stepIndex} of ${totalSteps}`);
    }

    if (currentStep) {
        lines.push(`Current step: "${currentStep.description}" (action: ${currentStep.action})`);
        if (currentStep.iteration != null) {
            lines.push(`Iteration: ${currentStep.iteration}`);
        }
        if (isTree && currentStep.path?.length) {
            lines.push(`Path so far: ${currentStep.path.join(" → ")}`);
        }
        if (isTree && currentStep.currentValue != null) {
            lines.push(`Comparing against node: ${currentStep.currentValue}`);
        }
    }

    if (executionLog?.length) {
        // Log is newest-first from the client; reverse so the LLM reads it chronologically.
        const chronological = [...executionLog].reverse();
        lines.push("");
        lines.push(`Execution log so far (${chronological.length} steps, oldest → newest):`);
        for (const entry of chronological) {
            const iter = entry.iteration != null ? `[iter ${entry.iteration}] ` : "";
            lines.push(`- ${iter}${entry.action}: ${entry.description}`);
        }
    }

    if (isTree) {
        if (treeSnapshot?.inorder?.length) {
            lines.push(`Current tree — root: ${treeSnapshot.root}, inorder values: [${treeSnapshot.inorder.join(", ")}]`);
        } else {
            lines.push("The tree is currently empty. Do not invent or assume any nodes.");
        }
    } else if (array?.length) {
        lines.push(`Current array: [${array.join(", ")}]`);
    } else {
        lines.push("No array has been entered yet. Do not invent or assume any elements.");
    }

    if (quizMode) {
        lines.push("");
        lines.push("=== QUIZ MODE ===");
        lines.push("Do NOT explain what just happened. Instead, ask the student what will happen in the NEXT step.");
        if (nextStep) {
            lines.push(`The correct next step is: action="${nextStep.action}", description="${nextStep.description}"`);
            lines.push("After the student answers, grade it as correct / partially correct / incorrect and give a brief explanation.");
        } else {
            lines.push("There is no next step — the algorithm is complete. Ask the student what the final result means or why the algorithm is now done.");
        }
    }

    return lines.join("\n");
}

router.post("/", authenticate, async (req, res) => {
    const { question, context, history = [], quizMode = false } = req.body;

    if (!question || !context) {
        return res.status(400).json({ error: "question and context are required" });
    }

    res.setHeader("Content-Type",  "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection",    "keep-alive");
    res.flushHeaders();

    try {
        const messages = [
            { role: "system", content: buildSystemPrompt(context, quizMode) },
            ...history.filter(m => m.content).map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: question },
        ];

        const stream = await groq.chat.completions.create({
            model:       "llama-3.3-70b-versatile",
            messages,
            max_tokens:  512,
            temperature: 0.5,
            stream:      true,
        });

        for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content;
            if (text) {
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
            }
        }

        res.write("data: [DONE]\n\n");
        res.end();
    } catch (err) {
        console.error("[chat] error:", err);
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
    }
});

module.exports = router;
