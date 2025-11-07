import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { AgentController } from '../agent/controller.js';

interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool' | 'file_change';
  content: string;
  toolName?: string;
  toolInput?: any;
  toolOutput?: string;
  fileName?: string;
  lineChanges?: string;
  diffContent?: string;
  executionTime?: string;
}

interface ChatUIProps {
  agent: AgentController;
}

const SPARKY_ASCII = `
 ███████╗██████╗  █████╗ ██████╗ ██╗  ██╗██╗   ██╗
 ██╔════╝██╔══██╗██╔══██╗██╔══██╗██║ ██╔╝╚██╗ ██╔╝
 ███████╗██████╔╝███████║██████╔╝█████╔╝  ╚████╔╝ 
 ╚════██║██╔═══╝ ██╔══██║██╔══██╗██╔═██╗   ╚██╔╝  
 ███████║██║     ██║  ██║██║  ██║██║  ██╗   ██║   
 ╚══════╝╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   
`;

const STARTUP_TIPS = [
  '1. Ask questions, edit files, or run commands.',
  '2. Be specific for the best results.',
  '3. The agent remembers context within your session.',
  '4. Press Ctrl+C to exit at any time.',
];

export const ChatUI: React.FC<ChatUIProps> = ({ agent }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentToolUse, setCurrentToolUse] = useState<string | null>(null);
  const [totalTokens, setTotalTokens] = useState(0);

  useInput((inputChar, key) => {
    if (isProcessing) return;

    if (key.return) {
      if (input.trim()) {
        handleSubmit(input.trim());
        setInput('');
      }
    } else if (key.backspace || key.delete) {
      setInput(prev => prev.slice(0, -1));
    } else if (!key.ctrl && !key.meta && inputChar) {
      setInput(prev => prev + inputChar);
    }
  });

  const parseFileChanges = (result: string, toolName: string): Array<{fileName: string, lineChanges: string, diffContent?: string}> => {
    const changes: Array<{fileName: string, lineChanges: string, diffContent?: string}> = [];
    
    // Match patterns for different tools
    if (toolName === 'write_file' || toolName === 'edit_file' || toolName === 'search_replace') {
      // Look for file paths and change counts
      const fileMatch = result.match(/(?:Modified|Created|Edited|Updated)\s+file:\s*(.+?)(?:\n|$)/i) ||
                        result.match(/(?:Modified|Created|Edited|Updated)\s+(.+?)(?:\n|:)/);
      const changesMatch = result.match(/\+(\d+)\s+-(\d+)/);
      
      if (fileMatch) {
        const fileName = fileMatch[1].trim().replace(/\s+\(.*?\)$/, '');
        let lineChanges = '';
        
        if (changesMatch) {
          const added = parseInt(changesMatch[1]);
          const removed = parseInt(changesMatch[2]);
          lineChanges = `+${added} -${removed}`;
        } else {
          // Check for just "Created" with size
          const sizeMatch = result.match(/Size:\s+(\d+)\s+bytes/);
          if (sizeMatch && result.includes('Created')) {
            const lines = Math.ceil(parseInt(sizeMatch[1]) / 50);
            lineChanges = '+' + lines;
          }
        }
        
        // Extract diff content
        const diffMatch = result.match(/---[\s\S]*?\+\+\+[\s\S]*?(?=\n\n|\n[A-Z]|$)/);
        const diffContent = diffMatch ? diffMatch[0] : undefined;
        
        changes.push({ fileName, lineChanges, diffContent });
      }
    } else if (toolName === 'apply_patch') {
      const fileMatch = result.match(/Applied patch to\s+(.+?)(?:\n|$)/);
      const changesMatch = result.match(/Changes:\s+\+(\d+)\s+-(\d+)/);
      
      if (fileMatch && changesMatch) {
        const diffMatch = result.match(/---[\s\S]*?\+\+\+[\s\S]*?(?=\n\n|\n[A-Z]|$)/);
        changes.push({
          fileName: fileMatch[1].trim(),
          lineChanges: `+${changesMatch[1]} -${changesMatch[2]}`,
          diffContent: diffMatch ? diffMatch[0] : undefined,
        });
      }
    }
    
    return changes;
  };

  const handleSubmit = async (userMessage: string) => {
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsProcessing(true);

    try {
      let assistantMessage = '';
      let currentAssistantIndex = -1;

      // Stream response
      for await (const chunk of agent.chat(userMessage)) {
        if (chunk.type === 'content' && chunk.content) {
          assistantMessage += chunk.content;
          // Update the assistant message in real-time
          setMessages(prev => {
            const newMessages = [...prev];
            if (currentAssistantIndex === -1) {
              // First content chunk - create assistant message
              newMessages.push({ role: 'assistant', content: assistantMessage });
              currentAssistantIndex = newMessages.length - 1;
            } else {
              // Update existing assistant message
              newMessages[currentAssistantIndex].content = assistantMessage;
            }
            return newMessages;
          });
        } else if (chunk.type === 'tool_use' && chunk.toolName) {
          // Show tool being used
          setCurrentToolUse(chunk.toolName);
          
          // Only add a new tool message if the last message isn't already the same tool
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            const isDuplicateTool = lastMessage?.role === 'tool' && 
                                   lastMessage?.toolName === chunk.toolName &&
                                   !lastMessage?.executionTime; // Not yet completed
            
            if (isDuplicateTool) {
              // Don't add duplicate tool message
              return prev;
            }
            
            return [
              ...prev,
              {
                role: 'tool',
                content: `Using ${chunk.toolName}...`,
                toolName: chunk.toolName,
                toolInput: chunk.toolInput,
              },
            ];
          });
          
          // Reset assistant message for next text block
          assistantMessage = '';
          currentAssistantIndex = -1;
        } else if (chunk.type === 'tool_result') {
          setCurrentToolUse(null);
          const result = chunk.toolResult || '';
          
          // Parse file changes from tool results
          const fileChanges = parseFileChanges(result, chunk.toolName || '');
          
          setMessages(prev => {
            const newMessages = [...prev];
            // Update the last tool message with execution time and output
            const lastToolIndex = newMessages.findLastIndex(m => m.role === 'tool');
            if (lastToolIndex !== -1) {
              // Extract execution time from result if available
              const timeMatch = result.match(/(\d+)s$/);
              newMessages[lastToolIndex].executionTime = timeMatch ? timeMatch[1] + 's' : undefined;
              
              // Store the output for all tools
              const output = result.replace(/\s+\d+s$/, '').trim();
              newMessages[lastToolIndex].toolOutput = output;
            }
            
            // Add file change notifications
            if (fileChanges.length > 0) {
              fileChanges.forEach(change => {
                newMessages.push({
                  role: 'file_change',
                  content: change.fileName,
                  fileName: change.fileName,
                  lineChanges: change.lineChanges,
                  diffContent: change.diffContent,
                });
              });
            }
            
            return newMessages;
          });
        } else if (chunk.type === 'error') {
          setMessages(prev => [
            ...prev,
            { role: 'system', content: `❌ Error: ${chunk.error}` },
          ]);
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setMessages(prev => [...prev, { role: 'system', content: `❌ Error: ${errorMsg}` }]);
    } finally {
      setIsProcessing(false);
      setCurrentToolUse(null);
      // Update token count after conversation
      setTotalTokens(agent.getTokenEstimate());
    }
  };

  return (
    <Box flexDirection="column">
      {/* Startup Banner - Always visible */}
      <Box flexDirection="column" marginBottom={1}>
        <Text color="yellow" bold>
          {SPARKY_ASCII}
        </Text>
        <Box marginTop={1} marginBottom={1}>
          <Text color="#ffffff" bold>AI coding assistant for students • Powered by Claude Sonnet 4.5</Text>
        </Box>
        <Box flexDirection="column">
          <Text color="#ff8800" bold>Tips for getting started:</Text>
          {STARTUP_TIPS.map((tip, i) => (
            <Text key={i} color="#ffffff">{tip}</Text>
          ))}
        </Box>
      </Box>

      {/* Messages */}
      <Box flexDirection="column" marginBottom={1}>
        {messages.map((msg, i) => (
          <MessageDisplay key={i} message={msg} />
        ))}
      </Box>

      {/* Input area with border */}
      <Box flexDirection="column">
        <Box borderStyle="round" borderColor="#ff8800" paddingX={1} marginBottom={1}>
          {isProcessing ? (
            <Box>
              {currentToolUse ? (
                <Text color="#ff8800">Executing: {currentToolUse}...</Text>
              ) : (
                <Text color="#ff8800">Thinking...</Text>
              )}
            </Box>
          ) : (
            <Box>
              <Text color="#ff8800" bold>→ </Text>
              {input.length > 0 ? (
                <>
                  <Text color="#ffffff">{input}</Text>
                  <Text color="yellow" bold>█</Text>
                </>
              ) : (
                <>
                  <Text color="yellow" bold>█</Text>
                  <Text color="gray"> Type your message or @path/to/file</Text>
                </>
              )}
            </Box>
          )}
        </Box>
        
        {/* Status line below input */}
        <Box>
          <Text color="white">{process.cwd()}</Text>
          <Text color="white"> • </Text>
          <Text color="#ff8800" bold>{totalTokens} tokens used</Text>
        </Box>
      </Box>
    </Box>
  );
};

