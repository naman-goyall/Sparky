# Notion Calendar Tool Reference

## Overview

The Notion Calendar tool provides integration with Notion API to manage calendar events stored in a Notion database. This is the **simplest calendar integration** for students.

## Tool Name

`notion_calendar`

## Authentication

The tool requires minimal Notion API credentials:
- **API Key**: Notion integration token (starts with `secret_`)
- **Database ID**: The ID of your Notion calendar database

Configuration is loaded from environment variables:
```bash
NOTION_API_KEY=secret_your_token_here
NOTION_DATABASE_ID=your_database_id_here
```

### Why Notion is Best for Students

✅ **Simplest Setup**: Only 2 values needed  
✅ **No Expiration**: Token never expires  
✅ **No OAuth**: No complex authentication flow  
✅ **2-Minute Setup**: Fastest to get running  
✅ **Flexible**: Add custom properties  
✅ **Integrated**: Works with your existing Notion workspace  

## Required Database Properties

Your Notion calendar database should have these properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `Name` | Title | ✅ Yes | Event title |
| `Date` | Date | ✅ Yes | Event date/time |
| `Description` | Text | Optional | Event details |
| `Location` | Text | Optional | Event location |
| `Tags` | Multi-select | Optional | Event categories |

**Note**: Property names are case-sensitive and must match exactly.

## Actions

### 1. list_events

Lists upcoming events from the Notion calendar database.

**Parameters**:
- `max_results` (optional): Maximum number of events to return (default: 10)

**Example Usage**:
```typescript
{
  action: 'list_events',
  max_results: 20
}
```

**Returns**:
- Event title
- Start and end dates/times
- Location (if set)
- Tags (if set)
- Event ID (Notion page ID)
- Notion URL

**Behavior**:
- Only returns events with dates on or after today
- Sorted by date (ascending)
- Filters out past events automatically

### 2. get_event

Gets detailed information about a specific event.

**Parameters**:
- `event_id` (required): The Notion page ID of the event

**Example Usage**:
```typescript
{
  action: 'get_event',
  event_id: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
}
```

**Returns**:
- Full event title
- Start and end dates/times
- Location
- Full description
- Tags
- Created and last updated timestamps
- Notion page ID and URL

### 3. create_event

Creates a new event in the Notion calendar database.

**Parameters**:
- `title` (required): Event title
- `start_date` (required): Event start date/time (ISO 8601 format)
- `end_date` (optional): Event end date/time (ISO 8601 format)
- `description` (optional): Event description
- `location` (optional): Event location
- `tags` (optional): Array of tag names

**Example Usage**:
```typescript
{
  action: 'create_event',
  title: 'CS101 Lecture',
  start_date: '2025-11-06T14:00:00-05:00',
  end_date: '2025-11-06T15:30:00-05:00',
  description: 'Introduction to Data Structures',
  location: 'Room 301',
  tags: ['CS101', 'lecture']
}
```

**Returns**:
- Success confirmation
- Full event details including Notion page ID

### 4. update_event

Updates an existing event in the Notion calendar database.

**Parameters**:
- `event_id` (required): The Notion page ID of the event to update
- `title` (optional): New event title
- `description` (optional): New description
- `location` (optional): New location
- `start_date` (optional): New start date/time
- `end_date` (optional): New end date/time
- `tags` (optional): New tags array

**Note**: Only provided fields will be updated; others remain unchanged.

**Example Usage**:
```typescript
{
  action: 'update_event',
  event_id: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  start_date: '2025-11-06T15:00:00-05:00',
  location: 'Room 401'
}
```

**Returns**:
- Success confirmation
- Updated event details

### 5. delete_event

Archives (deletes) an event from the Notion calendar database.

**Parameters**:
- `event_id` (required): The Notion page ID of the event to delete

**Example Usage**:
```typescript
{
  action: 'delete_event',
  event_id: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6'
}
```

**Returns**:
- Success confirmation with event ID

