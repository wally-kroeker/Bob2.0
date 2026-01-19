# Calendar Operations

This workflow handles all Google Calendar operations through the Google Workspace MCP server.

## List Events

### User Request Examples
- "What's on my calendar today?"
- "Show me this week's meetings"
- "What meetings do I have tomorrow?"
- "List my calendar events for Friday"

### Process
1. Parse time range from user's request (today, tomorrow, this week, etc.)
2. Call MCP tool: `calendar_list_events` with time parameters
3. Format output as readable schedule (time, title, attendees, location)
4. Offer to show details or modify specific events

### MCP Tool: calendar_list_events

**Input Schema:**
```json
{
  "name": "calendar_list_events",
  "input": {
    "calendarId": "primary",
    "timeMin": "2026-01-13T00:00:00Z",
    "timeMax": "2026-01-13T23:59:59Z",
    "maxResults": 50,
    "orderBy": "startTime",
    "singleEvents": true
  }
}
```

**Parameters:**
- `calendarId` (optional): Calendar ID (default: "primary" for user's main calendar)
- `timeMin` (required): Start of time range (ISO 8601 format)
- `timeMax` (required): End of time range (ISO 8601 format)
- `maxResults` (optional): Maximum number of events to return (default: 50)
- `orderBy` (optional): Sort order ("startTime" or "updated")
- `singleEvents` (optional): Expand recurring events (default: true)

**Expected Output:**
```json
{
  "events": [
    {
      "id": "event123abc",
      "summary": "Team Standup",
      "description": "Daily team sync",
      "start": {
        "dateTime": "2026-01-13T09:00:00-08:00",
        "timeZone": "America/Los_Angeles"
      },
      "end": {
        "dateTime": "2026-01-13T09:30:00-08:00",
        "timeZone": "America/Los_Angeles"
      },
      "attendees": [
        {
          "email": "bob@example.com",
          "responseStatus": "accepted"
        },
        {
          "email": "alice@example.com",
          "responseStatus": "needsAction"
        }
      ],
      "location": "Conference Room A",
      "hangoutLink": "https://meet.google.com/abc-defg-hij"
    }
  ]
}
```

### Error Handling
- **No events:** Inform user calendar is clear for requested time range
- **Invalid time range:** Ask user to clarify dates
- **Auth expired:** Trigger re-auth
- **Calendar not found:** Verify calendar ID (default to "primary")

### Best Practices
- Default to user's primary calendar unless specified
- Format times in user's timezone
- Show attendee count for meetings
- Highlight video conference links (Meet, Zoom)
- Group by day for multi-day ranges

---

## Create Event

### User Request Examples
- "Schedule a meeting with bob@example.com tomorrow at 2pm"
- "Create a calendar event called 'Team Standup' every Monday at 9am"
- "Block off Friday afternoon for deep work"
- "Book a 30-minute meeting with Alice on Thursday"

### Process
1. Extract event details: title, date/time, duration, attendees, location
2. Confirm details with user (especially attendees and time)
3. Parse recurring event patterns if mentioned
4. Call MCP tool: `calendar_create_event`
5. Confirm created and provide event ID and link

### MCP Tool: calendar_create_event

**Input Schema:**
```json
{
  "name": "calendar_create_event",
  "input": {
    "calendarId": "primary",
    "summary": "Team Standup",
    "description": "Daily team synchronization meeting",
    "start": {
      "dateTime": "2026-01-14T09:00:00-08:00",
      "timeZone": "America/Los_Angeles"
    },
    "end": {
      "dateTime": "2026-01-14T09:30:00-08:00",
      "timeZone": "America/Los_Angeles"
    },
    "attendees": [
      {"email": "bob@example.com"},
      {"email": "alice@example.com"}
    ],
    "location": "Conference Room A",
    "conferenceData": {
      "createRequest": {
        "requestId": "unique-request-id",
        "conferenceSolutionKey": {"type": "hangoutsMeet"}
      }
    }
  }
}
```

**Parameters:**
- `calendarId` (optional): Calendar to create event in (default: "primary")
- `summary` (required): Event title/name
- `description` (optional): Event description/notes
- `start` (required): Event start time (dateTime + timeZone)
- `end` (required): Event end time (dateTime + timeZone)
- `attendees` (optional): Array of attendee email objects
- `location` (optional): Physical location
- `conferenceData` (optional): Video conference settings (Google Meet)
- `recurrence` (optional): Array of RRULE strings for recurring events

**Expected Output:**
```json
{
  "id": "event123abc",
  "htmlLink": "https://calendar.google.com/event?eid=...",
  "summary": "Team Standup",
  "start": {
    "dateTime": "2026-01-14T09:00:00-08:00"
  },
  "end": {
    "dateTime": "2026-01-14T09:30:00-08:00"
  },
  "created": true,
  "hangoutLink": "https://meet.google.com/abc-defg-hij"
}
```

### Recurring Events

**Daily recurring event:**
```json
{
  "recurrence": ["RRULE:FREQ=DAILY;COUNT=30"]
}
```

**Weekly recurring event (every Monday):**
```json
{
  "recurrence": ["RRULE:FREQ=WEEKLY;BYDAY=MO"]
}
```

**Monthly recurring event (first Friday of each month):**
```json
{
  "recurrence": ["RRULE:FREQ=MONTHLY;BYDAY=1FR"]
}
```

### Error Handling
- **Time conflict:** Warn user if event overlaps existing events
- **Invalid time format:** Ask user to clarify time
- **Invalid attendee email:** Validate email addresses
- **Missing required fields:** Prompt user for title and time

### Best Practices
- Default to 30-minute meetings unless duration specified
- Always confirm attendees before sending invites
- Include video conference link for remote meetings
- Set timezone explicitly (use user's timezone)
- Provide calendar link so user can view/edit event

---

## Update Event

### User Request Examples
- "Move my 2pm meeting to 3pm"
- "Add bob@example.com to the team standup"
- "Change the location of tomorrow's meeting to Conference Room B"
- "Update the project review meeting to be 1 hour instead of 30 minutes"

### Process
1. Identify which event to update (search if needed)
2. Determine what to change (time, attendees, location, title, etc.)
3. Confirm changes with user
4. Call MCP tool: `calendar_update_event`
5. Confirm updated

### MCP Tool: calendar_update_event

**Input Schema:**
```json
{
  "name": "calendar_update_event",
  "input": {
    "calendarId": "primary",
    "eventId": "event123abc",
    "summary": "Team Standup (Updated)",
    "start": {
      "dateTime": "2026-01-14T09:30:00-08:00",
      "timeZone": "America/Los_Angeles"
    },
    "end": {
      "dateTime": "2026-01-14T10:00:00-08:00",
      "timeZone": "America/Los_Angeles"
    },
    "attendees": [
      {"email": "bob@example.com"},
      {"email": "alice@example.com"},
      {"email": "charlie@example.com"}
    ]
  }
}
```

**Parameters:**
- `calendarId` (optional): Calendar ID (default: "primary")
- `eventId` (required): ID of event to update (from list_events)
- All event fields are optional (only include fields to change)
- Fields not included remain unchanged

**Expected Output:**
```json
{
  "id": "event123abc",
  "updated": true,
  "summary": "Team Standup (Updated)",
  "start": {
    "dateTime": "2026-01-14T09:30:00-08:00"
  }
}
```

### Error Handling
- **Event not found:** Verify event ID or search for event again
- **Permission denied:** User may not have edit rights (not organizer)
- **Time conflict:** Warn about overlaps with other events
- **Attendee update failed:** Some attendees may not receive updates

### Best Practices
- Search for event first if user doesn't provide event ID
- Show current event details before updating
- Confirm changes, especially time changes that affect attendees
- Notify user that attendees will receive update notifications
- Handle recurring events carefully (update single instance vs all instances)

---

## Delete Event

### User Request Examples
- "Cancel tomorrow's 1:1 with Alice"
- "Delete the project review meeting"
- "Remove my 3pm appointment"

### Process
1. Identify which event to delete (search if needed)
2. Show event details to confirm
3. Ask user to confirm deletion (especially if attendees are invited)
4. Call MCP tool: `calendar_delete_event`
5. Confirm deleted

### MCP Tool: calendar_delete_event

**Input Schema:**
```json
{
  "name": "calendar_delete_event",
  "input": {
    "calendarId": "primary",
    "eventId": "event123abc",
    "sendUpdates": "all"
  }
}
```

**Parameters:**
- `calendarId` (optional): Calendar ID (default: "primary")
- `eventId` (required): ID of event to delete (from list_events)
- `sendUpdates` (optional): Notify attendees ("all", "externalOnly", "none")

**Expected Output:**
```json
{
  "deleted": true,
  "eventId": "event123abc"
}
```

### Error Handling
- **Event not found:** Verify event ID or search again
- **Permission denied:** User may not have delete rights
- **Recurring event:** Clarify if deleting single instance or all occurrences

### Best Practices
- Always confirm before deleting events
- Warn if event has attendees (cancellation notifications will be sent)
- Default to sending cancellation notices to attendees
- Provide option to delete vs decline (user not organizer)
- Log deleted events for user's reference

---

## Advanced Operations

### All-Day Events

For all-day events, use `date` instead of `dateTime`:
```json
{
  "start": {
    "date": "2026-01-15"
  },
  "end": {
    "date": "2026-01-16"
  }
}
```

### Multiple Calendars

List all calendars:
```json
{
  "name": "calendar_list_calendars"
}
```

Create event in specific calendar:
```json
{
  "calendarId": "work@example.com"
}
```

### Free/Busy Check

Check availability before scheduling:
```json
{
  "name": "calendar_freebusy",
  "input": {
    "timeMin": "2026-01-14T00:00:00Z",
    "timeMax": "2026-01-14T23:59:59Z",
    "items": [
      {"id": "primary"},
      {"id": "bob@example.com"}
    ]
  }
}
```

### Event Colors

Set event color (if supported by MCP server):
```json
{
  "colorId": "1"
}
```

Color IDs: 1 (lavender), 2 (sage), 3 (grape), 4 (flamingo), etc.

---

## Integration Notes

### With PAI History
Every calendar operation is logged:
```bash
# See all created events
grep "calendar_create_event" $PAI_DIR/history/raw-outputs/*/*.jsonl

# See all deleted events
grep "calendar_delete_event" $PAI_DIR/history/raw-outputs/*/*.jsonl
```

### With Other Skills
- **Telos skill:** Schedule weekly review sessions
- **Cognitive Loop:** Block writing time
- **Financial system:** Schedule invoice follow-ups

### Context Awareness
The AI remembers:
- Events it created (can reference "the meeting I scheduled with Bob")
- Time preferences (usual meeting duration, typical schedule)
- Recurring patterns (weekly 1:1s, daily standups)

---

## Common Workflows

### Daily Schedule Check
```
User: What's on my calendar today?
→ calendar_list_events for today
→ Show chronological schedule
→ Highlight next upcoming meeting
```

### Quick Meeting Scheduling
```
User: Schedule 30-minute meeting with Bob tomorrow at 2pm
→ Confirm Bob's email address
→ calendar_create_event with details
→ Provide Meet link
→ Confirm invitations sent
```

### Reschedule Meeting
```
User: Move my 2pm meeting to 3pm
→ Search for 2pm meeting today
→ Show event details
→ Confirm new time
→ calendar_update_event with new time
→ Confirm attendees notified
```

### Weekly Planning
```
User: Show me next week's meetings
→ calendar_list_events for next 7 days
→ Group by day
→ Calculate total meeting hours
→ Identify gaps for deep work
```

---

## Troubleshooting

### "Cannot create event - permission denied"
**Cause:** Missing `calendar` scope or trying to create in calendar without write access
**Solution:** Add scope to settings.json, or verify calendar permissions

### "Event not found"
**Cause:** Event deleted, invalid ID, or wrong calendar
**Solution:** List events again or verify calendar ID

### "Time zone mismatch"
**Cause:** Times displayed in wrong timezone
**Solution:** Explicitly set timeZone in start/end objects

### "Recurring event update failed"
**Cause:** Ambiguous update (single instance vs all occurrences)
**Solution:** Specify instance or use recurring event ID

### "Attendee notifications not sent"
**Cause:** sendUpdates parameter set to "none"
**Solution:** Set sendUpdates to "all" when creating/updating events

---

## Reference: Calendar API Scopes

Required scope in settings.json:

- `https://www.googleapis.com/auth/calendar` - Full calendar access (read/write)

Optional scopes:
- `https://www.googleapis.com/auth/calendar.readonly` - Read-only access
- `https://www.googleapis.com/auth/calendar.events` - Events only (no settings)

**Current default:** `calendar` (full access)

To change scopes:
1. Update `GOOGLE_SCOPES` in `~/.claude/settings.json`
2. Delete `~/.config/google-workspace-mcp/credentials.json`
3. Restart Claude Code
4. Re-authorize with new scopes

---

## Time Format Reference

**ISO 8601 format (required for dateTime):**
```
2026-01-13T14:30:00-08:00
```

Components:
- `2026-01-13` - Date (YYYY-MM-DD)
- `T` - Separator
- `14:30:00` - Time (HH:MM:SS)
- `-08:00` - Timezone offset

**Common timezone offsets:**
- PST/PDT: `-08:00` / `-07:00`
- EST/EDT: `-05:00` / `-04:00`
- UTC: `Z` or `+00:00`

**All-day events (date only):**
```
2026-01-15
```

**Best practice:** Always include timezone to avoid ambiguity.

---

## Recurring Event Rules (RRULE)

**Daily (30 times):**
```
RRULE:FREQ=DAILY;COUNT=30
```

**Weekly on Monday and Wednesday:**
```
RRULE:FREQ=WEEKLY;BYDAY=MO,WE
```

**Monthly on the 15th:**
```
RRULE:FREQ=MONTHLY;BYMONTHDAY=15
```

**Every weekday (Mon-Fri):**
```
RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR
```

**Until specific date:**
```
RRULE:FREQ=WEEKLY;UNTIL=20261231T235959Z
```

See RFC 5545 for complete RRULE specification.