interface MessageDisplayProps {
  message: Message;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ message }) => {
  const getColor = (role: string) => {
    switch (role) {
      case 'user':
        return '#666666';
      case 'assistant':
        return '#ffffff';
      case 'system':
        return 'gray';
      case 'tool':
        return '#ff8800';
      case 'file_change':
        return '#ff8800';
      default:
        return 'white';
    }
  };

  const getPrefix = (role: string) => {
    switch (role) {
      case 'user':
        return '> ';
      case 'assistant':
        return '✦ ';
      case 'system':
        return '';
      case 'tool':
        return '';
      case 'file_change':
        return '';
      default:
        return '';
    }
  };

  // Special rendering for all tool executions
  if (message.role === 'tool' && message.toolName) {
    // Get a friendly tool name and summary
    const getToolDisplay = (toolName: string, toolInput: any, toolOutput?: string) => {
      switch (toolName) {
        case 'execute_bash':
          return {
            name: 'ExecuteBash',
            summary: toolInput?.command || 'Executed command',
          };
        case 'list_files':
          // Try to count items from the output
          const lines = toolOutput?.split('\n') || [];
          const itemCount = lines.filter(l => l.trim() && !l.includes('Listed')).length;
          return {
            name: 'ListFiles',
            summary: `Listed ${itemCount} item(s).`,
          };
        case 'read_file':
          return {
            name: 'ReadFile',
            summary: toolInput?.file_path || 'Read file',
          };
        case 'write_file':
          return {
            name: 'WriteFile',
            summary: toolInput?.file_path || 'Wrote file',
          };
        case 'search_files':
          return {
            name: 'SearchFiles',
            summary: toolInput?.query || 'Searched files',
          };
        default:
          return {
            name: toolName,
            summary: message.content || 'Executed',
          };
      }
    };

    const { name, summary } = getToolDisplay(message.toolName, message.toolInput, message.toolOutput);
    
    return (
      <Box flexDirection="column" marginBottom={1}>
        <Box borderStyle="round" borderColor="gray" paddingX={1}>
          <Box flexDirection="column">
            <Box>
              <Text color="green">✓ </Text>
              <Text color="white" bold>{name}</Text>
              {message.toolInput && typeof message.toolInput === 'object' && (
                <>
                  {('path' in message.toolInput) && (
                    <Text color="gray"> {message.toolInput.path}</Text>
                  )}
                  {('command' in message.toolInput) && (
                    <Text color="gray"> {message.toolInput.command}</Text>
                  )}
                </>
              )}
            </Box>
            <Box paddingLeft={3}>
              <Text color="gray">{summary}</Text>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  // Special rendering for file changes
  if (message.role === 'file_change') {
    return (
      <Box flexDirection="column" marginBottom={1}>
        <Box>
          <Text color="green" bold>{message.fileName}</Text>
          {message.lineChanges && (
            <Text color="green"> {message.lineChanges}</Text>
          )}
        </Box>
        {message.diffContent && (
          <Box flexDirection="column" paddingLeft={2}>
            {message.diffContent.split('\n').map((line, idx) => {
              let color = 'white';
              if (line.startsWith('+') && !line.startsWith('+++')) {
                color = 'green';
              } else if (line.startsWith('-') && !line.startsWith('---')) {
                color = 'red';
              } else if (line.startsWith('@@')) {
                color = 'cyan';
              } else {
                color = 'gray';
              }
              return (
                <Text key={idx} color={color as any}>
                  {line}
                </Text>
              );
            })}
          </Box>
        )}
      </Box>
    );
  }

  const renderMarkdownText = (text: string, color: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let key = 0;

    lines.forEach((line, lineIndex) => {
      // Add line break for non-first lines
      if (lineIndex > 0) {
        elements.push(<Text key={`br-${key++}`}>{"\n"}</Text>);
      }

      // Check for headers
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        const headerText = headerMatch[2];
        elements.push(
          <Text key={key++} bold color="cyan">
            {headerText}
          </Text>
        );
        return;
      }

      // Check for code blocks
      if (line.startsWith('```')) {
        elements.push(
          <Text key={key++} color="gray" dimColor>
            {line}
          </Text>
        );
        return;
      }

      // Check for list items
      const listMatch = line.match(/^(\s*)([-*+])\s+(.+)$/);
      if (listMatch) {
        const indent = listMatch[1];
        const content = listMatch[3];
        elements.push(
          <Text key={key++} color="yellow">
            {indent}• 
          </Text>
        );
        elements.push(...renderInlineMarkdown(content, color, key));
        key += 100; // Increment to avoid key conflicts
        return;
      }

      // Regular line with inline markdown
      if (line.trim()) {
        elements.push(...renderInlineMarkdown(line, color, key));
        key += 100; // Increment to avoid key conflicts
      }
    });

    return <Text color={color as any}>{elements}</Text>;
  };

  const renderInlineMarkdown = (text: string, color: string, startKey: number = 0): JSX.Element[] => {
    const parts: JSX.Element[] = [];
    let key = startKey;

    // Combined regex for bold, italic, and inline code
    const inlineRegex = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)|(~~([^~]+)~~)/g;
    let match;
    let lastIndex = 0;

    while ((match = inlineRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(
          <Text key={key++} color={color as any}>
            {text.substring(lastIndex, match.index)}
          </Text>
        );
      }

      // Determine which pattern matched and render accordingly
      if (match[1]) {
        // Bold **text**
        parts.push(
          <Text key={key++} bold color={color as any}>
            {match[2]}
          </Text>
        );
      } else if (match[3]) {
        // Italic *text*
        parts.push(
          <Text key={key++} italic color={color as any}>
            {match[4]}
          </Text>
        );
      } else if (match[5]) {
        // Inline code `text`
        parts.push(
          <Text key={key++} color="magenta" backgroundColor="black">
            {match[6]}
          </Text>
        );
      } else if (match[7]) {
        // Strikethrough ~~text~~
        parts.push(
          <Text key={key++} strikethrough color={color as any}>
            {match[8]}
          </Text>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <Text key={key++} color={color as any}>
          {text.substring(lastIndex)}
        </Text>
      );
    }

    // If no markdown found, return plain text
    if (parts.length === 0) {
      parts.push(
        <Text key={key} color={color as any}>
          {text}
        </Text>
      );
    }

    return parts;
  };

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text color={getColor(message.role)}>
          {getPrefix(message.role)}
        </Text>
        {renderMarkdownText(message.content, getColor(message.role))}
      </Box>
    </Box>
  );
};
