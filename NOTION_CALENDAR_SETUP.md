# Notion Calendar Integration Setup

This guide will help you set up Notion calendar integration with the School Agent CLI using Notion API.

## Overview

The Notion calendar integration allows the agent to:
- List upcoming events from your Notion calendar database
- Create new calendar events
- View event details
- Update existing events
- Archive (delete) events

## Why Notion Calendar?

Notion is the **simplest and best choice** for student calendar management because:

✅ **Super Simple Setup** - Just 2 values needed (API key + database ID)  
✅ **No OAuth Complexity** - No client IDs, secrets, or redirect URIs  
✅ **Token Never Expires** - Set it once, use it forever  
✅ **No Admin Permissions** - Works with any Notion workspace you own  
✅ **2-Minute Setup** - Fastest integration to get running  
✅ **Flexible** - Add custom properties (tags, priorities, notes)  
✅ **All-in-One** - Combine calendar with notes, tasks, and assignments  
✅ **Latest API** - Uses Notion API version 2025-09-03 (future-proof)  

**Comparison:**
- **Notion**: 2 minutes, 2 values, never expires ✅
- **Google Calendar**: 20 minutes, 5 values, expires hourly ❌
- **Outlook**: Requires admin permissions (blocked for school emails) ❌

---

## Prerequisites

- A Notion account (free or paid)
- A Notion workspace where you can create pages and databases

---

## Step-by-Step Setup

### Step 1: Create a Notion Integration

1. **Go to Notion Integrations Page**
   - Navigate to: https://www.notion.so/profile/integrations
   - Or: Click your workspace name → Settings & members → Integrations

2. **Create New Integration**
   - Click **+ New integration**
   - Give it a name: "School Agent" (or your preferred name)
   - Select your workspace
   - Click **Submit**

3. **Copy Your Integration Token**
   - On the integration page, find **Internal Integration Token**
   - Click **Show** and then **Copy**
   - Save this as `NOTION_API_KEY` (starts with `secret_`)
   - ⚠️ **Keep this secret!** Don't share it with anyone

**That's it for authentication!** No OAuth, no expiration, no complexity.

---

### Step 2: Create Your Calendar Database

1. **Create a New Page in Notion**
   - Open Notion
   - Click **+ New page** in your sidebar
   - Name it "Calendar" or "Events" or whatever you prefer

2. **Create a Database**
   - Type `/database` and select **Table - Inline**
   - Or click **+ New** → **Table**

3. **Set Up Required Properties**

   Your database needs these properties (Notion creates some by default):

   | Property Name | Property Type | Required | Description |
   |---------------|---------------|----------|-------------|
   | **Name** | Title | ✅ Yes | Event title (default property) |
   | **Date** | Date | ✅ Yes | Event date/time |
   | **Description** | Text | Optional | Event details |
   | **Location** | Text | Optional | Event location |
   | **Tags** | Multi-select | Optional | Categories (class, meeting, etc.) |

   **To add properties:**
   - Click **+** at the end of the header row
   - Select the property type
   - Name it exactly as shown above (case-sensitive!)

4. **Get Your Database ID**

   **Method 1: From the URL**
   - Open your database as a full page
   - Look at the URL: `https://www.notion.so/workspace/DATABASE_ID?v=...`
   - Copy the `DATABASE_ID` part (32 characters, mix of letters and numbers)
   - Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

   **Method 2: From Share Menu**
   - Click **Share** at the top right
   - Click **Copy link**
   - Extract the ID from the URL

   Save this as `NOTION_DATABASE_ID`

---

### Step 3: Share Database with Integration

This is **crucial** - your integration needs permission to access the database!

1. **Open Your Calendar Database**
   - Go to the database page you created

2. **Click the ••• Menu**
   - At the top right of the page, click the three dots (•••)

3. **Add Connection**
   - Scroll down and click **Add connections**
   - Search for your integration name ("School Agent")
   - Click on it to connect

4. **Confirm**
   - You should see your integration listed under "Connections"
   - The integration now has access to this database!

---

## Configuring School Agent

### Using Environment Variables

1. **Create or edit your `.env` file:**
   ```bash
   cp .env.example .env
   ```

