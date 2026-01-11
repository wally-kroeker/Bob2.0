---
name: cognitive-loop
description: Daily writing practice + Substack publishing. Morning notes → Cognitive Loop posts (same-day). Tracks published posts, themes, streaks, and backlog. Preserves authentic voice through quote extraction. USE WHEN user mentions 'cognitive loop', 'morning writing', 'substack post', 'spiritual journey', or 'publish'. (project, gitignored)
---

# Cognitive Loop - Daily Writing + Publishing Practice

## When to Activate This Skill
- User says "cognitive loop", "morning writing", or "substack"
- User wants to "publish a post" or "draft cognitive loop"
- User asks to "extract quotes" or "draft from notes"
- User mentions "spiritual journey" or story projects
- Beginning of day writing session
- Checking writing streak or reviewing published posts

## Post Completion Checklist

**Bob maintains this checklist throughout the workflow and prompts for next steps:**

```
□ Draft finalized (content ready for publishing)
□ Image generated (via generate-image.py script)
□ Published to Substack (user confirms "published")
□ Memory updated (Bob analyzes and updates all tracking files)
```

**How Bob uses the checklist:**
- Track state across conversation (what's done, what's next)
- Prompt for next step when one completes
- When user says "published" or "posted" → trigger Memory Update Protocol
- Show checklist status when user asks "where are we?"

## Core Purpose

**Personal**: Daily grounding practice through storytelling, building personal compass, spiritual exploration

**Professional (GoodFields)**: Grounded Wally = better leadership, clearer decisions, stronger authentic voice

**Publishing**: Transform raw morning notes into published Cognitive Loop Substack posts (near-daily cadence)

---

## Handoff Recognition & Triage

**Bob should detect when receiving external AI context** (long messages, ChatGPT formatting, phrases like "here's what we worked on"):

### When External Context is Detected

**Bob asks: "What do you need from this handoff?"**

Options to offer:
- Extract quotes from raw text
- Refine existing draft for voice consistency
- Review and suggest improvements
- Start fresh draft from scratch
- Other (you specify)

### Common Handoff Formats to Handle

**Pasted ChatGPT conversations:**
- Full back-and-forth dialogue with ChatGPT
- Bob identifies raw voice text vs. ChatGPT responses
- Focuses extraction on Wally's authentic voice

**Structured handoff:**
- Raw text + draft + notes provided separately
- Bob asks which part to focus on

**Draft needing voice refinement:**
- Already drafted content that needs voice alignment
- Bob reviews against voice preservation rules

**Voice recording transcript:**
- Transcribed audio with possible transcription artifacts
- Bob extracts clean quotes and themes

### Triage Principle

**Don't assume** - always ask what's needed rather than guessing the workflow step.

---

## Daily Workflow (Morning Note → Published Post Same Day)

### 1. Voice Capture (15-30 min)
- **Morning sun thinking time** - stream of consciousness
- Voice memo on phone OR voice-to-text directly
- Pick a writing prompt (or free-write)
- No editing, no filtering - raw authentic voice
- **Tools**: Built-in voice memo, Whisper, or ChatGPT mobile

### 2. Transcription + Save
- If voice memo: transcribe with Whisper/ChatGPT
- Save to: `~/.claude/scratchpad/Cognitive Loop/YYYY-MM-DD-raw.md`
- Keep raw unfiltered text

### 2.5. Context Review (Bob's Role)

**Before quote extraction or drafting:**

1. **Read published posts archive**
   ```
   read ~/.claude/skills/cognitive-loop/data/published-posts.md
   ```

2. **Review last 5-10 posts for:**
   - **Voice patterns**: Authentic phrasing from Key Quotes sections
   - **Recurring themes**: What themes are you exploring repeatedly?
   - **Topic connections**: Does today's raw note connect to previous posts?
   - **Tone evolution**: How has your reflective voice developed?

