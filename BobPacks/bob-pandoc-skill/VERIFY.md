# Verification Checklist

## Installation

- [ ] Skill directory exists in ~/.claude/skills/
- [ ] SKILL.md file is present and readable
- [ ] Claude Code has been restarted

## Functionality

- [ ] Skill activates when triggered
- [ ] No errors in Claude Code console
- [ ] Commands execute successfully

## Troubleshooting

If skill doesn't activate:
1. Check ~/.claude/settings.json has `Skill(*)` in permissions
2. Restart Claude Code
3. Verify file permissions are readable
