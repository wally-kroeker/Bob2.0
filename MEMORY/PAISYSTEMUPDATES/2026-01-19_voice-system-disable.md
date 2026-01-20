# Voice System Disable Configuration

**Date**: 2026-01-19
**Type**: Configuration Enhancement
**Status**: Implemented

## Summary

Added ability to disable the voice notification system via settings.json configuration. Previously, even with the voice server stopped, hooks would still attempt to connect and log failed events.

## Problem

- Voice server systemd service stopped, but hooks continued attempting connections
- Failed voice events logged to `MEMORY/VOICE/voice-events.jsonl` (72+ entries)
- No configuration option to disable voice at the application level

## Solution

### 1. Settings Configuration

Added `voice.enabled` setting to `~/.claude/settings.json`:

```json
{
  "voice": {
    "enabled": false
  }
}
```

### 2. Handler Update

Modified `~/.claude/hooks/handlers/voice.ts` to check the setting:

```typescript
function isVoiceEnabled(): boolean {
  const settings = getSettings();
  if (settings.voice && typeof settings.voice === 'object' && 'enabled' in settings.voice) {
    return Boolean(settings.voice.enabled);
  }
  return true; // Default to enabled for backwards compatibility
}

export async function handleVoice(parsed: ParsedTranscript, sessionId: string): Promise<void> {
  if (!isVoiceEnabled()) {
    console.error('[Voice] Disabled in settings.json - skipping');
    return;
  }
  // ... rest of handler
}
```

### 3. Service Management

Systemd user service disabled:
```bash
systemctl --user stop pai-voice-server.service
systemctl --user disable pai-voice-server.service
```

## Files Modified

| File | Change |
|------|--------|
| `~/.claude/settings.json` | Added `voice.enabled: false` |
| `~/.claude/hooks/handlers/voice.ts` | Added `isVoiceEnabled()` check |

## Verification

With `voice.enabled: false`:
- No connection attempts to localhost:8888
- No new entries in `MEMORY/VOICE/voice-events.jsonl`
- StopOrchestrator completes without voice handler errors

## Re-enabling Voice

To re-enable voice notifications:

1. Start the voice server:
   ```bash
   systemctl --user enable pai-voice-server.service
   systemctl --user start pai-voice-server.service
   ```

2. Update settings.json:
   ```json
   {
     "voice": {
       "enabled": true
     }
   }
   ```

## Related Documentation

- `SYSTEM/THENOTIFICATIONSYSTEM.md` - Notification system overview
- `SYSTEM/THEHOOKSYSTEM.md` - Hook system architecture
