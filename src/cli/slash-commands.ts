export interface SlashCommand {
  name: string;
  aliases?: string[];
  description: string;
  execute: (args: string, context: CommandContext) => CommandResult;
}

export interface CommandContext {
  clearMessages: () => void;
  exit: () => void;
  getTokenCount: () => number;
}

export interface CommandResult {
  type: 'success' | 'error' | 'exit' | 'clear';
  message?: string;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    name: 'clear',
    description: 'Clear the conversation history and start fresh',
    execute: (_args, context) => {
      context.clearMessages();
      return {
        type: 'clear',
        message: '✓ Conversation history cleared',
      };
    },
  },
  {
    name: 'exit',
    aliases: ['quit', 'q'],
    description: 'Exit the chat and return to terminal',
    execute: (_args, context) => {
      context.exit();
      return {
        type: 'exit',
        message: 'Goodbye! 👋',
      };
    },
  },
  {
    name: 'help',
    aliases: ['?'],
    description: 'Show available slash commands',
    execute: () => {
      const helpText = [
        '**Available Commands:**',
        '',
        ...SLASH_COMMANDS.map(cmd => {
          const aliases = cmd.aliases ? ` (${cmd.aliases.map(a => `/${a}`).join(', ')})` : '';
          return `- **/${cmd.name}**${aliases}: ${cmd.description}`;
        }),
        '',
        'Type your message normally to chat with the agent.',
      ].join('\n');

      return {
        type: 'success',
        message: helpText,
      };
    },
  },
];

export function parseSlashCommand(input: string): { command: string; args: string } | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith('/')) {
    return null;
  }

  const withoutSlash = trimmed.slice(1);
  const spaceIndex = withoutSlash.indexOf(' ');

  if (spaceIndex === -1) {
    return {
      command: withoutSlash.toLowerCase(),
      args: '',
    };
  }

  return {
    command: withoutSlash.slice(0, spaceIndex).toLowerCase(),
    args: withoutSlash.slice(spaceIndex + 1).trim(),
  };
}

export function findCommand(commandName: string): SlashCommand | undefined {
  return SLASH_COMMANDS.find(
    cmd => cmd.name === commandName || cmd.aliases?.includes(commandName)
  );
}

export function executeSlashCommand(
  input: string,
  context: CommandContext
): CommandResult | null {
  const parsed = parseSlashCommand(input);
  if (!parsed) {
    return null;
  }

  const command = findCommand(parsed.command);
  if (!command) {
    return {
      type: 'error',
      message: `Unknown command: /${parsed.command}. Type /help for available commands.`,
    };
  }

  return command.execute(parsed.args, context);
}