2. **Add your Notion credentials:**
   ```bash
   # Notion Calendar Configuration
   NOTION_API_KEY=secret_your_integration_token_here
   NOTION_DATABASE_ID=your_database_id_here
   ```

   **Example:**
   ```bash
   NOTION_API_KEY=secret_AbC123XyZ789...
   NOTION_DATABASE_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   ```

3. **Save the file**

### Verify Configuration

Start the agent:
```bash
npm start chat
```

You should see: "Notion calendar integration enabled"

---

## Using Notion Calendar Features

Once configured, you can use these commands with the agent:

### List Upcoming Events
```
"Show me my upcoming events"
"What's on my Notion calendar?"
"List my events for this week"
```

### Create Event
```
"Create a calendar event for CS101 lecture tomorrow at 2pm"
"Add a study session to my calendar on Friday at 10am"
"Schedule a meeting with my project team on Monday at 3pm in Library Room 201"
```

### View Event Details
```
"Show me details for event [event_id]"
"Get information about event [event_id]"
```

### Update Event
```
"Update event [event_id] to start at 3pm instead"
"Change the location of event [event_id] to Room 101"
"Add tags 'important' and 'exam' to event [event_id]"
```

### Delete Event
```
"Delete event [event_id]"
"Archive event [event_id]"
```

---

## Available Calendar Actions

| Action | Description | Required Parameters |
|--------|-------------|---------------------|
| `list_events` | Get upcoming events | `max_results` (optional) |
| `get_event` | Get event details | `event_id` |
| `create_event` | Create a new event | `title`, `start_date`; optional: `end_date`, `description`, `location`, `tags` |
| `update_event` | Update an existing event | `event_id`; optional: `title`, `description`, `location`, `start_date`, `end_date`, `tags` |
| `delete_event` | Archive an event | `event_id` |

---

## Date/Time Format

Dates can be in **ISO 8601 format** or simple date format:

**With time:**
```
2025-11-06T14:00:00-05:00  # November 6, 2025, 2:00 PM EST
2025-11-06T14:00:00        # November 6, 2025, 2:00 PM (local time)
```

**Date only:**
```
2025-11-06  # November 6, 2025 (all day event)
```

The agent can help convert natural language times to the correct format!

---

## Security Best Practices

