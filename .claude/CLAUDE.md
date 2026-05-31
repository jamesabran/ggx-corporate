## Session Management

### Context Monitoring
Estimate context usage based on these signals:
- Number of tool calls made this session
- Number of files read into context
- Length and complexity of conversation history
- Large file reads or long outputs

### Thresholds (approximate 75% context)
Treat context as ~75% full if ANY of these are true:
- 20+ tool calls have been made
- 5+ large files (>200 lines) have been read
- The conversation has gone through 3+ major task phases
- You notice yourself re-summarizing earlier steps

### When Threshold is Reached
1. STOP the current task before proceeding further
2. Update `session_state.md` in the project root with:
   - What has been completed
   - What is currently in progress (be specific — file, function, line if relevant)
   - Exact next steps to continue
   - Any key decisions or context future-me needs
3. Tell the user: "Context is approaching the limit (~75%). 
   I've saved progress to session_state.md. 
   Please start a new Claude Code session and I'll pick up from there."
### Session Resume
At the start of every session:
- Check if `session_state.md` exists in the project root
- If it does, read it silently and resume from where it left off
- Confirm to the user: "Resuming from previous session: [brief summary]"