**Note**: Events are archived, not permanently deleted. You can restore them from Notion's trash.

## Date/Time Format

Dates should be in **ISO 8601 format**:

**With time:**
```
2025-11-06T14:00:00-05:00  # With timezone
2025-11-06T14:00:00        # Local time
```

**Date only (all-day event):**
```
2025-11-06
```

## Error Handling

The tool returns appropriate error messages for:
- Missing configuration (API key or database ID)
- Missing required parameters
- Invalid event IDs
- API errors (401, 403, 404, etc.)
- Network errors
- Database not shared with integration

## Implementation Details

### Notion Client

The tool uses a `NotionClient` class that:
- Makes authenticated requests to Notion API v1
- Uses Bearer token authentication
- Returns JSON responses
- Handles errors gracefully
- **Uses Notion API version 2025-09-03** (latest, future-proof)
- Automatically discovers data source IDs from databases
- Caches data source IDs to minimize API calls

### API Endpoints Used

- `GET /v1/databases/{database_id}` - Get database and data source IDs
- `POST /v1/data_sources/{data_source_id}/query` - List events (new in 2025-09-03)
- `GET /v1/pages/{page_id}` - Get event
- `POST /v1/pages` - Create event (with data_source_id parent)
- `PATCH /v1/pages/{page_id}` - Update event
- `PATCH /v1/pages/{page_id}` (with archived: true) - Delete event

**Note**: The tool uses the latest API version (2025-09-03) which introduces data sources as a concept separate from databases. This makes the tool future-proof and ready for advanced database features.

### Response Formatting

All responses are formatted as markdown-friendly text with:
- Bold headers for event titles
- Structured lists for event details
- Readable date/time formatting
- Tag display
- Notion URLs for easy access

## Security Considerations

1. **Token Storage**: API key is loaded from environment variables
2. **Token Scope**: Token has access only to shared databases
3. **HTTPS Only**: All API requests use HTTPS
4. **No Data Storage**: The tool doesn't store calendar data locally
5. **Token Lifetime**: Tokens don't expire (internal integrations)

## Limitations

### Current Limitations

1. **Single Database**: Only accesses one calendar database
2. **No Recurring Events**: Cannot create recurring events natively
3. **No Reminders**: Cannot set Notion reminders via API
4. **No Attachments**: Cannot add file attachments
5. **Property Names**: Requires specific property names (Name, Date, etc.)

### Notion API Limitations

- **Rate Limit**: 3 requests per second per integration
- **Page Size**: Maximum 100 results per query
- **Property Types**: Limited to supported Notion property types

## Advantages Over Other Calendar Tools

| Feature | Notion | Google Calendar | Outlook |
|---------|--------|-----------------|---------|
| Setup Complexity | ⭐ Simple | ⭐⭐⭐ Complex | ⭐⭐⭐⭐ Very Complex |
| Config Values | 2 | 5 | 5+ |
| Token Expiration | Never | 1 hour | 1 hour |
| OAuth Required | No | Yes | Yes |
| Admin Permissions | No | No | Yes |
| Custom Properties | Yes | No | No |
| Integration | Full workspace | Calendar only | Email only |
| Setup Time | 2 min | 20 min | Blocked |

**Winner**: Notion ✅

## Future Enhancements

Planned additions:
- Support for multiple calendar databases
- Recurring event patterns
- Reminder integration
- File attachment support
- Calendar view generation
- Bulk operations
- Event templates
- Integration with other Notion databases

## Testing

To test the Notion calendar tool:

1. Set up Notion integration and database
2. Configure credentials in `.env`
3. Share database with integration
4. Start the agent: `npm start chat`
5. Try these prompts:
   - "Show me my upcoming events"
   - "Create an event for tomorrow at 2pm"
   - "Get details for event [event_id]"
   - "Update event [event_id]"

## Performance

