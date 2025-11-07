# Sparky Startup Screen Design

## Overview

Implemented a beautiful ASCII art startup screen inspired by Gemini CLI, featuring the "SPARKY" branding with helpful tips and token tracking.

## Features

### 1. ASCII Art Banner
```
 ███████╗██████╗  █████╗ ██████╗ ██╗  ██╗██╗   ██╗
 ██╔════╝██╔══██╗██╔══██╗██╔══██╗██║ ██╔╝╚██╗ ██╔╝
 ███████╗██████╔╝███████║██████╔╝█████╔╝  ╚████╔╝ 
 ╚════██║██╔═══╝ ██╔══██║██╔══██╗██╔═██╗   ╚██╔╝  
 ███████║██║     ██║  ██║██║  ██║██║  ██╗   ██║   
 ╚══════╝╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   
```

### 2. Startup Tips
- Ask questions, edit files, or run commands
- Be specific for the best results
- The agent remembers context within your session
- Press Ctrl+C to exit at any time

### 3. Status Bar
- Current working directory
- Token usage counter (updates after each conversation)

### 4. Input Prompt
- Bordered input area with helpful hint: "Type your message or @path/to/file"

## Implementation Details

### File Modified
- `src/cli/ui.tsx`

### Key Changes

1. **ASCII Art Constant**
   ```typescript
   const SPARKY_ASCII = `...`;
   ```

2. **Startup Tips Array**
   ```typescript
   const STARTUP_TIPS = [
     '1. Ask questions, edit files, or run commands.',
     '2. Be specific for the best results.',
     '3. The agent remembers context within your session.',
     '4. Press Ctrl+C to exit at any time.',
   ];
   ```

3. **State Management**
   ```typescript
   const [totalTokens, setTotalTokens] = useState(0);
   ```

4. **Persistent Banner**
   - Banner is **always visible** throughout the session
   - Matches Gemini CLI behavior
   - Provides consistent branding and tips

5. **Placeholder Text**
   - Shows "Type your message or @path/to/file" when input is empty
   - Inverted cursor at the start of placeholder
   - Disappears when user starts typing

6. **Token Tracking**
   - Updates `totalTokens` after each conversation turn
   - Always visible in status line below input box

## User Experience Flow

### On Startup (Empty Input)
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ███████╗██████╗  █████╗ ██████╗ ██╗  ██╗██╗   ██╗   │
│  ██╔════╝██╔══██╗██╔══██╗██╔══██╗██║ ██╔╝╚██╗ ██╔╝   │
│  ███████╗██████╔╝███████║██████╔╝█████╔╝  ╚████╔╝    │
│  ╚════██║██╔═══╝ ██╔══██║██╔══██╗██╔═██╗   ╚██╔╝     │
│  ███████║██║     ██║  ██║██║  ██║██║  ██╗   ██║      │
│  ╚══════╝╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝      │
│                                                         │
│  AI coding assistant for students • Powered by Claude  │
│                                                         │
│  Tips for getting started:                             │
│  1. Ask questions, edit files, or run commands.        │
│  2. Be specific for the best results.                  │
│  3. The agent remembers context within your session.   │
│  4. Press Ctrl+C to exit at any time.                  │
│                                                         │
│  ╭───────────────────────────────────────────────────╮ │
│  │ → █ Type your message or @path/to/file            │ │
│  ╰───────────────────────────────────────────────────╯ │
│  /Users/name/project • 0 tokens used                   │
└─────────────────────────────────────────────────────────┘
```

### After Messages (Banner Stays Visible)
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ███████╗██████╗  █████╗ ██████╗ ██╗  ██╗██╗   ██╗   │
│  ██╔════╝██╔══██╗██╔══██╗██╔══██╗██║ ██╔╝╚██╗ ██╔╝   │
│  ███████╗██████╔╝███████║██████╔╝█████╔╝  ╚████╔╝    │
│  ╚════██║██╔═══╝ ██╔══██║██╔══██╗██╔═██╗   ╚██╔╝     │
│  ███████║██║     ██║  ██║██║  ██║██║  ██╗   ██║      │
│  ╚══════╝╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝      │
│                                                         │
│  AI coding assistant for students • Powered by Claude  │
│                                                         │
│  Tips for getting started:                             │
│  1. Ask questions, edit files, or run commands.        │
│  2. Be specific for the best results.                  │
│  3. The agent remembers context within your session.   │
│  4. Press Ctrl+C to exit at any time.                  │
│                                                         │
│ → hello                                                 │
│                                                         │
│ ✦ Hello! How can I help you today?                     │
│                                                         │
│  ╭───────────────────────────────────────────────────╮ │
│  │ → █ Type your message or @path/to/file            │ │
│  ╰───────────────────────────────────────────────────╯ │
│  /Users/name/project • 1234 tokens used                │
└─────────────────────────────────────────────────────────┘
```

## Design Inspiration

Based on [Gemini CLI](https://github.com/google-gemini/gemini-cli) startup screen:
- Clean ASCII art branding
- Helpful tips for new users
- Status information (directory, tokens)
- Professional yet friendly appearance

## Benefits

1. **Professional Branding** - "Sparky" name with eye-catching ASCII art
2. **User Guidance** - Tips always visible to help users
3. **Context Awareness** - Shows current directory and token usage
4. **Persistent Identity** - Banner stays visible throughout session (like Gemini CLI)
5. **Helpful Placeholder** - Clear guidance when input is empty
6. **Token Visibility** - Users can track API usage throughout session

## Future Enhancements

Potential improvements:
- Color gradient for ASCII art (like Gemini CLI)
- Animated loading phrases during processing
- Customizable tips via configuration
- Different ASCII art sizes based on terminal width
- Welcome message personalization

---

**Status**: ✅ Implemented and tested
**Build**: Successful
**Ready for use**: Yes
