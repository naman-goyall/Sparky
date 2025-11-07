# Slash Commands

School Agent now supports slash commands for controlling the chat session. These commands provide quick access to common actions without needing to interact with the AI agent.

## Autocomplete

When you type `/` in the chat, an autocomplete dropdown will appear showing all available commands:

- **↑/↓ Arrow Keys**: Navigate through suggestions
- **Tab**: Select the highlighted command (stays in input for editing)
- **Enter**: Select the highlighted command (stays in input, does NOT execute)
- **Esc**: Close the suggestions without selecting
- **Continue typing**: Filter commands by name or alias

The autocomplete supports fuzzy matching, so typing `/e` will show `/exit`, and typing `/q` will also show `/exit` (via its alias).

## Available Commands

### `/clear`
**Description:** Clear the conversation history and start fresh

**Usage:**
```
/clear
```

This command:
- Clears all messages from the UI
- Resets the conversation history in the agent
- Resets the token counter to 0
- Allows you to start a new conversation without restarting the CLI

**When to use:**
- When you want to change topics completely
- When the context window is getting too large
- When you want to start debugging a different issue

---

### `/exit` (aliases: `/quit`, `/q`)
**Description:** Exit the chat and return to terminal

**Usage:**
```
/exit
/quit
/q
```

This command:
- Gracefully exits the chat session
- Shows a goodbye message
- Returns you to your terminal prompt

**Note:** You can also press `Ctrl+C` at any time to exit.

---

### `/help` (alias: `/?`)
**Description:** Show available slash commands

**Usage:**
```
/help
/?
```

This command displays:
- A list of all available slash commands
- Command aliases
- Brief descriptions of what each command does

---

## Implementation Details

### Architecture

The slash command system is implemented with a clean separation of concerns:

1. **Command Definition** (`src/cli/slash-commands.ts`)
   - Defines the `SlashCommand` interface
   - Contains all command implementations
   - Provides parsing and execution logic

2. **Autocomplete Component** (`src/cli/command-suggestions.tsx`)
   - Renders the suggestion dropdown
   - Filters commands based on user input
   - Displays command names, aliases, and descriptions
   - Highlights the selected suggestion

3. **UI Integration** (`src/cli/ui.tsx`)
   - Detects slash commands in user input
   - Shows/hides autocomplete dropdown
   - Handles keyboard navigation (arrow keys, tab, enter, escape)
   - Creates command context with necessary callbacks
   - Handles command results and updates UI accordingly

### Command Context

Each command receives a `CommandContext` object with access to:
- `clearMessages()`: Clear the message history
- `exit()`: Exit the application
- `getTokenCount()`: Get current token usage

### Command Results

Commands return a `CommandResult` with:
- `type`: One of `'success'`, `'error'`, `'exit'`, or `'clear'`
- `message`: Optional message to display to the user

### Adding New Commands

To add a new slash command:

1. Add the command definition to `SLASH_COMMANDS` array in `src/cli/slash-commands.ts`:

```typescript
{
  name: 'mycommand',
  aliases: ['mc', 'alias'],
  description: 'Description of what the command does',
  execute: (_args, context) => {
    // Your command logic here
    return {
      type: 'success',
      message: 'Command executed successfully',
    };
  },
}
```

2. If your command needs new context methods, add them to the `CommandContext` interface
3. Implement the context methods in the UI component where `commandContext` is created

### Design Inspiration

The slash command system was inspired by:
- **Gemini CLI**: Clean command structure with built-in and custom commands
- **OpenCode**: Simple slash command parsing and execution in TUI

Key design decisions:
- Use forward slash (`/`) for commands (standard CLI convention)
- Commands are case-insensitive for better UX
- Support for command aliases (e.g., `/q` for `/quit`)
- Graceful error handling for unknown commands
- Minimal dependencies - pure TypeScript implementation

---

## Examples

### Using Autocomplete
```
> /
┌─────────────────────────────────────────────────────────────────┐
│ Commands (↑↓ to navigate, Tab/Enter to select, Esc to cancel)  │
│ → /clear - Clear the conversation history and start fresh      │
│   /exit (/quit, /q) - Exit the chat and return to terminal     │
│   /help (/?) - Show available slash commands                   │
└─────────────────────────────────────────────────────────────────┘

> /e
┌─────────────────────────────────────────────────────────────────┐
│ Commands (↑↓ to navigate, Tab/Enter to select, Esc to cancel)  │
│ → /exit (/quit, /q) - Exit the chat and return to terminal     │
└─────────────────────────────────────────────────────────────────┘
```

### Starting a Fresh Conversation
```
> How do I create a React component?
✦ To create a React component...

> /clear
✓ Conversation history cleared

> Now help me with Python
```

### Getting Help
```
> /help

**Available Commands:**

- **/clear**: Clear the conversation history and start fresh
- **/exit** (/quit, /q): Exit the chat and return to terminal
- **/help** (/?): Show available slash commands

Type your message normally to chat with the agent.
```

### Exiting the Chat
```
> Thanks for your help!
✦ You're welcome!

> /exit
Goodbye! 👋
$
```

---

## Future Enhancements

Potential future slash commands:
- `/save <name>`: Save conversation checkpoint
- `/load <name>`: Load saved conversation
- `/tokens`: Show detailed token usage
- `/model <name>`: Switch AI model
- `/debug`: Toggle debug mode
- `/export <file>`: Export conversation to file
- Custom user-defined commands from config files
