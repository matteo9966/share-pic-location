---
description: Describe when these instructions should be loaded by the agent based on task context
applyTo: '**/*.tsx, **/*.ts, **/*.css'
---

<!-- Tip: Use /create-instructions in chat to generate content with agent assistance -->

Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

# Repository Coding Standards

## Architecture & Component Rules
- **Atomic Principles:** Maintain a strict separation between presentation primitives (`components/ui`) and feature-based layout components (`components/features`).
- **Props Definition:** Every component must have explicitly typed props using TypeScript interfaces. Do not inline prop types.
- **Composition over Nesting:** Do not deep-nest components inside a single file. Break down sub-layouts into standalone, well-named private components if they exceed 60 lines.

## Tailwind CSS Rules & Guardrails
- **Zero Arbitrary Values:** Absolutely forbid arbitrary Tailwind values (e.g., `text-[#333]`, `p-[13px]`, `w-[420px]`). You must strictly use the design tokens configured in the theme.
- **Responsive Strategy:** Follow a mobile-first approach. Apply base styles first, followed by responsive variants (`md:`, `lg:`).
- **Class Ordering:** Follow the standard Tailwind linting order: Layout (Display, Position) -> Box Model (Spacing, Size) -> Typography -> Visuals (Borders, Backgrounds) -> Interactive (Hover, Focus).
- **Utility Inflation:** If a component requires more than 3 utility classes for a state variant, abstract them using conditional utility libraries like `clsx` or `tailwind-merge`. Do not stack unreadable strings.