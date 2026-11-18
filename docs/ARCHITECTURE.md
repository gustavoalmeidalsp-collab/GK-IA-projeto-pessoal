# Architecture · Public GKIA module

~~~mermaid
flowchart LR
  A[Tasks] --> B[Validate IDs and limits]
  B --> C{Canceled?}
  C -- Yes --> H[Partial report]
  C -- No --> D[Find named handler]
  D --> E[Await local handler]
  E --> F{Successful?}
  F -- Yes --> G[Record output]
  F -- No --> I[Record safe error code]
  G --> J{More tasks?}
  I --> K{Continue on error?}
  K -- Yes --> J
  K -- No --> H
  J -- Yes --> C
  J -- No --> L[Final report]
~~~

## API

~~~js
const { runTasks } = require('./src');
const report = await runTasks({
  tasks: [{ id: 'plan', agent: 'planner', input: { goal: 'demo' } }],
  handlers: { planner: async input => ({ goal: input.goal }) },
  continueOnError: false,
  onEvent: event => console.log(event.status)
});
~~~

- `tasks`: up to 50 entries with unique safe `id` and `agent`.
- `handlers`: explicit mapping from agent names to local functions, sync or async.
- `context`: caller-controlled context shared with handler functions.
- `previousResults`: earlier task results in sequence, including outputs.
- `continueOnError`: defaults to false.
- `onEvent`: emits metadata (task ID, agent, status and index), not task content.
- `signal`: cancellation is checked before starting the next task.
- Output: `{ status, results, summary }`.

No language-model calls, infrastructure, databases, external messaging, automatic retries or hosting are included.

**The private GKIA Assistente application is a separate project.** This source is an original stand-alone public demonstration, not a copy of private customer or project code.
