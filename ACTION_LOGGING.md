# Action Logging

The School Agent CLI includes action logging that records all agent interactions to a `log.json` file. This provides full observability into the agent's behavior and is useful for debugging, auditing, and understanding what the agent is doing.

## Features

- **Always enabled**: Logging is on by default for maximum observability
- **Session-based logging**: Each conversation is logged as a separate session
- **Comprehensive tracking**: Logs user messages, assistant responses, tool uses, tool results, and errors
- **Automatic cleanup**: Automatically manages log file size and age
- **Structured format**: JSON format for easy parsing and analysis

## Configuration

Action logging is **always enabled** and configured with these defaults:

```typescript
// In src/utils/action-logger.ts
const LOGGING_ENABLED = true;
const MAX_FILE_SIZE_MB = 10;  // Cleanup when file exceeds 10MB
const MAX_AGE_DAYS = 7;       // Remove sessions older than 7 days
```

To change these settings, edit the constants in `src/utils/action-logger.ts`.

## Log Structure

The `log.json` file contains an array of sessions:

```json
[
  {
    "sessionId": "session_1699564800000_abc123",
    "startTime": "2025-11-06T23:00:00.000Z",
    "endTime": "2025-11-06T23:05:30.000Z",
    "actions": [
      {
        "timestamp": "2025-11-06T23:00:00.000Z",
        "type": "user_message",
        "data": {
          "message": "Show me my Canvas courses"
        }
      },
      {
        "timestamp": "2025-11-06T23:00:01.000Z",
        "type": "assistant_response",
        "data": {
          "content": [
            {
              "type": "text",
              "text": "I'll fetch your Canvas courses."
            },
            {
              "type": "tool_use",
              "id": "toolu_123",
              "name": "canvas",
              "input": {
                "action": "list_courses"
              }
            }
          ]
        }
      },
      {
        "timestamp": "2025-11-06T23:00:02.000Z",
        "type": "tool_use",
        "data": {
          "toolName": "canvas",
          "input": {
            "action": "list_courses"
          }
        }
      },
      {
        "timestamp": "2025-11-06T23:00:03.000Z",
        "type": "tool_result",
        "data": {
          "toolName": "canvas",
          "result": {
            "success": true,
            "output": "Found 5 courses..."
          },
          "success": true
        }
      }
    ]
  }
]
```

## Action Types

### 1. User Message
Logs messages sent by the user:
```json
{
  "type": "user_message",
  "data": {
    "message": "string"
  }
}
```

### 2. Assistant Response
Logs the full response from Claude, including text and tool use blocks:
```json
{
  "type": "assistant_response",
  "data": {
    "content": [/* Anthropic content blocks */]
  }
}
```

### 3. Tool Use
Logs when the agent decides to use a tool:
```json
{
  "type": "tool_use",
  "data": {
    "toolName": "string",
    "input": {/* tool parameters */}
  }
}
```

### 4. Tool Result
Logs the result of tool execution:
```json
{
  "type": "tool_result",
  "data": {
    "toolName": "string",
    "result": {/* tool output */},
    "success": boolean
  }
}
```

### 5. Error
Logs any errors that occur:
```json
{
  "type": "error",
  "data": {
    "message": "string",
    "stack": "string",
    "context": "string"
  }
}
```

## Automatic Cleanup

The action logger automatically manages the log file to prevent it from growing too large:

### Size-based Cleanup
When the log file exceeds 10MB:
- Keeps the most recent 50% of sessions
- Older sessions are removed
- Triggered at the start of each new session

### Age-based Cleanup
When the log file is older than 7 days:
- Removes sessions older than the specified age
- If all sessions are old, deletes the entire file
- Triggered at the start of each new session

## Use Cases

### 1. Debugging
Review the exact sequence of actions the agent took:
```bash
# Run your command (logging is automatic)
npm start chat

# Review the log
cat log.json | jq '.[0].actions[] | select(.type == "tool_use")'
```

