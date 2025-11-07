import { z } from 'zod';
import type { Tool, ToolResult } from '../../types/tool.js';
import { logger } from '../../utils/logger.js';

const inputSchema = z.object({
  action: z.enum([
    'create_page',
    'get_page',
    'update_page',
    'append_content',
    'search_pages',
    'list_pages',
  ]).describe('Action to perform'),
  page_id: z.string().optional().describe('Page ID for get/update/append actions'),
  parent_page_id: z.string().optional().describe('Parent page ID when creating a new page'),
  title: z.string().optional().describe('Page title'),
  content: z.string().optional().describe('Page content (markdown format)'),
  query: z.string().optional().describe('Search query for finding pages'),
  max_results: z.number().default(10).describe('Maximum number of results to return'),
});

interface NotionNotesConfig {
  apiKey: string;
  workspaceId?: string;
}

let notionNotesConfig: NotionNotesConfig | null = null;

export function setNotionNotesConfig(config: NotionNotesConfig): void {
  notionNotesConfig = config;
}

export function getNotionNotesConfig(): NotionNotesConfig | null {
  return notionNotesConfig;
}

class NotionNotesClient {
  private readonly apiVersion = '2025-09-03';

  constructor(private apiKey: string) {}

  private async makeRequest(
    endpoint: string,
    method: string = 'GET',
    body?: any
  ): Promise<any> {
    const url = `https://api.notion.com/v1${endpoint}`;
    
    logger.debug(`Notion API request: ${method} ${url}`);

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Notion-Version': this.apiVersion,
          'Content-Type': 'application/json',
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Notion API error (${response.status}): ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error(error as Error, 'Notion API request failed');
      throw error;
    }
  }

  // Convert markdown to Notion blocks
  private markdownToBlocks(markdown: string): any[] {
    const blocks: any[] = [];
    const lines = markdown.split('\n');
    
    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      
      if (!line) {
        i++;
        continue;
      }
      
      // Headers
      if (line.startsWith('# ')) {
        blocks.push({
          object: 'block',
          type: 'heading_1',
          heading_1: {
            rich_text: [{ type: 'text', text: { content: line.substring(2) } }],
          },
        });
      } else if (line.startsWith('## ')) {
        blocks.push({
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: line.substring(3) } }],
          },
        });
      } else if (line.startsWith('### ')) {
        blocks.push({
          object: 'block',
          type: 'heading_3',
          heading_3: {
            rich_text: [{ type: 'text', text: { content: line.substring(4) } }],
          },
        });
      }
      // Bullet list
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        blocks.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ type: 'text', text: { content: line.substring(2) } }],
          },
        });
      }
      // Numbered list
      else if (/^\d+\.\s/.test(line)) {
        const content = line.replace(/^\d+\.\s/, '');
        blocks.push({
          object: 'block',
          type: 'numbered_list_item',
          numbered_list_item: {
            rich_text: [{ type: 'text', text: { content } }],
          },
        });
      }
      // Code block
      else if (line.startsWith('```')) {
        const language = line.substring(3).trim() || 'plain text';
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        blocks.push({
          object: 'block',
          type: 'code',
          code: {
            rich_text: [{ type: 'text', text: { content: codeLines.join('\n') } }],
            language: language,
          },
        });
      }
      // Quote
      else if (line.startsWith('> ')) {
        blocks.push({
          object: 'block',
          type: 'quote',
          quote: {
            rich_text: [{ type: 'text', text: { content: line.substring(2) } }],
          },
        });
      }
      // Regular paragraph
      else {
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: line } }],
          },
        });
      }
      
      i++;
    }
    
    return blocks;
  }

  // Convert Notion blocks to markdown
  private blocksToMarkdown(blocks: any[]): string {
    const lines: string[] = [];
    
    for (const block of blocks) {
      const type = block.type;
      
      if (!block[type]?.rich_text) {
        continue;
      }
      
      const text = block[type].rich_text
        .map((rt: any) => rt.plain_text || rt.text?.content || '')
        .join('');
      
      switch (type) {
        case 'heading_1':
          lines.push(`# ${text}`);
          break;
        case 'heading_2':
          lines.push(`## ${text}`);
          break;
        case 'heading_3':
          lines.push(`### ${text}`);
          break;
        case 'bulleted_list_item':
          lines.push(`- ${text}`);
          break;
        case 'numbered_list_item':
          lines.push(`1. ${text}`);
          break;
        case 'quote':
          lines.push(`> ${text}`);
          break;
        case 'code':
          const language = block.code?.language || 'plain text';
          lines.push(`\`\`\`${language}`);
          lines.push(text);
          lines.push('```');
          break;
        case 'paragraph':
          lines.push(text);
          break;
        default:
          lines.push(text);
      }
      
      lines.push('');
    }
    
    return lines.join('\n').trim();
  }

  async createPage(params: {
    parentPageId?: string;
    title: string;
    content?: string;
  }): Promise<any> {
    const parent = params.parentPageId
      ? { page_id: params.parentPageId }
      : { type: 'workspace', workspace: true };

    const body: any = {
      parent,
      properties: {
        title: {
          title: [
            {
              type: 'text',
              text: { content: params.title },
            },
          ],
        },
      },
    };

    // Add content blocks if provided
    if (params.content) {
      body.children = this.markdownToBlocks(params.content);
    }

    return this.makeRequest('/pages', 'POST', body);
  }

  async getPage(pageId: string): Promise<any> {
    return this.makeRequest(`/pages/${pageId}`);
  }

  async getPageContent(pageId: string): Promise<any> {
    const blocks = await this.makeRequest(`/blocks/${pageId}/children`);
    return blocks;
  }

  async updatePage(pageId: string, title?: string): Promise<any> {
    const body: any = {
      properties: {},
    };

    if (title) {
      body.properties.title = {
        title: [
          {
            type: 'text',
            text: { content: title },
          },
        ],
      };
    }

    return this.makeRequest(`/pages/${pageId}`, 'PATCH', body);
  }

  async appendContent(pageId: string, content: string): Promise<any> {
    const blocks = this.markdownToBlocks(content);
    
    const body = {
      children: blocks,
    };

    return this.makeRequest(`/blocks/${pageId}/children`, 'PATCH', body);
  }

  async searchPages(query: string, maxResults: number = 10): Promise<any> {
    const body = {
      query,
      filter: {
        property: 'object',
        value: 'page',
      },
      page_size: maxResults,
    };

    return this.makeRequest('/search', 'POST', body);
  }

  async listRecentPages(maxResults: number = 10): Promise<any> {
    const body = {
      filter: {
        property: 'object',
        value: 'page',
      },
      sorts: [
        {
          property: 'last_edited_time',
          direction: 'descending',
        },
      ],
      page_size: maxResults,
    };

    return this.makeRequest('/search', 'POST', body);
  }
}