- **API Calls**: Each action makes 1-2 API requests
- **Rate Limits**: 3 requests per second
- **Response Time**: Typically 200-500ms per request
- **Data Transfer**: Minimal (JSON responses only)

## API Documentation

For more details on Notion API:
- [Notion API Overview](https://developers.notion.com/docs/getting-started)
- [Working with Databases](https://developers.notion.com/docs/working-with-databases)
- [Pages API Reference](https://developers.notion.com/reference/page)
- [Database Query](https://developers.notion.com/reference/post-database-query)

## Integration with Canvas Tool

The Notion calendar tool works great with the Canvas tool:

### Example Workflow
```
1. "Show me my Canvas assignments"
   [Agent lists assignments with due dates]

2. "Create calendar events for all upcoming assignments"
   [Agent creates Notion events for each assignment]

3. "Show me my schedule for next week"
   [Agent shows combined view of events]
```

### Benefits
- Sync Canvas deadlines to your personal calendar
- Add study time for assignments
- Track both coursework and personal events
- All in one Notion workspace

## Example Workflows

### Daily Planning
```
User: "What's on my calendar today?"
Agent: Lists today's events

User: "Create a 2-hour study block at 2pm"
Agent: Creates study session event
```

### Assignment Management
```
User: "Add CS101 project deadline: Nov 15 at 11:59pm"
Agent: Creates deadline event

User: "Tag it with 'important' and 'CS101'"
Agent: Updates event with tags
```

### Meeting Coordination
```
User: "Schedule team meeting Friday 3pm in Library Room 201"
Agent: Creates event with location

User: "Add tags 'group-project' and 'CS101'"
Agent: Updates with tags
```

### Weekly Review
```
User: "Show me all events next week"
Agent: Lists upcoming week

User: "Show me only events tagged 'exam'"
Agent: Filters by tag (via Notion)
```

## Tips for Students

1. **Use Tags Effectively**
   - Create tags for each class
   - Add event type tags (lecture, lab, exam)
   - Filter views by tags in Notion

2. **Link to Other Pages**
   - Link events to class notes
   - Connect to assignment pages
   - Create project timelines

3. **Create Multiple Views**
   - Calendar view for visual schedule
   - Table view for detailed planning
   - Filtered views for each class

4. **Combine with Other Tools**
   - Use with Canvas tool for assignments
   - Link to note-taking pages
   - Track study hours

5. **Leverage Notion Features**
   - Use templates for recurring events
   - Add custom properties as needed
   - Embed calendar in dashboard

## Troubleshooting Quick Reference

| Error | Cause | Solution |
|-------|-------|----------|
| "not configured" | Missing env vars | Set NOTION_API_KEY and NOTION_DATABASE_ID |
| 401 Unauthorized | Invalid API key | Check API key starts with `secret_` |
| 404 Not Found | Wrong database ID | Verify database ID is correct |
| 403 Forbidden | Not shared | Share database with integration |
| Property not found | Wrong property name | Check property names match exactly |

## Best Practices

1. **Database Setup**
   - Use exact property names (case-sensitive)
   - Keep database structure simple
   - Share only necessary databases

2. **Event Management**
   - Use consistent date formats
   - Add descriptive titles
   - Use tags for organization

3. **Security**
   - Keep API key secret
   - Don't share integration access
   - Rotate keys periodically

4. **Performance**
   - Limit query results when possible
   - Use filters effectively
   - Batch operations when feasible

## Comparison Summary

**Why Choose Notion Calendar:**
- ✅ Fastest setup (2 minutes)
- ✅ Simplest authentication (1 token)
- ✅ Never expires
- ✅ Most flexible (custom properties)
- ✅ Best integration (full Notion workspace)
- ✅ Perfect for students

**Choose Google Calendar if:**
- You need native calendar app sync
- You want recurring events
- You prefer traditional calendar interface

**Choose Outlook if:**
- You have admin permissions (unlikely for students)
- Your school requires it
- You need email integration

**For students: Notion is the clear winner!** ✅
