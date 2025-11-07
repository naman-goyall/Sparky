import { z } from 'zod';
import type { Tool, ToolResult } from '../../types/tool.js';
import { logger } from '../../utils/logger.js';

const inputSchema = z.object({
  action: z.enum([
    'read_wiki_structure',
    'read_wiki_contents',
    'ask_question',
  ]).describe('Action to perform with DeepWiki'),
  repo_name: z.string().describe('GitHub repository in format "owner/repo" (e.g., "facebook/react")'),
  question: z.string().optional().describe('Question to ask about the repository (only for ask_question action)'),
});

/**
 * DeepWiki Tool - Helps students understand open source repositories
 * 
 * Uses the DeepWiki MCP server to provide:
 * 1. Documentation structure for repositories
 * 2. Comprehensive documentation content
 * 3. AI-powered Q&A about repositories
 * 
 * This is particularly useful for students working with open source projects
 * who need to understand codebases, architecture, and implementation details.
 */

class DeepWikiClient {
  private readonly baseUrl = 'https://mcp.deepwiki.com';

  /**
   * Get the documentation structure for a repository
   * Returns a hierarchical list of documentation topics
   */
  async getWikiStructure(repoName: string): Promise<any> {
    logger.debug(`Fetching wiki structure for ${repoName}`);
    
    try {
      // Use the MCP tool via direct API call
      const response = await this.callMCPTool('read_wiki_structure', {
        repoName,
      });
      
      return response;
    } catch (error) {
      logger.error(error as Error, `Failed to get wiki structure for ${repoName}`);
      throw error;
    }
  }

  /**
   * Get the full documentation content for a repository
   * Returns comprehensive documentation including architecture, guides, etc.
   */
  async getWikiContents(repoName: string): Promise<any> {
    logger.debug(`Fetching wiki contents for ${repoName}`);
    
    try {
      const response = await this.callMCPTool('read_wiki_contents', {
        repoName,
      });
      
      return response;
    } catch (error) {
      logger.error(error as Error, `Failed to get wiki contents for ${repoName}`);
      throw error;
    }
  }

  /**
   * Ask a specific question about a repository
   * Returns AI-powered, context-grounded answers with code citations
   */
  async askQuestion(repoName: string, question: string): Promise<any> {
    logger.debug(`Asking question about ${repoName}: ${question}`);
    
    try {
      const response = await this.callMCPTool('ask_question', {
        repoName,
        question,
      });
      
      return response;
    } catch (error) {
      logger.error(error as Error, `Failed to ask question about ${repoName}`);
      throw error;
    }
  }