1. **Keep Your API Key Secret**
   - Never share your Notion API key
   - Never commit `.env` file to version control (it's in `.gitignore`)
   - Treat it like a password

2. **Limit Integration Access**
   - Only share necessary databases with your integration
   - Don't share your entire workspace

3. **Rotate Keys Periodically**
   - Create a new integration and update your `.env` file
   - Delete old integrations from Notion settings

4. **Monitor Usage**
   - Check your integration's activity in Notion settings
   - Revoke access if you see suspicious activity

---

## Troubleshooting

### "Notion calendar is not configured" Error

**Cause**: Missing or incomplete configuration

**Solution**:
- Verify both environment variables are set:
  - `NOTION_API_KEY`
  - `NOTION_DATABASE_ID`
- Check for typos in variable names
- Ensure `.env` file is in the project root
- Make sure API key starts with `secret_`

### "Notion API error (401)" - Unauthorized

**Cause**: Invalid API key

**Solution**:
- Verify your API key is correct
- Make sure you copied the entire key (starts with `secret_`)
- Try creating a new integration and using that key

### "Notion API error (404)" - Not Found

**Cause**: Invalid database ID or page ID

**Solution**:
- Verify your database ID is correct (32 characters)
- Make sure you shared the database with your integration
- Check that the database hasn't been deleted

### "Notion API error (403)" - Forbidden

**Cause**: Integration doesn't have access to the database

**Solution**:
- Go to your database page
- Click ••• → Add connections
- Select your integration
- Confirm it's connected

### Database Properties Not Found

**Cause**: Database properties don't match expected names

**Solution**:
- Check property names are exact: `Name`, `Date`, `Description`, `Location`, `Tags`
- Property names are case-sensitive
- `Name` must be a Title property
- `Date` must be a Date property
- `Tags` must be a Multi-select property

---

## API Rate Limits

Notion API has the following limits:
- **3 requests per second** per integration
- The agent handles rate limits automatically
- No daily limit for personal use

---

## Privacy and Data Usage

The School Agent CLI:
- Only accesses databases you explicitly share with the integration
- Does not store calendar data permanently
- Does not share your data with third parties
- Uses your token only to make API requests on your behalf
- All operations are performed through Notion's secure API

---

## Advanced: Custom Properties

You can add custom properties to your calendar database:

### Priority
- Type: Select
- Options: High, Medium, Low
- Use: Prioritize events

### Status
- Type: Select
- Options: Planned, In Progress, Completed, Cancelled
- Use: Track event status

### Attendees
- Type: Multi-select or Text
- Use: Track who's attending

### Notes
- Type: Text (long)
- Use: Detailed notes about the event

The agent will work with any additional properties you add!

---

## Integration with Other Notion Pages

Since your calendar is in Notion, you can:

1. **Link to Other Pages**
   - Link events to class notes, assignments, or projects
   - Create relations between databases

2. **Embed in Other Pages**
   - Embed your calendar view in your dashboard
   - Create filtered views for different contexts

3. **Use Templates**
   - Create event templates for recurring meetings
   - Quick-add common event types

4. **Sync with Other Databases**
   - Link assignments to calendar events
   - Connect course schedules to your calendar

---

## Example Workflows

### Morning Routine
```
User: "What's on my calendar today?"
Agent: Lists all events for today

User: "Create a study session for CS101 at 2pm for 2 hours"
Agent: Creates event from 2pm-4pm
```

### Assignment Tracking
```
User: "Add CS101 project deadline to calendar: November 15 at 11:59pm"
Agent: Creates event on Nov 15

User: "Show me all my events next week"
Agent: Lists upcoming week's events
```

### Group Meeting
```
User: "Schedule a team meeting on Friday at 3pm in Library Room 201"
Agent: Creates event with location

User: "Add tags 'group-project' and 'CS101' to the meeting"
Agent: Updates event with tags
```

---

## Comparison with Other Calendar Tools

| Feature | Notion | Google Calendar | Outlook |
|---------|--------|-----------------|---------|
| **Setup Time** | 2 minutes | 20 minutes | Blocked |
| **Auth Method** | Simple token | OAuth2 | OAuth2 + Admin |
| **Token Expiry** | Never | 1 hour | 1 hour |
| **Config Values** | 2 | 5 | 5+ |
| **Admin Needed** | No | No | Yes (school) |
| **Custom Fields** | Yes | No | No |
| **Integration** | Full Notion | Calendar only | Email only |
| **Best For** | Students | General use | Enterprise |

**Winner for Students: Notion** ✅

---

## Additional Resources

- [Notion API Documentation](https://developers.notion.com/docs/getting-started)
- [Notion Database Guide](https://developers.notion.com/docs/working-with-databases)
- [Notion API Reference](https://developers.notion.com/reference/intro)
- [Create Integration](https://www.notion.so/profile/integrations)

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify your database is shared with the integration
3. Check property names match exactly
4. Review the agent logs for detailed error messages
5. Open an issue on the project repository

---

## Tips for Students

1. **Use Tags Effectively**
   - Create tags for each class (CS101, MATH201, etc.)
   - Add tags for event types (lecture, lab, exam, meeting)
   - Filter by tags in Notion for quick views

2. **Link to Assignments**
   - Create an Assignments database
   - Link calendar events to assignments
   - See deadlines and events together

3. **Create Views**
   - Calendar view for visual schedule
   - Table view for detailed planning
   - Timeline view for project planning

4. **Set Reminders**
   - Add reminder properties
   - Use Notion's built-in reminders
   - Get notifications before events

5. **Weekly Planning**
   - Create a weekly review template
   - Link to your calendar
   - Plan ahead efficiently

---

## Next Steps

1. ✅ Set up your Notion integration
2. ✅ Create your calendar database
3. ✅ Share it with your integration
4. ✅ Configure the agent
5. 🚀 Start managing your schedule!

**You're all set!** Your Notion calendar is now integrated with the School Agent CLI.