function extractTitle(page: any): string {
  if (page.properties?.title?.title) {
    return page.properties.title.title
      .map((t: any) => t.plain_text)
      .join('');
  }
  if (page.properties?.Name?.title) {
    return page.properties.Name.title
      .map((t: any) => t.plain_text)
      .join('');
  }
  return '(Untitled)';
}

function formatPagesList(response: any): string {
  const pages = response.results || [];
  
  if (pages.length === 0) {
    return 'No pages found.';
  }

  let output = `Found ${pages.length} page(s):\n\n`;
  
  pages.forEach((page: any, index: number) => {
    const title = extractTitle(page);
    const created = new Date(page.created_time).toLocaleString();
    const edited = new Date(page.last_edited_time).toLocaleString();
    
    output += `${index + 1}. **${title}**\n`;
    output += `   Created: ${created}\n`;
    output += `   Last Edited: ${edited}\n`;
    output += `   ID: ${page.id}\n`;
    output += `   URL: ${page.url}\n`;
    output += '\n';
  });

  return output;
}

function formatPage(page: any, content?: string): string {
  const title = extractTitle(page);
  
  let output = `**${title}**\n\n`;
  output += `Created: ${new Date(page.created_time).toLocaleString()}\n`;
  output += `Last Edited: ${new Date(page.last_edited_time).toLocaleString()}\n`;
  output += `Page ID: ${page.id}\n`;
  output += `URL: ${page.url}\n`;
  
  if (content) {
    output += `\n---\n\n**Content:**\n\n${content}\n`;
  }
  
  return output;
}