### 2. Auditing
Track what tools were used and when:
```bash
# Find all tool uses
cat log.json | jq '.[] | .actions[] | select(.type == "tool_use") | {time: .timestamp, tool: .data.toolName}'
```

### 3. Performance Analysis
Analyze session duration and tool execution:
```bash
# Calculate session durations
cat log.json | jq '.[] | {session: .sessionId, duration: (.endTime | fromdateiso8601) - (.startTime | fromdateiso8601)}'
```

### 4. Error Tracking
Find all errors across sessions:
```bash
# List all errors
cat log.json | jq '.[] | .actions[] | select(.type == "error")'
```

## Privacy Considerations

⚠️ **Important**: The log file may contain sensitive information:

- User messages and queries
- File contents read by the agent
- API responses from Canvas, Notion, etc.
- Error messages with stack traces

**Best Practices:**
1. Never commit `log.json` to version control (already in `.gitignore`)
2. Delete the log file periodically if it contains sensitive data
3. Be careful when sharing logs with others
4. Automatic cleanup keeps the file size manageable
5. Review logs to understand agent behavior and improve workflows

## Manual Cleanup

To manually delete the log file:

```bash
# Delete the log file
rm log.json
```

Or programmatically:

```typescript
import { actionLogger } from './src/utils/action-logger.js';

// Force delete the log file
await actionLogger.forceCleanup();
```

## Disabling Logging

Logging is always enabled for observability. To disable it:

1. Edit `src/utils/action-logger.ts`
2. Change `const LOGGING_ENABLED = true;` to `false`
3. Rebuild the project: `npm run build`

Note: Logging is lightweight and recommended to keep enabled for debugging purposes.

## Performance Impact

- Minimal memory overhead (logs written to disk after each session)
- Negligible performance impact (async file operations)
- Automatic cleanup prevents disk space issues
- Recommended to keep enabled for full observability

## Troubleshooting

### Log file not being created

**Cause**: File system permissions or path issues

**Solution**:
- Check you have write permissions in the project directory
- Verify the agent is running from the correct directory
- Check for any file system errors in the console

### Log file growing too large

**Cause**: High usage or cleanup thresholds need adjustment

**Solution**:
- Edit `src/utils/action-logger.ts` to reduce `MAX_FILE_SIZE_MB` (e.g., to 5 or 2)
- Edit `src/utils/action-logger.ts` to reduce `MAX_AGE_DAYS` (e.g., to 3 or 1)
- Manually delete the log file: `rm log.json`
- Rebuild after changes: `npm run build`

### Cannot read log file

**Cause**: Invalid JSON format

**Solution**:
- The file may be corrupted
- Delete it and let the agent create a new one
- Use `jq` to validate: `jq . log.json`

## Example Analysis Scripts

### Count tool uses by type
```bash
cat log.json | jq '[.[] | .actions[] | select(.type == "tool_use") | .data.toolName] | group_by(.) | map({tool: .[0], count: length})'
```

### Find failed tool executions
```bash
cat log.json | jq '.[] | .actions[] | select(.type == "tool_result" and .data.success == false)'
```

### Extract all user messages
```bash
cat log.json | jq '.[] | .actions[] | select(.type == "user_message") | .data.message'
```

### Get session summary
```bash
cat log.json | jq '.[] | {session: .sessionId, start: .startTime, end: .endTime, actions: (.actions | length)}'
```

## Integration with Other Tools

The structured JSON format makes it easy to integrate with:

- **Analytics tools**: Parse and visualize agent behavior
- **Monitoring systems**: Track errors and performance
- **Testing frameworks**: Verify agent actions in tests
- **CI/CD pipelines**: Audit agent behavior in automated workflows

## Future Enhancements

Potential future improvements:
- Export logs to different formats (CSV, SQLite)
- Real-time log streaming
- Log filtering and search
- Integration with logging services (e.g., Datadog, LogRocket)
- Performance metrics and statistics

---

**Note**: This feature is designed for development and debugging. For production use, consider implementing more robust logging infrastructure.
