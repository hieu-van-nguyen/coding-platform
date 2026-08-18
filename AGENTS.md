# Agents Guide: Coding Platform

This project leverages a multi-agent workflow to handle complex software engineering tasks. Instead of a single chat, we use specialized agents to divide and conquer.

## 🤖 The Agent Team

| Agent | Role | When to Use | Key Tools |
| :--- | :--- | :--- | :--- |
| **`Plan`** | Architect | Designing new features, refactoring plans, or architectural changes. | `Glob`, `Grep`, `Read` |
| **`Explore`** | Scout | Broadly searching for symbols, usage patterns, or understanding how a feature is implemented. | `Glob`, `Grep`, `Read` (excerpts) |
| **`general-purpose`** | Researcher/Executor | Complex multi-step tasks, deep research, or coordinating several small changes. | All |
| **`claude`** | Coder | Focused implementation, bug fixing, and precise code edits. | All |

## 🛠️ Workflow Patterns

### 1. Implementing a New Feature
**Goal**: Add a new capability (e.g., "Add a new problem category filter").
1. **`Plan`**: Use the Plan agent to map out the required changes (UI components in `src/`, Firebase schema updates, etc.).
2. **`claude`**: Implement the plan in small, verifiable chunks.
3. **Verification**: Run the app and test the feature.

### 2. Fixing a Bug
**Goal**: Resolve an issue (e.g., "Solved count not updating correctly").
1. **`Explore`**: Use Explore to find all locations where the "solved count" is calculated or updated.
2. **`general-purpose`**: Investigate the root cause and hypothesize a fix.
3. **`claude`**: Apply the fix and verify with tests/manual check.

### 3. Codebase Refactoring
**Goal**: Improve code quality (e.g., "Migrate state management to a new pattern").
1. **`Explore`**: Identify all components using the old pattern.
2. **`Plan`**: Design a migration path that minimizes regressions.
3. **`claude`**: Execute the migration incrementally.

## 💡 Best Practices

- **Parallelize**: When tasks are independent, spawn multiple agents in one turn.
- **Context Management**: Use `Explore` for "finding" and `Read` for "understanding". Avoid reading huge files into context unless necessary.
- **Verification**: Always verify the outcome of an agent's work before marking a task as completed.
- **Plan First**: For any change touching more than 2 files, start with the `Plan` agent to avoid "trial-and-error" coding.

---
*This guide is designed for both the human developer and the Claude agent fleet to ensure consistency in how the Coding Platform is maintained.*
