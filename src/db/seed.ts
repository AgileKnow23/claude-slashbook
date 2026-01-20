import { db, Command } from './index';

const seedCommands: Omit<Command, 'id'>[] = [
  // Claude Native Commands (30)
  { cmd: '/help', description: 'Get help with using Claude Code', category: 'native', tags: ['help', 'info'] },
  { cmd: '/clear', description: 'Clear conversation context', category: 'native', tags: ['context', 'session'] },
  { cmd: '/exit', description: 'Exit Claude Code', category: 'native', tags: ['quit', 'close'] },
  { cmd: '/quit', description: 'Exit Claude Code (alias)', category: 'native', tags: ['exit', 'close'] },
  { cmd: '/model', description: 'Change or view current model', category: 'native', tags: ['config', 'settings'] },
  { cmd: '/tokens', description: 'Show token usage for session', category: 'native', tags: ['usage', 'stats'] },
  { cmd: '/cost', description: 'Show cost information', category: 'native', tags: ['usage', 'billing'] },
  { cmd: '/tasks', description: 'List background tasks and agents', category: 'native', tags: ['agents', 'background'] },
  { cmd: '/memory', description: 'Edit CLAUDE.md memory files', category: 'native', tags: ['config', 'memory'] },
  { cmd: '/init', description: 'Initialize project CLAUDE.md', category: 'native', tags: ['setup', 'project'] },
  { cmd: '/mcp', description: 'Manage MCP servers', category: 'native', tags: ['mcp', 'servers'] },
  { cmd: '/config', description: 'View or modify configuration', category: 'native', tags: ['settings', 'config'] },
  { cmd: '/settings', description: 'Open settings', category: 'native', tags: ['config', 'preferences'] },
  { cmd: '/permissions', description: 'View or modify permissions', category: 'native', tags: ['security', 'access'] },
  { cmd: '/history', description: 'View conversation history', category: 'native', tags: ['context', 'session'] },
  { cmd: '/resume', description: 'Resume a previous conversation', category: 'native', tags: ['context', 'session'] },
  { cmd: '/compact', description: 'Compact conversation context', category: 'native', tags: ['context', 'memory'] },
  { cmd: '/doctor', description: 'Check health of installation', category: 'native', tags: ['debug', 'health'] },
  { cmd: '/status', description: 'Show current session status', category: 'native', tags: ['info', 'session'] },
  { cmd: '/diff', description: 'Show uncommitted changes', category: 'native', tags: ['git', 'changes'] },
  { cmd: '/bug', description: 'Report a bug', category: 'native', tags: ['feedback', 'issues'] },
  { cmd: '/review', description: 'Review code changes', category: 'native', tags: ['git', 'code'] },
  { cmd: '/login', description: 'Log in to Anthropic account', category: 'native', tags: ['auth', 'account'] },
  { cmd: '/logout', description: 'Log out of Anthropic account', category: 'native', tags: ['auth', 'account'] },
  { cmd: '/listen', description: 'Enable voice input mode', category: 'native', tags: ['voice', 'input'] },
  { cmd: '/terminal-setup', description: 'Configure terminal integration', category: 'native', tags: ['setup', 'terminal'] },
  { cmd: '/vim', description: 'Toggle vim mode', category: 'native', tags: ['editor', 'vim'] },
  { cmd: '/ide', description: 'Connect to IDE', category: 'native', tags: ['ide', 'integration'] },
  { cmd: '/add-dir', description: 'Add directory to workspace', category: 'native', tags: ['workspace', 'directory'] },
  { cmd: '/pr', description: 'Create a pull request', category: 'native', tags: ['git', 'pr', 'github'] },

  // GSD Extension Commands (24)
  { cmd: '/gsd:help', description: 'Show GSD command reference', syntax: '/gsd:help', category: 'gsd', tags: ['help', 'reference'] },
  { cmd: '/gsd:new-project', description: 'Initialize new project with full flow', syntax: '/gsd:new-project', category: 'gsd', tags: ['init', 'project'] },
  { cmd: '/gsd:new-milestone', description: 'Start a new milestone cycle', syntax: '/gsd:new-milestone "[name]"', category: 'gsd', tags: ['milestone', 'planning'] },
  { cmd: '/gsd:map-codebase', description: 'Analyze codebase for brownfield projects', syntax: '/gsd:map-codebase [focus]', category: 'gsd', tags: ['analysis', 'codebase'] },
  { cmd: '/gsd:plan-phase', description: 'Create detailed execution plan', syntax: '/gsd:plan-phase <N> [--research]', category: 'gsd', tags: ['planning', 'phase'] },
  { cmd: '/gsd:execute-phase', description: 'Execute all plans in a phase', syntax: '/gsd:execute-phase <N>', category: 'gsd', tags: ['execute', 'phase'] },
  { cmd: '/gsd:discuss-phase', description: 'Gather context before planning', syntax: '/gsd:discuss-phase <N>', category: 'gsd', tags: ['discuss', 'context'] },
  { cmd: '/gsd:research-phase', description: 'Deep implementation research', syntax: '/gsd:research-phase <N>', category: 'gsd', tags: ['research', 'phase'] },
  { cmd: '/gsd:list-phase-assumptions', description: "Surface Claude's assumptions", syntax: '/gsd:list-phase-assumptions <N>', category: 'gsd', tags: ['assumptions', 'phase'] },
  { cmd: '/gsd:progress', description: 'Check status and route to next action', syntax: '/gsd:progress', category: 'gsd', tags: ['status', 'progress'] },
  { cmd: '/gsd:resume-work', description: 'Resume with full context restoration', syntax: '/gsd:resume-work', category: 'gsd', tags: ['resume', 'context'] },
  { cmd: '/gsd:pause-work', description: 'Create context handoff', syntax: '/gsd:pause-work', category: 'gsd', tags: ['pause', 'handoff'] },
  { cmd: '/gsd:add-phase', description: 'Add phase to end of milestone', syntax: '/gsd:add-phase "<desc>"', category: 'gsd', tags: ['phase', 'add'] },
  { cmd: '/gsd:insert-phase', description: 'Insert urgent work as decimal phase', syntax: '/gsd:insert-phase <N> "<desc>"', category: 'gsd', tags: ['phase', 'insert', 'urgent'] },
  { cmd: '/gsd:remove-phase', description: 'Remove future phase and renumber', syntax: '/gsd:remove-phase <N>', category: 'gsd', tags: ['phase', 'remove'] },
  { cmd: '/gsd:complete-milestone', description: 'Archive and prepare next version', syntax: '/gsd:complete-milestone <ver>', category: 'gsd', tags: ['milestone', 'complete'] },
  { cmd: '/gsd:audit-milestone', description: 'Audit completion against intent', syntax: '/gsd:audit-milestone [ver]', category: 'gsd', tags: ['audit', 'milestone'] },
  { cmd: '/gsd:plan-milestone-gaps', description: 'Create phases for audit gaps', syntax: '/gsd:plan-milestone-gaps', category: 'gsd', tags: ['gaps', 'planning'] },
  { cmd: '/gsd:debug', description: 'Systematic debugging with persistence', syntax: '/gsd:debug "[issue]"', category: 'gsd', tags: ['debug', 'troubleshoot'] },
  { cmd: '/gsd:add-todo', description: 'Capture idea as todo', syntax: '/gsd:add-todo [desc]', category: 'gsd', tags: ['todo', 'capture'] },
  { cmd: '/gsd:check-todos', description: 'List pending todos', syntax: '/gsd:check-todos [area]', category: 'gsd', tags: ['todo', 'list'] },
  { cmd: '/gsd:verify-work', description: 'Validate features through UAT', syntax: '/gsd:verify-work [phase]', category: 'gsd', tags: ['verify', 'testing'] },
  { cmd: '/gsd:update', description: 'Update GSD to latest version', syntax: '/gsd:update', category: 'gsd', tags: ['update', 'version'] },
  { cmd: '/gsd:whats-new', description: "See what's new since your version", syntax: '/gsd:whats-new', category: 'gsd', tags: ['changelog', 'version'] },

  // CLI Options (28)
  { cmd: 'claude --help', description: 'Display CLI help', category: 'cli', tags: ['help', 'info'] },
  { cmd: 'claude --version', description: 'Show version number', category: 'cli', tags: ['version', 'info'] },
  { cmd: 'claude --print', description: 'Print response and exit (non-interactive)', category: 'cli', tags: ['output', 'script'] },
  { cmd: 'claude --continue', description: 'Continue most recent conversation', category: 'cli', tags: ['session', 'resume'] },
  { cmd: 'claude --resume', description: 'Resume conversation by ID', category: 'cli', tags: ['session', 'resume'] },
  { cmd: 'claude --model', description: 'Set model (sonnet, opus, haiku)', category: 'cli', tags: ['model', 'config'] },
  { cmd: 'claude --debug', description: 'Enable debug mode', category: 'cli', tags: ['debug', 'verbose'] },
  { cmd: 'claude --verbose', description: 'Override verbose mode', category: 'cli', tags: ['output', 'verbose'] },
  { cmd: 'claude --system-prompt', description: 'Set custom system prompt', category: 'cli', tags: ['prompt', 'config'] },
  { cmd: 'claude --append-system-prompt', description: 'Append to system prompt', category: 'cli', tags: ['prompt', 'config'] },
  { cmd: 'claude --allowed-tools', description: 'Comma-separated allowed tools', category: 'cli', tags: ['tools', 'permissions'] },
  { cmd: 'claude --disallowed-tools', description: 'Comma-separated denied tools', category: 'cli', tags: ['tools', 'permissions'] },
  { cmd: 'claude --add-dir', description: 'Additional directories for access', category: 'cli', tags: ['workspace', 'directory'] },
  { cmd: 'claude --permission-mode', description: 'Set permission mode', category: 'cli', tags: ['permissions', 'security'] },
  { cmd: 'claude --output-format', description: 'Output: text, json, stream-json', category: 'cli', tags: ['output', 'format'] },
  { cmd: 'claude --input-format', description: 'Input: text, stream-json', category: 'cli', tags: ['input', 'format'] },
  { cmd: 'claude --json-schema', description: 'JSON Schema for structured output', category: 'cli', tags: ['output', 'schema'] },
  { cmd: 'claude --max-budget-usd', description: 'Maximum API spend', category: 'cli', tags: ['budget', 'cost'] },
  { cmd: 'claude --fallback-model', description: 'Fallback when overloaded', category: 'cli', tags: ['model', 'fallback'] },
  { cmd: 'claude --mcp-config', description: 'Load MCP servers from JSON', category: 'cli', tags: ['mcp', 'config'] },
  { cmd: 'claude --ide', description: 'Auto-connect to IDE', category: 'cli', tags: ['ide', 'integration'] },
  { cmd: 'claude --dangerously-skip-permissions', description: 'Bypass permission checks', category: 'cli', tags: ['permissions', 'danger'] },
  { cmd: 'claude doctor', description: 'Check auto-updater health', category: 'cli', tags: ['health', 'debug'] },
  { cmd: 'claude update', description: 'Check and install updates', category: 'cli', tags: ['update', 'version'] },
  { cmd: 'claude mcp', description: 'Manage MCP servers', category: 'cli', tags: ['mcp', 'servers'] },
  { cmd: 'claude install', description: 'Install native build', category: 'cli', tags: ['install', 'setup'] },
  { cmd: 'claude setup-token', description: 'Set up auth token', category: 'cli', tags: ['auth', 'token'] },
  { cmd: 'claude plugin', description: 'Manage plugins', category: 'cli', tags: ['plugins', 'extensions'] },

  // MCP Tools (7)
  { cmd: 'claude mcp add', description: 'Add a new MCP server', category: 'mcp', tags: ['add', 'server'] },
  { cmd: 'claude mcp remove', description: 'Remove an MCP server', category: 'mcp', tags: ['remove', 'server'] },
  { cmd: 'claude mcp list', description: 'List configured servers', category: 'mcp', tags: ['list', 'server'] },
  { cmd: 'claude mcp add-json', description: 'Add server from JSON config', category: 'mcp', tags: ['add', 'json'] },
  { cmd: '/mcp add', description: 'Interactive MCP setup', category: 'mcp', tags: ['add', 'interactive'] },
  { cmd: '/mcp list', description: 'Show current servers', category: 'mcp', tags: ['list', 'status'] },
  { cmd: '/mcp remove', description: 'Remove server interactively', category: 'mcp', tags: ['remove', 'interactive'] },

  // Skills / Tools (15)
  { cmd: 'Read', description: 'Read files from filesystem', category: 'skills', tags: ['file', 'read'] },
  { cmd: 'Write', description: 'Write files to filesystem', category: 'skills', tags: ['file', 'write'] },
  { cmd: 'Edit', description: 'Edit files with string replacement', category: 'skills', tags: ['file', 'edit'] },
  { cmd: 'Glob', description: 'Find files by pattern', category: 'skills', tags: ['search', 'files'] },
  { cmd: 'Grep', description: 'Search file contents', category: 'skills', tags: ['search', 'content'] },
  { cmd: 'Bash', description: 'Execute shell commands', category: 'skills', tags: ['shell', 'command'] },
  { cmd: 'Task', description: 'Launch subagents for complex tasks', category: 'skills', tags: ['agents', 'parallel'] },
  { cmd: 'WebSearch', description: 'Search the web', category: 'skills', tags: ['web', 'search'] },
  { cmd: 'WebFetch', description: 'Fetch URL content', category: 'skills', tags: ['web', 'fetch'] },
  { cmd: 'TodoWrite', description: 'Manage task lists', category: 'skills', tags: ['tasks', 'todo'] },
  { cmd: 'NotebookEdit', description: 'Edit Jupyter notebooks', category: 'skills', tags: ['jupyter', 'notebook'] },
  { cmd: 'AskUserQuestion', description: 'Ask user for clarification', category: 'skills', tags: ['user', 'input'] },
  { cmd: 'Skill', description: 'Invoke registered skills', category: 'skills', tags: ['skills', 'invoke'] },
  { cmd: 'EnterPlanMode', description: 'Start planning mode', category: 'skills', tags: ['planning', 'mode'] },
  { cmd: 'ExitPlanMode', description: 'Exit planning mode', category: 'skills', tags: ['planning', 'mode'] },
];

export async function seedDatabase(): Promise<void> {
  const count = await db.commands.count();
  if (count > 0) {
    console.log('Database already seeded');
    return;
  }

  console.log('Seeding database with', seedCommands.length, 'commands...');
  await db.commands.bulkAdd(seedCommands.map(cmd => ({
    ...cmd,
    isCustom: false,
    createdAt: Date.now()
  })));
  console.log('Database seeded successfully');
}

export { seedCommands };