  /**
   * Internal method to call MCP tools via the DeepWiki MCP server
   * Uses the SSE endpoint for compatibility
   */
  private async callMCPTool(toolName: string, params: any): Promise<any> {
    // For now, we'll use a simple HTTP approach
    // In a full MCP implementation, this would use the MCP protocol
    const url = `${this.baseUrl}/sse`;
    
    try {
      // Note: The actual MCP protocol implementation would be more complex
      // This is a simplified version that demonstrates the concept
      // In production, you'd use an MCP client library
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/call',
          params: {
            name: toolName,
            arguments: params,
          },
          id: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepWiki MCP error (${response.status}): ${await response.text()}`);
      }

      const data = await response.json() as any;
      return data.result || data;
    } catch (error) {
      // If direct API call fails, provide helpful error message
      throw new Error(
        `Failed to call DeepWiki MCP tool "${toolName}". ` +
        `This may require proper MCP client setup. Error: ${(error as Error).message}`
      );
    }
  }
}

function formatWikiStructure(structure: any, repoName: string): string {
  let output = `# Documentation Structure for ${repoName}\n\n`;
  
  if (typeof structure === 'string') {
    return output + structure;
  }
  
  if (Array.isArray(structure)) {
    output += 'Available documentation topics:\n\n';
    structure.forEach((topic: any, index: number) => {
      if (typeof topic === 'string') {
        output += `${index + 1}. ${topic}\n`;
      } else if (topic.title) {
        output += `${index + 1}. **${topic.title}**\n`;
        if (topic.description) {
          output += `   ${topic.description}\n`;
        }
      }
    });
  } else if (structure.topics) {
    output += formatWikiStructure(structure.topics, repoName);
  } else {
    output += JSON.stringify(structure, null, 2);
  }
  
  return output;
}

function formatWikiContents(contents: any, repoName: string): string {
  let output = `# Documentation for ${repoName}\n\n`;
  
  if (typeof contents === 'string') {
    return output + contents;
  }
  
  if (contents.content) {
    output += contents.content;
  } else if (Array.isArray(contents)) {
    contents.forEach((section: any) => {
      if (section.title) {
        output += `## ${section.title}\n\n`;
      }
      if (section.content) {
        output += `${section.content}\n\n`;
      }
    });
  } else {
    output += JSON.stringify(contents, null, 2);
  }
  
  return output;
}

function formatAnswer(answer: any, repoName: string, question: string): string {
  let output = `# Answer for: "${question}"\n`;
  output += `Repository: ${repoName}\n\n`;
  
  if (typeof answer === 'string') {
    return output + answer;
  }
  
  if (answer.answer) {
    output += answer.answer + '\n\n';
  }
  
  if (answer.citations && Array.isArray(answer.citations)) {
    output += '## Code Citations\n\n';
    answer.citations.forEach((citation: any, index: number) => {
      output += `${index + 1}. `;
      if (citation.file) {
        output += `**${citation.file}**`;
        if (citation.line) {
          output += ` (line ${citation.line})`;
        }
        output += '\n';
      }
      if (citation.code) {
        output += '```\n' + citation.code + '\n```\n';
      }
      output += '\n';
    });
  }
  
  if (answer.sources && Array.isArray(answer.sources)) {
    output += '## Sources\n\n';
    answer.sources.forEach((source: any, index: number) => {
      output += `${index + 1}. ${source}\n`;
    });
  }
  
  return output;
}

async function executeDeepWiki(params: z.infer<typeof inputSchema>): Promise<ToolResult> {
  const { action, repo_name, question } = params;
  
  // Validate repo name format
  if (!repo_name.includes('/')) {
    return {
      success: false,
      error: 'Invalid repository name. Format should be "owner/repo" (e.g., "facebook/react")',
    };
  }

  const client = new DeepWikiClient();

  try {
    let result: any;
    let formattedOutput: string;

    switch (action) {
      case 'read_wiki_structure':
        result = await client.getWikiStructure(repo_name);
        formattedOutput = formatWikiStructure(result, repo_name);
        break;

      case 'read_wiki_contents':
        result = await client.getWikiContents(repo_name);
        formattedOutput = formatWikiContents(result, repo_name);
        break;

      case 'ask_question':
        if (!question) {
          return {
            success: false,
            error: 'Question is required for ask_question action',
          };
        }
        result = await client.askQuestion(repo_name, question);
        formattedOutput = formatAnswer(result, repo_name, question);
        break;

      default:
        return {
          success: false,
          error: `Unknown action: ${action}`,
        };
    }

    return {
      success: true,
      output: formattedOutput,
    };
  } catch (error) {
    logger.error(error as Error, 'DeepWiki tool execution failed');
    return {
      success: false,
      error: `DeepWiki error: ${(error as Error).message}`,
    };
  }
}

export const deepwikiTool: Tool = {
  name: 'deepwiki',
  description: `Access comprehensive documentation and understanding for GitHub repositories. 
This tool helps students understand open source projects by providing:
- Documentation structure (read_wiki_structure): Get an overview of available documentation topics
- Full documentation (read_wiki_contents): Read comprehensive documentation about the repository
- Q&A (ask_question): Ask specific questions and get AI-powered answers with code citations

Perfect for students working on projects that use open source libraries or contributing to open source.
Repository name must be in format "owner/repo" (e.g., "facebook/react", "microsoft/typescript")`,
  inputSchema,
  execute: executeDeepWiki,
};
