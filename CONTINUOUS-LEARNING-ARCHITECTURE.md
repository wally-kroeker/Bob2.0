# Continuous Learning Architecture - PAI v2.3.0

**Purpose:** Technical architecture diagram for PAI v2.3's flagship continuous learning system
**For:** Understanding how Bob2.0 will learn and improve over time post-upgrade
**Related:** [UPGRADE-PLAN-v2.3.md](UPGRADE-PLAN-v2.3.md) Section 3 & 6.3

---

## System Overview

PAI v2.3's continuous learning system transforms Bob from a stateless assistant into a progressively smarter business partner. Every interaction teaches the system. Every rating, satisfaction signal, and completed task feeds back into improvement.

**Core Innovation:** Three-layer architecture (Capture → Sentiment → Learning) with automated feedback loop

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION                             │
│                    (Wally asks Bob to do X)                         │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    LAYER 1: RAW CAPTURE                             │
│                                                                      │
│  ┌──────────────┐  SessionStart Hook                                │
│  │ Session ID   │  → capture-all-events.ts                          │
│  │ Timestamp    │  → MEMORY/SESSIONS/{session-id}.json             │
│  │ User Prompt  │                                                   │
│  └──────────────┘                                                   │
│                                                                      │
│  ┌──────────────┐  PreToolUse Hook                                  │
│  │ Tool Name    │  → capture-all-events.ts                          │
│  │ Tool Input   │  → Append to session file                         │
│  │ Context      │                                                   │
│  └──────────────┘                                                   │
│                                                                      │
│  ┌──────────────┐  PostToolUse Hook                                 │
│  │ Tool Output  │  → capture-all-events.ts                          │
│  │ Exit Code    │  → Append to session file                         │
│  │ Duration     │                                                   │
│  └──────────────┘                                                   │
│                                                                      │
│  ┌──────────────┐  Stop Hook                                        │
│  │ Session End  │  → capture-all-events.ts                          │
│  │ Summary      │  → Finalize session file                          │
│  │ Status       │                                                   │
│  └──────────────┘                                                   │
│                                                                      │
│  STORAGE: MEMORY/SESSIONS/{session-id}.json (JSONL format)         │
│  FORMAT: {timestamp, event_type, tool_name, input, output, ...}    │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  LAYER 2: SENTIMENT OVERLAY                         │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐
│  │ EXPLICIT SIGNALS (User-Initiated)                               │
│  │                                                                  │
│  │  • User says "rate 9/10" or "⭐ RATE: 8"                       │
│  │  • User fills in response rating                                │
│  │  • User explicitly praises: "perfect", "exactly right"          │
│  │  • User explicitly criticizes: "wrong", "not what I wanted"     │
│  │                                                                  │
│  │  → Captured to MEMORY/SIGNALS/ratings.jsonl                     │
│  │     {session_id, rating, timestamp, explicit: true}             │
│  └─────────────────────────────────────────────────────────────────┘
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐
│  │ IMPLICIT SIGNALS (AI-Detected)                                  │
│  │                                                                  │
│  │  • Positive sentiment: "great", "thanks", "helpful"             │
│  │  • Negative sentiment: "failed", "error", "try again"           │
│  │  • Behavioral: Task completion without retry                    │
│  │  • Behavioral: Immediate follow-up questions (engaged)          │
│  │  • Behavioral: Long silence (frustrated? or satisfied?)         │
│  │                                                                  │
│  │  → Captured to MEMORY/SIGNALS/ratings.jsonl                     │
│  │     {session_id, sentiment, confidence, timestamp, explicit: false} │
│  └─────────────────────────────────────────────────────────────────┘
│                                                                      │
│  STORAGE: MEMORY/SIGNALS/ratings.jsonl                             │
│  PURPOSE: Overlay emotional signal on top of raw capture           │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 LAYER 3: LEARNING EXTRACTION                        │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐
│  │ PATTERN ANALYSIS (Manual → Automated)                           │
│  │                                                                  │
│  │  What worked?                                                    │
│  │  ├─ High-rated responses (8+/10)                                │
│  │  ├─ Tasks completed without retry                               │
│  │  ├─ Positive sentiment after interaction                        │
│  │  └─ User explicitly praises format/approach                     │
│  │                                                                  │
│  │  What didn't work?                                               │
│  │  ├─ Low-rated responses (<5/10)                                 │
│  │  ├─ Tasks requiring multiple retries                            │
│  │  ├─ Negative sentiment after interaction                        │
│  │  └─ User explicitly criticizes format/approach                  │
│  │                                                                  │
│  │  Cross-Session Patterns                                          │
│  │  ├─ Email summaries: Timeline context consistently rated 9+     │
│  │  ├─ ADHD tasks: Direct, imperative language works better        │
│  │  ├─ GoodFields: Client summaries need business impact focus     │
│  │  └─ Infrastructure: Detailed troubleshooting appreciated        │
│  └─────────────────────────────────────────────────────────────────┘
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐
│  │ INSIGHT DOCUMENTATION                                            │
│  │                                                                  │
│  │  Format: Markdown with problem/solution/evidence structure      │
│  │                                                                  │
│  │  Example Learning:                                               │
│  │  ┌─────────────────────────────────────────────────────────────┐│
│  │  │ # Email Management - Timeline Context Pattern              ││
│  │  │                                                             ││
│  │  │ **Problem:** Basic email summaries lack urgency context    ││
│  │  │ **Solution:** Always include timeline (today, tomorrow, etc)││
│  │  │ **Evidence:** 5 sessions rated 9+/10 when timeline included││
│  │  │ **Application:** Add to GoogleWorkspace skill workflow     ││
│  │  └─────────────────────────────────────────────────────────────┘│
│  │                                                                  │
│  │  → Stored in MEMORY/LEARNINGS/{topic}_{date}.md                │
│  └─────────────────────────────────────────────────────────────────┘
│                                                                      │
│  STORAGE: MEMORY/LEARNINGS/*.md                                    │
│  PURPOSE: Extract actionable patterns from raw capture + sentiment │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   LAYER 4: SYSTEM UPGRADES                          │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐
│  │ SKILL UPDATES (Workflow Refinement)                             │
│  │                                                                  │
│  │  Learning: "Email summaries with timeline context work well"    │
│  │  ↓                                                               │
│  │  Action: Update GoogleWorkspace/Workflows/Gmail.md              │
│  │  ↓                                                               │
│  │  Add Step: "Extract dates from emails and include in summary    │
│  │             with relative timing (today, tomorrow, next week)"  │
│  │  ↓                                                               │
│  │  Result: Future email summaries automatically include timeline  │
│  └─────────────────────────────────────────────────────────────────┘
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐
│  │ PROMPT UPDATES (Response Style)                                 │
│  │                                                                  │
│  │  Learning: "ADHD tasks work better with imperative language"    │
│  │  ↓                                                               │
│  │  Action: Update CORE/USER/DAIDENTITY.md or RESPONSEFORMAT.md    │
│  │  ↓                                                               │
│  │  Add Rule: "For ADHD-related tasks, use direct imperatives:     │
│  │             'Do X now' vs 'You could consider doing X'"         │
│  │  ↓                                                               │
│  │  Result: Executive function prompts more effective              │
│  └─────────────────────────────────────────────────────────────────┘
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐
│  │ BEHAVIOR UPDATES (Context Awareness)                            │
│  │                                                                  │
│  │  Learning: "Wally prefers business impact focus in consulting"  │
│  │  ↓                                                               │
│  │  Action: Update BobPacks/bob-telos-skill context                │
│  │  ↓                                                               │
│  │  Add Context: "When discussing GoodFields work, always frame    │
│  │                value in terms of client business outcomes"      │
│  │  ↓                                                               │
│  │  Result: Consulting discussions automatically business-focused  │
│  └─────────────────────────────────────────────────────────────────┘
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐
│  │ DOCUMENTATION                                                    │
│  │                                                                  │
│  │  Every system upgrade documented in:                             │
│  │  MEMORY/PAISYSTEMUPDATES/{date}_{change-description}.md        │
│  │                                                                  │
│  │  Format:                                                         │
│  │  - Date and context                                              │
│  │  - Learning that triggered upgrade                              │
│  │  - Changes made (file, line, before/after)                      │
│  │  - Expected impact                                               │
│  │  - Verification criteria                                         │
│  └─────────────────────────────────────────────────────────────────┘
│                                                                      │
│  STORAGE: MEMORY/PAISYSTEMUPDATES/*.md                             │
│  PURPOSE: Track system evolution, enable rollback if needed        │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      IMPROVED BEHAVIOR                              │
│                   (Next User Interaction)                           │
│                                                                      │
│  Bob now:                                                            │
│  • Uses proven patterns automatically                               │
│  • Avoids approaches that failed before                             │
│  • Adapts to Wally's preferences                                    │
│  • Gets measurably better over time                                 │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ CONTINUOUS LOOP: Each interaction → More data → Better AI  │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. capture-all-events.ts Hook

**Location:** `~/.claude/hooks/capture-all-events.ts`

**Triggers:** All lifecycle events
- SessionStart
- PreToolUse (wildcard matcher)
- PostToolUse
- UserPromptSubmit
- Stop
- SubagentStop
- SessionEnd

**Functionality:**
```typescript
// Reads event data from stdin (hook protocol)
const eventData = JSON.parse(stdin);

// Append to session JSONL file
const sessionFile = `${PAI_DIR}/MEMORY/SESSIONS/${session_id}.json`;
fs.appendFileSync(sessionFile, JSON.stringify({
  timestamp: Date.now(),
  event_type: eventType,
  tool_name: eventData.tool_name || null,
  tool_input: eventData.tool_input || null,
  tool_output: eventData.tool_output || null,
  user_prompt: eventData.user_prompt || null,
  // ... more fields
}) + '\n');

// Exit 0 (never block execution)
process.exit(0);
```

**Output Format (JSONL):**
```json
{"timestamp":1705420800000,"event_type":"SessionStart","session_id":"abc123"}
{"timestamp":1705420810000,"event_type":"PreToolUse","tool_name":"Bash","tool_input":{"command":"ls"}}
{"timestamp":1705420811000,"event_type":"PostToolUse","tool_name":"Bash","tool_output":"file1.txt\nfile2.txt"}
{"timestamp":1705420900000,"event_type":"Stop","session_id":"abc123","duration":100}
```

---

### 2. MEMORY Directory Structure

```
~/.claude/MEMORY/
├── SESSIONS/              # RAW CAPTURE LAYER
│   ├── 2026-01-16_abc123.json      # Full session transcript (JSONL)
│   ├── 2026-01-16_def456.json
│   └── ...
│
├── SIGNALS/               # SENTIMENT OVERLAY LAYER
│   └── ratings.jsonl      # Explicit + implicit sentiment
│       Example:
│       {"session_id":"abc123","rating":9,"timestamp":1705420900,"explicit":true,"comment":"perfect format"}
│       {"session_id":"def456","sentiment":"positive","confidence":0.8,"explicit":false,"indicator":"user said 'great'"}
│
├── LEARNINGS/             # LEARNING EXTRACTION LAYER
│   ├── email-management_timeline-context_2026-01-20.md
│   ├── adhd-support_imperative-language_2026-01-22.md
│   └── goodfields-consulting_business-focus_2026-01-25.md
│       Format:
│       # {Topic} - {Pattern Name}
│       **Problem:** ...
│       **Solution:** ...
│       **Evidence:** X sessions, Y avg rating, Z% success rate
│       **Application:** Update {skill/prompt/workflow}
│
├── PAISYSTEMUPDATES/      # SYSTEM UPGRADE LAYER
│   ├── 2026-01-21_gmail-workflow-timeline-context.md
│   ├── 2026-01-23_daidentity-adhd-language.md
│   └── 2026-01-26_telos-skill-business-focus.md
│       Format:
│       # System Upgrade: {Change Description}
│       **Date:** ...
│       **Triggered By:** Learning from LEARNINGS/{file}
│       **Changes Made:**
│         - File: {path}
│         - Line: {number}
│         - Before: {old code/text}
│         - After: {new code/text}
│       **Expected Impact:** ...
│       **Verification:** ...
│
├── RESEARCH/              # Research artifacts (pai-research-skill)
├── DECISIONS/             # Decision logs
├── EXECUTION/             # Task execution logs
├── SECURITY/              # Security events
├── RECOVERY/              # Recovery procedures
├── raw-outputs/           # Unprocessed outputs
├── backups/               # Backup snapshots
└── State/                 # System state files
```

---

## Data Flow Example: Email Management Learning

### Week 1: Initial Capture

**Session 1: 2026-01-16**
```json
// MEMORY/SESSIONS/2026-01-16_morning.json
{"event":"UserPromptSubmit","prompt":"Check my email and summarize"}
{"event":"PreToolUse","tool":"gmail_search","input":{"query":"is:unread"}}
{"event":"PostToolUse","tool":"gmail_search","output":"3 messages"}
{"event":"PreToolUse","tool":"gmail_get","input":{"messageId":"xyz"}}
{"event":"PostToolUse","tool":"gmail_get","output":"Interview confirmation..."}
// ... more events
{"event":"Stop","summary":"Email summary provided"}

// Bob's Response (no timeline context):
// "Found 3 unread messages: interview confirmation, AWS invoice, Folk Fest schedule"

// MEMORY/SIGNALS/ratings.jsonl
{"session_id":"2026-01-16_morning","rating":7,"comment":"good but could be better"}
```

**Rating:** 7/10 - User wants more context

---

### Week 1: Enhanced Response

**Session 2: 2026-01-17**
```json
// Bob adds timeline context proactively
// Response includes: "Interview TOMORROW at 2pm, AWS bill due TODAY, Folk Fest Saturday"

// MEMORY/SIGNALS/ratings.jsonl
{"session_id":"2026-01-17_morning","rating":9,"comment":"perfect - timeline is exactly what I needed"}
```

**Rating:** 9/10 - Timeline context appreciated

---

### Week 2: Pattern Recognition

**Session 3-5: 2026-01-18 to 2026-01-20**
```json
// Three more email checks, all include timeline context
// Ratings: 9, 10, 9
```

**Analysis (Manual or Automated):**
- 5 sessions with email summaries
- Timeline context present in 4/5 (Sessions 2-5)
- Average rating WITH timeline: 9.25/10
- Average rating WITHOUT timeline: 7/10
- Difference: +2.25 points
- **Conclusion:** Timeline context significantly improves email summaries

---

### Week 2: Learning Extraction

**File Created:** `MEMORY/LEARNINGS/email-management_timeline-context_2026-01-20.md`

```markdown
# Email Management - Timeline Context Pattern

**Problem:**
Basic email summaries list messages but lack urgency context. User can't
prioritize without checking each email individually.

**Solution:**
Always include relative timeline for each email:
- "TODAY" for items due today
- "TOMORROW" for next-day deadlines
- "THIS WEEK" for items due within 7 days
- Specific dates for further out

**Evidence:**
- 5 sessions analyzed (2026-01-16 to 2026-01-20)
- Timeline context present in 4/5 sessions
- Average rating WITH timeline: 9.25/10
- Average rating WITHOUT timeline: 7.0/10
- Statistical significance: +2.25 points (32% improvement)

**Application:**
Update GoogleWorkspace skill Gmail workflow to always extract dates and
convert to relative timeline format.

**Files to Update:**
- `~/.claude/skills/GoogleWorkspace/Workflows/Gmail.md`
- Add step: "Extract deadlines and convert to relative timeline"

**Verification:**
- Next 5 email summary sessions should all include timeline
- Average rating should maintain 9+ with timeline
```

---

### Week 3: System Upgrade

**File Created:** `MEMORY/PAISYSTEMUPDATES/2026-01-21_gmail-workflow-timeline-context.md`

```markdown
# System Upgrade: Gmail Workflow Timeline Context

**Date:** 2026-01-21
**Triggered By:** Learning from LEARNINGS/email-management_timeline-context_2026-01-20.md

## Changes Made

### File: ~/.claude/skills/GoogleWorkspace/Workflows/Gmail.md

**Section:** Daily Email Check Workflow

**Before:**
```
3. Summarize Results
   - List message subjects
   - Identify action items
   - Format as bullet list
```

**After:**
```
3. Summarize Results
   - List message subjects
   - Extract deadlines/dates from each message
   - Convert to relative timeline (TODAY, TOMORROW, THIS WEEK, specific date)
   - Identify action items with timeline context
   - Format as bullet list with timeline first
   - Example: "AWS invoice due TODAY ($127)" not "AWS invoice"
```

## Expected Impact

- Email summaries automatically include timeline context
- User can prioritize without opening each email
- Ratings expected to stay at 9+ average
- Reduces follow-up questions about urgency

## Verification Criteria

- [ ] Next 5 email check sessions all include timeline
- [ ] Average rating maintains 9+ across sessions
- [ ] Zero follow-up questions about "when is this due?"
- [ ] User explicitly praises timeline format

## Rollback Procedure

If timeline format causes confusion or reduces ratings:
1. Revert Gmail.md to previous version
2. Document why timeline didn't work in this case
3. Refine approach based on feedback
```

---

### Week 4+: Continuous Improvement

**Result:**
- Email summaries now ALWAYS include timeline context
- Pattern is baked into the workflow
- Bob remembers this lesson forever
- Future email tasks automatically better
- User experiences consistent quality

**Compounding Effect:**
- Week 4: Learn another email pattern (priority human detection)
- Week 5: Combine timeline + priority patterns
- Week 6: Add calendar cross-reference for meetings
- Month 2: Email management is 40% better than Month 0

---

## Integration with Bob's Mission

### ADHD Support Learning

**Pattern to Discover:**
- Direct imperatives work better than suggestions
- "Do X now" > "You might want to consider X"
- Shorter sentences for task initiation
- Single task focus vs multi-option overload

**Learning Loop:**
1. **Capture:** 10 sessions of ADHD task initiation
2. **Sentiment:** Track which approaches get tasks done faster
3. **Extract:** "Imperative language reduces activation energy"
4. **Upgrade:** Update response format for ADHD-tagged tasks
5. **Result:** Executive function support measurably more effective

---

### GoodFields Consulting Learning

**Pattern to Discover:**
- Client summaries need business impact framing
- Technical details should support business value
- ROI framing increases proposal success rate
- Specific metrics > vague benefits

**Learning Loop:**
1. **Capture:** 15 client interaction sessions
2. **Sentiment:** Track which framing gets positive client response
3. **Extract:** "Business impact first, technical details second"
4. **Upgrade:** Update Telos skill client summary template
5. **Result:** Proposals consistently well-received

---

### FabLab Infrastructure Learning

**Pattern to Discover:**
- Detailed troubleshooting steps appreciated
- System state documentation prevents repeat issues
- Proactive monitoring suggestions valued
- Root cause analysis more valuable than quick fixes

**Learning Loop:**
1. **Capture:** 20 infrastructure troubleshooting sessions
2. **Sentiment:** Track which approaches prevent repeat calls
3. **Extract:** "Document system state + root cause + monitoring"
4. **Upgrade:** Add infrastructure documentation template
5. **Result:** Repeat issues decrease, knowledge compounds

---

## Metrics Dashboard (Future)

**Integration with pai-observability-server:**

```
┌─────────────────────────────────────────────────────────────┐
│ CONTINUOUS LEARNING METRICS                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Sessions Captured:        137 (last 30 days)               │
│ Events Captured:          2,847 (avg 20.8/session)         │
│ Sentiment Signals:        43 explicit, 89 implicit         │
│ Learning Extractions:     8 patterns documented            │
│ System Upgrades:          5 workflows improved             │
│                                                             │
│ Quality Trend:            ▲ +18% (vs baseline)             │
│ Avg Session Rating:       8.7/10 (up from 7.6 in Week 1)  │
│                                                             │
│ Top Learning Areas:                                         │
│   1. Email Management      (5 patterns, 9.2 avg rating)    │
│   2. ADHD Support          (3 patterns, 8.8 avg rating)    │
│   3. GoodFields Consulting (2 patterns, 9.0 avg rating)    │
│                                                             │
│ Recent System Upgrades:                                     │
│   • 2026-01-21: Gmail timeline context                     │
│   • 2026-01-23: ADHD imperative language                   │
│   • 2026-01-26: Telos business focus                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Status

### Current State (Pre-Upgrade)
- ❌ capture-all-events.ts not installed
- ❌ MEMORY/SIGNALS/ directory missing
- ❌ MEMORY/PAISYSTEMUPDATES/ directory missing
- ❌ No unified event capture
- ❌ No sentiment analysis
- ❌ No automated learning extraction
- ❌ Manual improvement process

### Post-Upgrade State (v2.3)
- ✅ capture-all-events.ts registered in 7 lifecycle events
- ✅ MEMORY/SIGNALS/ratings.jsonl created
- ✅ MEMORY/PAISYSTEMUPDATES/ created
- ✅ Unified event capture operational
- ✅ Sentiment capture framework ready
- 🟨 Learning extraction semi-automated (manual initially)
- 🟨 System upgrades semi-automated (manual initially)

### Future State (v2.4+)
- ✅ Fully automated learning extraction
- ✅ AI-driven sentiment analysis
- ✅ Automated system upgrade suggestions
- ✅ Dashboard visualization of learning metrics
- ✅ Cross-session pattern detection
- ✅ Predictive quality improvements

---

## Success Indicators

### Week 1
- ✅ 10+ sessions captured with full event logs
- ✅ At least 1 explicit sentiment signal
- ✅ Zero capture errors

### Week 4
- ✅ 40+ sessions captured
- ✅ 5+ sentiment signals/week
- ✅ First learning extraction documented
- ✅ First system upgrade implemented

### Month 3
- ✅ 120+ sessions captured
- ✅ 8+ learning patterns extracted
- ✅ 5+ system upgrades implemented
- ✅ Measurable quality improvement (2+ points on 10-point scale)
- ✅ User reports "Bob is noticeably better than 3 months ago"

### Quarter 1
- ✅ Continuous learning loop fully operational
- ✅ System auto-improves based on feedback
- ✅ Bob's assistance quality 30%+ better than baseline
- ✅ Zero manual intervention required for basic learning
- ✅ Compounding intelligence validated

---

## Technical Notes

### Event Capture Performance

**Overhead per event:** ~2-5ms (negligible)

**Storage growth:** ~100KB/session average
- 30 sessions/month = 3MB/month
- 365 days = ~36MB/year (manageable)

**Archival strategy (future):**
- Sessions older than 90 days: Compress to .gz
- Sessions older than 1 year: Archive to cold storage
- Keep signals/learnings/upgrades indefinitely (small size)

### Hook Failure Handling

All hooks follow fail-safe design:
```typescript
async function main() {
  try {
    // Capture logic
  } catch (error) {
    console.error('Capture failed:', error);
    // Log to ~/.claude/logs/capture-errors.log
    // But never crash Claude Code
  }
  process.exit(0); // Always exit 0
}
```

### JSONL Format Rationale

**Why JSONL (not JSON array)?**
- Append-only: No need to parse entire file to add event
- Resilient: Corrupted line doesn't break entire session
- Streamable: Can process while session is active
- Tool-friendly: `jq` can process line-by-line

---

## Related Documentation

- **Full Upgrade Plan:** [UPGRADE-PLAN-v2.3.md](UPGRADE-PLAN-v2.3.md)
- **Executive Summary:** [UPGRADE-SUMMARY-v2.3.md](UPGRADE-SUMMARY-v2.3.md)
- **Comparison Table:** [UPGRADE-COMPARISON-v2.3.md](UPGRADE-COMPARISON-v2.3.md)
- **PAI v2.3 Release Notes:** Upstream repository (Releases/v2.3/)

---

*Technical architecture diagram by Bill (The Architect) - 2026-01-16*
*Continuous learning is PAI v2.3's flagship feature - this is how Bob gets smarter over time*
