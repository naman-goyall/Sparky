# DeepWiki Tool Reference

## Quick Reference

### Tool Name
`deepwiki`

### Description
Access comprehensive documentation and understanding for GitHub repositories. Helps students understand open source projects through AI-powered documentation and Q&A.

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | enum | Yes | Action to perform: `read_wiki_structure`, `read_wiki_contents`, or `ask_question` |
| `repo_name` | string | Yes | GitHub repository in format "owner/repo" (e.g., "facebook/react") |
| `question` | string | Conditional | Question to ask (required only for `ask_question` action) |

## Actions

### 1. read_wiki_structure

Get a hierarchical list of documentation topics available for a repository.

**Use when:**
- You want to see what documentation is available
- You need an overview of the repository structure
- You're exploring a new codebase

**Example:**
```json
{
  "action": "read_wiki_structure",
  "repo_name": "facebook/react"
}
```

**Returns:**
- List of documentation topics
- Hierarchical structure
- Topic descriptions

### 2. read_wiki_contents

Get the full comprehensive documentation for a repository.

**Use when:**
- You need detailed documentation
- You want to understand the architecture
- You're learning how the project works

**Example:**
```json
{
  "action": "read_wiki_contents",
  "repo_name": "expressjs/express"
}
```

**Returns:**
- Complete documentation
- Architecture explanations
- Implementation details
- Code examples

### 3. ask_question

Ask a specific question about a repository and get an AI-powered answer.

**Use when:**
- You have a specific question
- You need to understand a particular feature
- You want code citations for a concept

**Example:**
```json
{
  "action": "ask_question",
  "repo_name": "vuejs/core",
  "question": "How does the reactivity system work?"
}
```

**Returns:**
- Detailed answer to the question
- Code citations with file paths
- Line numbers and code snippets
- Context-grounded explanations

## Response Format

### Success Response
```json
{
  "success": true,
  "output": "Formatted documentation or answer..."
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## Common Use Cases

### 1. Learning a New Framework
```json
{
  "action": "read_wiki_contents",
  "repo_name": "nestjs/nest"
}
```

### 2. Understanding Specific Features
```json
{
  "action": "ask_question",
  "repo_name": "facebook/react",
  "question": "How do React hooks work internally?"
}
```

### 3. Exploring Project Structure
```json
{
  "action": "read_wiki_structure",
  "repo_name": "microsoft/typescript"
}
```

### 4. Debugging Issues
```json
{
  "action": "ask_question",
  "repo_name": "expressjs/express",
  "question": "How does middleware error handling work?"
}
```

### 5. Contributing to Open Source
```json
{
  "action": "ask_question",
  "repo_name": "django/django",
  "question": "What is the contribution workflow and testing structure?"
}
```

## Error Handling

### Invalid Repository Format
```
Error: "Invalid repository name. Format should be 'owner/repo'"
```
**Fix:** Use format like "facebook/react" not just "react"

### Missing Question
```
Error: "Question is required for ask_question action"
```
**Fix:** Provide a question parameter when using ask_question action

### Repository Not Found
```
Error: "DeepWiki MCP error (404): Repository not found"
```
**Fix:** Verify the repository exists and is public

### MCP Connection Error
```
Error: "Failed to call DeepWiki MCP tool"
```
**Fix:** Check internet connection and MCP server status

## Best Practices

### 1. Start Broad, Then Narrow
```
1. read_wiki_structure - See what's available
2. read_wiki_contents - Get overview
3. ask_question - Dive into specifics
```

### 2. Be Specific with Questions
❌ Bad: "How does this work?"
✅ Good: "How does the component lifecycle work in React?"

### 3. Use Proper Repository Names
✅ Correct: "facebook/react"
✅ Correct: "microsoft/typescript"
❌ Wrong: "react"
❌ Wrong: "github.com/facebook/react"

### 4. Combine with Other Tools
```
1. Use DeepWiki to understand the code
2. Use read_file to see actual implementation
3. Use ripgrep to find specific patterns
4. Use edit_file to apply what you learned
```

## Integration with Agent Workflow

The agent can use DeepWiki in various workflows:

### Learning Workflow
```
User: "Help me understand React"
Agent: [Uses read_wiki_structure]
Agent: [Uses read_wiki_contents]
Agent: [Explains based on documentation]
```

### Problem-Solving Workflow
```
User: "I'm getting an error with Express middleware"
Agent: [Uses ask_question about middleware]
Agent: [Uses read_file to check user's code]
Agent: [Provides solution based on both]
```

### Code Review Workflow
```
User: "Is my implementation following best practices?"
Agent: [Uses ask_question about best practices]
Agent: [Uses read_file to review code]
Agent: [Compares and provides feedback]
```

## Limitations

1. **Public Repositories Only**: Private repos require Devin account
2. **GitHub Only**: Currently only supports GitHub
3. **Documentation Quality**: Varies by repository
4. **Rate Limits**: May have usage limits
5. **MCP Protocol**: Requires proper MCP client setup

## Technical Implementation

### MCP Server
- **URL**: `https://mcp.deepwiki.com`
- **Protocol**: SSE (Server-Sent Events)
- **Authentication**: None for public repos

### Response Processing
1. Tool receives parameters
2. Validates repository format
3. Calls MCP server via HTTP
4. Processes and formats response
5. Returns structured output

## Examples by Language

### JavaScript/TypeScript Projects
- `facebook/react`
- `microsoft/typescript`
- `nodejs/node`
- `expressjs/express`
- `nestjs/nest`
- `vuejs/core`
- `angular/angular`
- `sveltejs/svelte`

### Python Projects
- `django/django`
- `pallets/flask`
- `tensorflow/tensorflow`
- `scikit-learn/scikit-learn`
- `pandas-dev/pandas`

### Java Projects
- `spring-projects/spring-boot`
- `apache/kafka`
- `elastic/elasticsearch`

### Other Languages
- `golang/go` (Go)
- `rust-lang/rust` (Rust)
- `dotnet/runtime` (C#)
- `php/php-src` (PHP)

## Testing the Tool

### Basic Test
```json
{
  "action": "read_wiki_structure",
  "repo_name": "facebook/react"
}
```

### Question Test
```json
{
  "action": "ask_question",
  "repo_name": "expressjs/express",
  "question": "What is middleware?"
}
```

### Error Test
```json
{
  "action": "read_wiki_structure",
  "repo_name": "invalid-repo-name"
}
```

## Support and Resources

- [DeepWiki Setup Guide](../DEEPWIKI_SETUP.md)
- [DeepWiki Official Docs](https://docs.devin.ai/work-with-devin/deepwiki)
- [MCP Documentation](https://modelcontextprotocol.io/introduction)
- [DeepWiki Web Interface](https://deepwiki.com/)

---

**Last Updated:** Phase 6 Implementation
**Status:** ✅ Active
**Maintainer:** School Agent Team