async function execute(params: z.infer<typeof inputSchema>): Promise<ToolResult> {
  try {
    // Check if Notion is configured
    if (!notionNotesConfig || !notionNotesConfig.apiKey) {
      return {
        success: false,
        error: 'Notion notes is not configured. Please set your Notion API key in the configuration.',
      };
    }

    const client = new NotionNotesClient(notionNotesConfig.apiKey);
    const { action } = params;

    logger.debug(`Executing Notion notes action: ${action}`, params);

    switch (action) {
      case 'create_page': {
        if (!params.title) {
          return {
            success: false,
            error: 'title is required for create_page action',
          };
        }

        const page = await client.createPage({
          parentPageId: params.parent_page_id,
          title: params.title,
          content: params.content,
        });

        return {
          success: true,
          output: `Page created successfully!\n\n${formatPage(page)}`,
        };
      }

      case 'get_page': {
        if (!params.page_id) {
          return {
            success: false,
            error: 'page_id is required for get_page action',
          };
        }

        const page = await client.getPage(params.page_id);
        const contentResponse = await client.getPageContent(params.page_id);
        const content = client['blocksToMarkdown'](contentResponse.results || []);

        return {
          success: true,
          output: formatPage(page, content),
        };
      }

      case 'update_page': {
        if (!params.page_id) {
          return {
            success: false,
            error: 'page_id is required for update_page action',
          };
        }

        const page = await client.updatePage(params.page_id, params.title);

        return {
          success: true,
          output: `Page updated successfully!\n\n${formatPage(page)}`,
        };
      }

      case 'append_content': {
        if (!params.page_id || !params.content) {
          return {
            success: false,
            error: 'page_id and content are required for append_content action',
          };
        }

        await client.appendContent(params.page_id, params.content);
        const page = await client.getPage(params.page_id);

        return {
          success: true,
          output: `Content appended successfully!\n\n${formatPage(page)}`,
        };
      }

      case 'search_pages': {
        if (!params.query) {
          return {
            success: false,
            error: 'query is required for search_pages action',
          };
        }

        const response = await client.searchPages(params.query, params.max_results);
        return {
          success: true,
          output: formatPagesList(response),
        };
      }

      case 'list_pages': {
        const response = await client.listRecentPages(params.max_results);
        return {
          success: true,
          output: `Recent pages:\n\n${formatPagesList(response)}`,
        };
      }

      default:
        return {
          success: false,
          error: `Unknown action: ${action}`,
        };
    }
  } catch (error: any) {
    logger.error(error, 'Notion notes tool execution error');
    return {
      success: false,
      error: error.message || 'Unknown error during Notion notes operation',
    };
  }
}

export const notionNotesTool: Tool = {
  name: 'notion_notes',
  description: `Create and manage notes pages in Notion workspace.
  
Available actions:
- create_page: Create a new page (requires title; optional: parent_page_id, content in markdown)
- get_page: Get page details and content (requires page_id)
- update_page: Update page title (requires page_id; optional: title)
- append_content: Add content to existing page (requires page_id, content in markdown)
- search_pages: Search for pages by query (requires query; optional: max_results)
- list_pages: List recent pages (optional: max_results)

Content should be in markdown format. Supports:
- Headers (# ## ###)
- Bullet lists (- or *)
- Numbered lists (1. 2. 3.)
- Code blocks (\`\`\`language)
- Quotes (> text)
- Regular paragraphs

Note: Notion API must be configured with an integration token before use.`,
  inputSchema,
  execute,
};
