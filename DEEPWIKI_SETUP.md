# DeepWiki Integration Guide

## Overview

DeepWiki is a powerful tool that helps students understand open source repositories by providing comprehensive documentation, architecture diagrams, and AI-powered Q&A capabilities. This integration allows the School Agent to help you quickly understand any public GitHub repository.

## What is DeepWiki?

DeepWiki automatically generates comprehensive documentation for GitHub repositories, including:

- **Architecture Diagrams**: Visual representations of code structure
- **Documentation Topics**: Organized guides covering different aspects of the codebase
- **Code Citations**: Direct links to relevant code sections
- **AI-Powered Q&A**: Ask specific questions and get context-grounded answers

## Use Cases for Students

### 1. **Learning from Open Source Projects**
When studying popular libraries or frameworks:
```
Ask the agent: "Use DeepWiki to explain the architecture of facebook/react"
```

### 2. **Understanding Dependencies**
When your project uses an open source library:
```
Ask the agent: "Use DeepWiki to show me how authentication works in express"
```

### 3. **Contributing to Open Source**
Before making contributions:
```
Ask the agent: "Use DeepWiki to explain the testing structure in microsoft/typescript"
```

### 4. **Research and Assignments**
When analyzing codebases for school projects:
```
Ask the agent: "Use DeepWiki to get documentation about the design patterns used in vuejs/core"
```

## Available Actions

### 1. Read Wiki Structure
Get an overview of available documentation topics for a repository.

**Example:**
```
Agent, use DeepWiki to read the wiki structure for tensorflow/tensorflow
```

**What you get:**
- List of documentation topics
- Hierarchical organization of content
- Overview of what's documented

### 2. Read Wiki Contents
Get the full comprehensive documentation for a repository.

**Example:**
```
Agent, use DeepWiki to read the full documentation for nestjs/nest
```

**What you get:**
- Complete documentation content
- Architecture explanations
- Implementation details
- Code examples

### 3. Ask Questions
Ask specific questions about a repository and get AI-powered answers with code citations.

**Example:**
```
Agent, use DeepWiki to ask: "How does the routing system work in express?"
```

**What you get:**
- Detailed answer to your question
- Code citations with file paths and line numbers
- Links to relevant source files
- Context-grounded explanations

## How to Use

### Basic Usage

Simply ask the agent to use DeepWiki with any public GitHub repository:

```bash
# Get documentation structure
"Show me the documentation structure for facebook/react using DeepWiki"

# Read full documentation
"Get the complete documentation for django/django using DeepWiki"

# Ask specific questions
"Using DeepWiki, ask how the component lifecycle works in sveltejs/svelte"
```

### Repository Name Format