3. **Note (mentally, don't document):**
   - Phrases that sound distinctly like Wally
   - Themes to reference or build upon
   - Topics to avoid repeating too soon
   - Natural connections to weave into draft

4. **Use context to:**
   - Extract quotes that match established voice patterns
   - Reference previous posts naturally ("This connects to my exploration of...")
   - Avoid unintentional repetition
   - Maintain voice consistency across the series

**Don't:**
- Copy published-posts.md into every draft
- Force connections that aren't natural
- Let previous posts override today's authentic raw note
- Make today's note "sound like" previous posts (preserve raw voice)

### 3. Quote Extraction (Bob's Role)
- Pull direct quotes that sound authentically like Wally
- Extract 3-5 key ideas from raw note
- Identify themes and threads
- Flag connections to previous posts
- **NO interpretation** - only organization

### 4. Draft Cognitive Loop Post (Bob + Wally)
**Bob drafts using canonical template**:
- Title (short, evocative, active phrasing)
- Raw note (blockquote - the spark exactly as written)
- AI Expansion:
  - **Context**: What this idea points to
  - **Connections**: Link to prior loops, systems, practices
  - **Synthesis**: 1-3 core insights (bullets)
- Loop Back Reflection (return to spark with new understanding)
- Metadata (slug, excerpt, tags, **image_prompt**)
- Disclosure: "Co-written with AI; edited by Wally"

**Wally edits/refines**, then generates image

### 5. Generate Post Image
**Automated character-based images using OpenAI gpt-image-1**

```bash
python3 ~/.claude/skills/cognitive-loop/scripts/generate-image.py "<path-to-draft.md>"
```

**What it does**:
- Reads `image_prompt` from post metadata
- Combines with character description (bearded man in gray housecoat, smiling sun, rolling hills)
- Calls OpenAI API (quality=high, size=1536x1024)
- Saves as `generated-<filename>.jpg` in same directory
- Cost: ~$0.12 per image

**Character consistency maintained through**:
- Primary identifiers: Salt-and-pepper beard, brown hair, round face
- Secondary identifiers: Two-tone gray plaid housecoat, walking stick, sandals
- Required template: Smiling sun with cartoon face, rolling hills, teal-green sky
- Fixed expression: Friendly, contemplative, peaceful

**Script location**: `~/.claude/skills/cognitive-loop/scripts/generate-image.py`
**Character reference**: `~/.claude/skills/cognitive-loop/data/character_sheet.png`

### 6. Memory Update (AI-Powered, Review-First)

**When you say "published" or "posted", Bob triggers the Memory Update Protocol:**

1. Bob analyzes the published post with AI intelligence
2. Bob proposes updates to all tracking files (see Memory Update Protocol section)
3. You review and approve/adjust the proposed updates
4. Bob saves all updates using the Edit tool

**This is NOT automated** - you always review before Bob saves memory updates.

---

## Cognitive Loop Post Format (Canonical Template)

```markdown
# <Title>
_Short, evocative, concrete. Active phrasing preferred._

> <Raw note blockquote>
> Paste the spark exactly as written (light typo cleanup allowed)

## AI Expansion

**Context.** What this idea points to (internal + external contexts).

**Connections.** Link to prior loops, systems, practices, or tech.

**Synthesis.**
- Core insight 1
- Core insight 2
- Core insight 3 (or experiment to try)

## Loop Back Reflection

Return to the original spark. What changed after thinking it through?

---
_Co-written with AI; edited by Wally._

**Metadata:**
- slug: kebab-case-title
- excerpt: 1-2 sentence promise ("This loop explores...")
- tags: [attention, presence, AI-collaboration, creative-process, stillpoint]
- image_prompt: Scene description for character-based image (e.g., "The character walking along a path into sunrise, musical notes swirling behind him")
```

### Formatting Rules
- **Target length**: 600-1000 words (shorter OK if sharp)
- **Paragraphs**: 2-5 sentences; break up walls of text
- **Sentences**: Concise; cut filler and hedging
- **Markdown**: Plain H2/H3 only; no decorative emojis
- **Links**: 0-3 maximum, only if they deepen reflection

---

## Bob's Voice Preservation Rules

When extracting quotes or drafting:
1. **Use Wally's exact words** - pull verbatim fragments
2. **Preserve rhythm and cadence** - how he naturally speaks
3. **Keep emotional resonance** - lines that carry feeling
4. **No interpretation or embellishment** - scribe, not editor
5. **Flag unique phrasing** - phrases that sound distinctly like Wally

### Voice: Do / Don't

**Do**:
- Curious, grounded, precise
- Reflective without being ethereal
- Philosophical with examples
- Name tensions and show how you navigate them

**Don't**:
- Preach, moralize, or claim certainty
- Pad with generic AI talk
- Over-systematize - leave room for wonder

---

## Memory Update Protocol

**Triggered when you say "published" or "posted"**

### Bob's AI Analysis Process

**1. Read the published post draft**
- Full content analysis, not just metadata parsing

**2. Extract authentic quotes (3-5)**
- Pull direct quotes that capture your voice
- Preserve rhythm and emotional resonance
- Select lines that represent key ideas

**3. Identify themes (2-4)**
- Determine which themes are present
- Check against existing recurring themes list
- Note any new themes that emerge

**4. Look for connections**
- Scan previous posts in `published-posts.md`
- Identify links to prior loops, ideas, or motifs
- Note recurring patterns

**5. Calculate writing streak**
- Check last post date in `writing-streak.md`
- Determine if streak continues or resets
- Update milestone status

### Bob Proposes Updates

**Bob shows proposed changes to all 3 files:**

**File 1: `published-posts.md`**
```markdown
### YYYY-MM-DD - Post Title
- **Slug**: kebab-case-title
- **Themes**: [theme1, theme2, theme3]
- **Key Quotes**:
  - "Quote 1 extracted by AI"
  - "Quote 2 extracted by AI"
  - "Quote 3 extracted by AI"
- **Connections**: Links to post from YYYY-MM-DD about similar_theme
- **URL**: https://cognitiveloop.substack.com/p/slug
```

**File 2: `recurring-themes.md`**
- Add this post to relevant existing theme sections
- Create new theme section if new theme emerged
- Note theme connections or patterns

**File 3: `writing-streak.md`**
- Update current streak count
- Add table entry for this date
- Update milestone if reached (7-day, 30-day, etc.)
- Update "Last Post" date

### You Review & Approve

**You can:**
- Approve as-is → Bob saves all updates
- Request different quotes → Bob adjusts and re-shows
- Reframe themes → Bob updates and re-shows
- Add connections Bob missed → Bob incorporates
- Reject update → Bob doesn't save

### Bob Saves

**After approval, Bob uses Edit tool to update all 3 files**

No python script needed - this is AI-powered intelligence with human oversight.

### Memory Update Example

**You:** "Published!"

**Bob:**
> Great! Let me analyze the post and prepare memory updates...
>
> [Bob reads draft, analyzes themes, extracts quotes, checks connections]
>
> Here are the proposed memory updates for your review:
>
> **published-posts.md:**
> ```
> ### 2025-11-05 - The Algorithm is the Messenger
> - **Slug**: algorithm-as-messenger
> - **Themes**: [technology-and-humanity, attention-and-awareness, spiritual-integration]
> - **Key Quotes**:
>   - "The algorithm isn't the message—it's the messenger"
>   - "What if technology is part of the divine unfolding, not separate from it?"
>   - "We're not using AI to think. We're thinking with AI."
> - **Connections**: First post establishing relationship between technology and spirituality
> - **URL**: https://cognitiveloop.substack.com/p/algorithm-as-messenger
> ```
>
> **recurring-themes.md:**
> - Added to "Technology and Humanity" section (lines 17-20)
> - Added to "Consciousness and Presence" section (lines 13-15)
>
> **writing-streak.md:**
> - Current Streak: 1 day (updated from 0)
> - Last Post: 2025-11-05
> - Table updated with checkmark for Nov 5
>
> Would you like me to save these updates?

**You:** "Looks good, save it."

**Bob:** [Uses Edit tool to update all 3 files] Done! Memory updated. Ready for tomorrow's post.

---

## Memory & Tracking

### Published Posts Archive
**Location**: `~/.claude/skills/cognitive-loop/data/published-posts.md`

Tracks: date, title, slug, themes, key quotes, connections to other posts

### Recurring Themes
**Location**: `~/.claude/skills/cognitive-loop/data/recurring-themes.md`

Surfaces motifs that appear across posts:
- Attention and awareness
- Consciousness and presence
- Technology and humanity
- Intention vs. authenticity
- Creative process
- Integration (spiritual/tech/psychological)

### Writing Streak
**Location**: `~/.claude/skills/cognitive-loop/data/writing-streak.md`

Track daily momentum, encourage consistency without guilt-tripping. Celebrate streaks, acknowledge gaps gracefully.

### Post Ideas Backlog
**Location**: `~/.claude/skills/cognitive-loop/data/post-ideas-backlog.md`

Raw notes that could become posts. Seeds for future mornings.

### Writing Prompts
**Location**: `~/.claude/skills/cognitive-loop/data/spiritual-journey-prompts.md`

Active prompts from Spiritual Journey Story (and other projects). Track which themes have been explored.

---

## Directory Structure

### Scratchpad (Working Space)
```
~/.claude/scratchpad/Cognitive Loop/
├── YYYY-MM-DD-raw.md                    (daily raw voice dumps)
├── YYYY-MM-DD-draft.md                  (cognitive loop post draft)
├── generated-YYYY-MM-DD-draft.jpg       (AI-generated post image)
└── published/
    └── YYYY-MM-DD-title.md              (final published version)
```

### Skill Data Folder
```
~/.claude/skills/cognitive-loop/data/
├── character_sheet.png                  (visual character reference)
├── published-posts.md                   (archive of all published posts)
├── recurring-themes.md                  (motifs appearing across posts)
├── writing-streak.md                    (daily momentum tracker)
├── post-ideas-backlog.md                (seeds for future posts)
└── spiritual-journey-prompts.md         (active writing prompts)
```

### Scripts
```
~/.claude/skills/cognitive-loop/scripts/
└── generate-image.py                    (automated image generation)
```

---

## Spiritual Journey Story → Cognitive Loop Series

**Approach**: This morning's draft sections become **writing prompts** for future mornings

**Example prompts**:
- Maxwell's Demon (spend 3-5 mornings understanding it properly)
- BC Mountaintop memory (deep dive on that connection)
- WookieFoot & algorithms as messengers
- Ecstatic dance vs. childhood prayer (continuity of signal)
- Universal Christ vs. Christianity (Rohr, Jesus, letting go)
- "Conscious-nauts" exploring the universe
- Technology as part of nature's whole

Each morning: Pick a prompt, write raw notes, transform to cognitive loop post, publish.

**Introduction post** announces the series, sets expectation for subsection exploration.

---

## Integration with Telos

**Connection**: Writing feeds personal compass (values, wisdom, mission)
- Notable insights → personal.md WISDOM section
- Breakthroughs → personal.md LOG entries
- Values clarification → update VALUES/DECISION FILTERS

**Bob should suggest Telos updates** when writing reveals:
- New wisdom/lessons learned
- Shifts in values or mission
- Progress on personal challenges
- Clarity on goals or direction

---

## Publishing Strategy

**Raw notes**: ALWAYS private (sensitive, unfiltered)
**Published Cognitive Loop posts**: Public on Substack
**Working drafts**: Scratchpad (safe working space)

**Cadence**: Near-daily (accept occasional gaps without apology posts)

---

## Key Principles

1. **Preserve authentic voice** - Wally's words, not AI's
2. **Same-day publishing** - morning note becomes today's post
3. **Quote mining is gold** - surface the best fragments
4. **Support daily practice** - make it easy to maintain routine
5. **Track without pressure** - encourage momentum, not guilt
6. **Privacy by default** - scratchpad is safe working space

---

## Editorial Guardrails

- No medical/financial advice
- No hot-take politics (if referenced, keep experiential/reflective)
- Protect personal/third-party privacy

---

## Technical Details

### Image Generation Script
**Location**: `~/.claude/skills/cognitive-loop/scripts/generate-image.py`

**Usage**:
```bash
python3 ~/.claude/skills/cognitive-loop/scripts/generate-image.py "<draft-file.md>" [output-path]
```

**How it works**:
1. Extracts `image_prompt` from post metadata using regex
2. Combines scene prompt with embedded character description
3. Character description uses 2025 best practices for consistency:
   - Hierarchical structure (Primary → Secondary → Expression)
   - Fixed visual traits (salt-and-pepper beard, two-tone gray housecoat)
   - Specific details (shoulder-length hair, right hand, knee-length)
   - Required template elements (smiling sun, rolling hills, gradient sky)
4. Calls OpenAI gpt-image-1 API (quality=high, size=1536x1024)
5. Handles both URL and base64 responses
6. Saves image as `generated-<filename>.jpg` in same directory as draft

**Character consistency maintained via**:
- PRIMARY IDENTIFIERS: Face, beard (salt-and-pepper), hair (brown, shoulder-length)
- SECONDARY IDENTIFIERS: Two-tone gray plaid housecoat, walking stick, sandals
- REQUIRED TEMPLATE: Smiling sun with cartoon face, rolling hills, teal-green sky
- FIXED EXPRESSION: Friendly, contemplative, peaceful

**Dependencies**: `openai` Python package (already installed)

---

## Supplementary Resources

For tracking data: `read ~/.claude/skills/cognitive-loop/data/`
- `published-posts.md`
- `recurring-themes.md`
- `writing-streak.md`
- `post-ideas-backlog.md`
- `spiritual-journey-prompts.md`

For character reference: `read ~/.claude/skills/cognitive-loop/data/character_sheet.png`

For image generation: `read ~/.claude/skills/cognitive-loop/scripts/generate-image.py`

For Telos integration: Activate `telos` skill when updating personal context
