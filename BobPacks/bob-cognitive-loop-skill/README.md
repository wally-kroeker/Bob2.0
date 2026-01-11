---
name: Bob Cognitive Loop Skill
pack-id: bob-cognitive-loop-skill-v1.0.0
version: 1.0.0
author: wally-kroeker
description: Daily writing practice and Substack publishing workflow. Transforms morning notes into Cognitive Loop posts while preserving authentic voice.
type: skill
platform: claude-code
dependencies: []
keywords: [cognitive-loop, substack, writing, publishing, voice, daily-practice]
---

# Bob Cognitive Loop Skill

Daily reflective writing workflow for Substack publishing.

## Features

- **Morning Capture**: Voice-to-text or raw notes from morning thinking
- **Quote Extraction**: Pull authentic voice fragments from raw notes
- **Draft Creation**: Transform into structured Cognitive Loop posts
- **Image Generation**: Automated character-based images (OpenAI)
- **Memory Tracking**: Archives, streaks, recurring themes
- **Voice Preservation**: Maintains authentic voice across posts

## Activation Triggers

Bob activates this skill when:
- You mention "cognitive loop" or daily writing
- You want to draft a Substack post
- You ask about your writing streak
- You need help with morning notes

## Installation

```bash
cp -r src/skills/cognitive-loop ~/.claude/skills/
pip install openai python-dotenv requests
```

## Environment Setup

```bash
export OPENAI_API_KEY="sk-proj-..."
```
