# DeepWiki Quick Start for Students

## What is DeepWiki?

DeepWiki helps you understand any public GitHub repository instantly. Instead of spending hours reading documentation and code, just ask questions and get AI-powered answers with code examples.

## 5-Minute Quick Start

### 1. Basic Usage

Just talk to the agent naturally:

```
"Help me understand how React works using DeepWiki"
```

The agent will automatically use DeepWiki to get you comprehensive documentation.

### 2. Ask Specific Questions

```
"Using DeepWiki, explain how Express middleware works"
```

You'll get:
- Detailed explanation
- Code examples with file paths
- Line numbers you can reference
- Links to actual source code

### 3. Explore Repository Structure

```
"Show me the documentation structure for nestjs/nest using DeepWiki"
```

You'll see:
- All available documentation topics
- How the project is organized
- What areas are documented

## Common Student Scenarios

### Scenario 1: Starting a New Project

**You**: "I need to use React for my web app project but I've never used it"

**Agent**: [Uses DeepWiki]
- Gets React documentation
- Explains core concepts
- Shows you examples
- Helps you get started

### Scenario 2: Debugging an Error

**You**: "I'm getting an error with Express routing. Can you explain how it works?"

**Agent**: [Uses DeepWiki to ask about Express routing]
- Explains how routing works
- Shows actual code from Express
- Helps you fix your issue

### Scenario 3: Learning a Library

**You**: "What's the difference between Vue and React?"

**Agent**: [Uses DeepWiki on both repos]
- Compares architectures
- Explains key differences
- Shows code examples from both

### Scenario 4: Contributing to Open Source

**You**: "I want to contribute to the TypeScript project. Where do I start?"

**Agent**: [Uses DeepWiki]
- Shows project structure
- Explains contribution workflow
- Points you to beginner-friendly areas

## Popular Repositories for Students

### Web Development
- `facebook/react` - React library
- `vuejs/core` - Vue.js framework
- `angular/angular` - Angular framework
- `expressjs/express` - Express backend
- `nestjs/nest` - NestJS framework

### Python
- `django/django` - Django web framework
- `pallets/flask` - Flask framework
- `scikit-learn/scikit-learn` - Machine learning
- `pandas-dev/pandas` - Data analysis

### Mobile
- `flutter/flutter` - Flutter framework
- `facebook/react-native` - React Native

### Tools
- `microsoft/typescript` - TypeScript
- `webpack/webpack` - Webpack bundler
- `prettier/prettier` - Code formatter

## Pro Tips

### Tip 1: Start Broad, Then Narrow
```
1. "Show me the structure for facebook/react"
2. "Get the full documentation"
3. "Explain how hooks work specifically"
```

### Tip 2: Use for Homework
```
"I need to analyze the architecture of an open source project for my assignment.
Can you help me understand the structure of django/django?"
```

### Tip 3: Compare Libraries
```
"Compare the routing systems in Express and NestJS using DeepWiki"
```

### Tip 4: Learn Design Patterns
```
"What design patterns are used in nestjs/nest? Use DeepWiki to explain each one"
```

### Tip 5: Understand Dependencies
```
"My project uses axios. Can you explain how it works using DeepWiki?"
```

## What You Can Ask

### Architecture Questions
- "How is [repo] structured?"
- "What's the architecture of [repo]?"
- "Explain the design patterns in [repo]"

### Feature Questions
- "How does [feature] work in [repo]?"
- "Show me how [repo] implements [feature]"
- "Explain the [system] in [repo]"

### Comparison Questions
- "Compare [repo1] and [repo2]"
- "What's the difference between [repo1] and [repo2]?"
- "Which is better for [use case], [repo1] or [repo2]?"

### Learning Questions
- "How do I get started with [repo]?"
- "What are the main concepts in [repo]?"
- "Show me examples from [repo]"

## Repository Name Format

Always use `owner/repo` format:

✅ **Correct**
- `facebook/react`
- `microsoft/typescript`
- `django/django`

❌ **Wrong**
- `react` (missing owner)
- `github.com/facebook/react` (don't include domain)
- `React` (case matters)

## When to Use DeepWiki

### ✅ Use DeepWiki When:
- Learning a new library or framework
- Understanding how something works
- Debugging integration issues
- Researching for assignments
- Contributing to open source
- Comparing different solutions

### ❌ Don't Use DeepWiki For:
- Your own private code (use other agent tools)
- Non-GitHub repositories
- Private repositories (requires Devin account)
- Very new repos (might not have docs yet)

## Example Conversations

### Example 1: Complete Learning Flow

**Student**: "I need to learn React for my final project"

**Agent**: "Let me help you understand React using DeepWiki."
[Uses read_wiki_structure for facebook/react]

**Agent**: "React has documentation on components, hooks, state management, and more. Let me get the full documentation."
[Uses read_wiki_contents]

**Agent**: "React is a JavaScript library for building user interfaces. Here are the key concepts you need to know..."

**Student**: "How do hooks work?"

**Agent**: [Uses ask_question]
"React hooks are functions that let you use state and other React features without writing a class..."

### Example 2: Debugging Help

**Student**: "My Express app isn't working. The middleware isn't executing"

**Agent**: "Let me explain how Express middleware works."
[Uses DeepWiki ask_question]

**Agent**: "Express middleware are functions that have access to the request object (req), response object (res), and the next middleware function. Here's how they work... [shows code citations]"

**Student**: "Oh, I forgot to call next()!"

### Example 3: Assignment Research

**Student**: "I need to write a paper comparing React and Vue"

**Agent**: "I'll help you compare them using DeepWiki."
[Uses DeepWiki on both repos]

**Agent**: "Here's a comparison:

**React**:
- Component-based architecture
- Virtual DOM
- JSX syntax
- [more details with code citations]

**Vue**:
- Also component-based
- Virtual DOM with optimizations
- Template syntax
- [more details with code citations]"

## Troubleshooting

### "Repository not found"
- Check spelling: `facebook/react` not `Facebook/React`
- Make sure it's public
- Verify it exists on GitHub

### "Documentation not available"
- Try asking a specific question instead
- Repository might be too new
- Try a more popular/established repo

### "Taking too long"
- Large repos take longer
- Ask specific questions instead of reading all docs
- Be patient, it's processing a lot of code

## Getting Help

If you're stuck:

1. Check [DEEPWIKI_SETUP.md](../DEEPWIKI_SETUP.md) for detailed guide
2. Check [deepwiki-tool-reference.md](./deepwiki-tool-reference.md) for technical details
3. Try a simpler question first
4. Ask the agent for help: "How do I use DeepWiki?"

## Remember

- DeepWiki is **free** for public repos
- No authentication needed
- Works with **any** public GitHub repository
- Saves you **hours** of reading documentation
- Helps you **learn faster** and **code better**

---

**Happy Learning! 🎓**

Now go explore some amazing open source projects and level up your coding skills!