Always use the format `owner/repo`:
- ✅ Correct: `facebook/react`
- ✅ Correct: `microsoft/typescript`
- ✅ Correct: `vuejs/core`
- ❌ Wrong: `react` (missing owner)
- ❌ Wrong: `github.com/facebook/react` (don't include domain)

## Example Workflows

### Workflow 1: Understanding a New Library

**Scenario:** You need to use React in your project but haven't used it before.

```
Student: "I need to learn React for my project. Can you help me understand it?"

Agent: [Uses DeepWiki to read wiki structure for facebook/react]
Agent: "Here's the documentation structure for React. Let me get the full documentation..."
Agent: [Uses DeepWiki to read wiki contents]
Agent: "React is a JavaScript library for building user interfaces. Here's what you need to know..."
```

### Workflow 2: Debugging with Open Source Code

**Scenario:** You're getting an error with an Express middleware and need to understand how it works.

```
Student: "I'm getting an error with Express middleware. Can you explain how middleware works?"

Agent: [Uses DeepWiki to ask question about expressjs/express]
Agent: "Based on the Express codebase, middleware functions work like this... [provides detailed explanation with code citations]"
```

### Workflow 3: Contributing to Open Source

**Scenario:** You want to contribute to an open source project for class credit.

```
Student: "I want to contribute to the Vue.js project. How is the codebase organized?"

Agent: [Uses DeepWiki to read wiki structure for vuejs/core]
Agent: "The Vue.js codebase is organized into these main sections... Let me get more details on the architecture..."
Agent: [Uses DeepWiki to ask about architecture]
Agent: "Here's how the Vue.js architecture works, with specific file locations..."
```

## Technical Details

### MCP Integration

DeepWiki is integrated via the Model Context Protocol (MCP), which provides:

- **Remote Access**: No authentication required for public repositories
- **Real-time Data**: Always up-to-date documentation
- **Structured Responses**: Well-formatted, easy-to-read output

### Server Information

- **Base URL**: `https://mcp.deepwiki.com`
- **Protocol**: SSE (Server-Sent Events)
- **Authentication**: None required for public repos
- **Rate Limits**: Reasonable limits for educational use

### Supported Repositories

- ✅ All public GitHub repositories
- ✅ Popular open source projects
- ✅ Recently updated repositories
- ❌ Private repositories (requires Devin account)
- ❌ Non-GitHub repositories

## Best Practices

### 1. Start with Structure
Always check the documentation structure first to understand what's available:
```
"Show me the DeepWiki structure for [repo]"
```

### 2. Ask Specific Questions
Instead of reading all documentation, ask targeted questions:
```
"Using DeepWiki, ask how authentication is implemented in [repo]"
```

### 3. Combine with Code Tools
Use DeepWiki alongside other agent tools:
```
"Use DeepWiki to understand the React hooks system, then help me implement a custom hook"
```

### 4. Reference Documentation
When working on projects, keep DeepWiki documentation handy:
```
"Get the DeepWiki documentation for the libraries I'm using in package.json"
```

## Troubleshooting

### Issue: Repository Not Found

**Error:** "Repository not found or not accessible"

**Solutions:**
- Verify the repository name format is `owner/repo`
- Check that the repository is public
- Ensure the repository exists on GitHub

### Issue: Documentation Not Available

**Error:** "Documentation not yet generated for this repository"

**Solutions:**
- Try a more popular/established repository
- Wait a few minutes and try again
- Use the `ask_question` action instead of reading full docs

### Issue: Slow Response

**Symptom:** DeepWiki takes a long time to respond

**Solutions:**
- Large repositories may take longer to process
- Try asking specific questions instead of reading all documentation
- Check your internet connection

## Limitations

1. **Public Repositories Only**: Private repos require a Devin account
2. **GitHub Only**: Currently only supports GitHub repositories
3. **Documentation Quality**: Depends on code quality and comments in the repo
4. **Rate Limits**: May have usage limits for very frequent requests

## Advanced Usage

### Comparing Multiple Repositories

```
"Compare the architecture of facebook/react and vuejs/core using DeepWiki"
```

### Deep Diving into Specific Components

```
"Using DeepWiki, explain the virtual DOM implementation in react, then show me the actual code"
```

### Learning Design Patterns

```
"Use DeepWiki to identify design patterns used in nestjs/nest and explain each one"
```

## Related Resources

- [DeepWiki Official Documentation](https://docs.devin.ai/work-with-devin/deepwiki)
- [DeepWiki MCP Server](https://docs.devin.ai/work-with-devin/deepwiki-mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/introduction)
- [DeepWiki Web Interface](https://deepwiki.com/)

## Support

If you encounter issues with DeepWiki:

1. Check this documentation first
2. Verify the repository name is correct
3. Try a different repository to test if it's repo-specific
4. Check the [DeepWiki status page](https://deepwiki.com/) for service issues

## Examples by Programming Language

### JavaScript/TypeScript
- `facebook/react` - React library
- `microsoft/typescript` - TypeScript compiler
- `nodejs/node` - Node.js runtime
- `expressjs/express` - Express framework
- `nestjs/nest` - NestJS framework

### Python
- `django/django` - Django framework
- `pallets/flask` - Flask framework
- `python/cpython` - Python interpreter
- `tensorflow/tensorflow` - TensorFlow ML library
- `scikit-learn/scikit-learn` - Scikit-learn ML library

### Java
- `spring-projects/spring-boot` - Spring Boot
- `apache/kafka` - Apache Kafka
- `elastic/elasticsearch` - Elasticsearch

### Go
- `golang/go` - Go language
- `kubernetes/kubernetes` - Kubernetes
- `docker/docker` - Docker

### Rust
- `rust-lang/rust` - Rust language
- `tokio-rs/tokio` - Tokio async runtime

---

**Pro Tip:** Bookmark this guide and refer to it whenever you're working with open source projects. DeepWiki can save you hours of reading through documentation and source code!
