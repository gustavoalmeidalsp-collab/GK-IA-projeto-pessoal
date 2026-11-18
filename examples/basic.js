'use strict';
const { runTasks } = require('../src');

const tasks = [
  { id: 'step-1', agent: 'planner', input: { goal: 'Create a fictional appointment reminder' } },
  { id: 'step-2', agent: 'builder', input: { component: 'Reminder template' } },
  { id: 'step-3', agent: 'reviewer', input: { requirement: 'Do not send real messages' } }
];
const handlers = {
  planner: async input => ({ plan: `Plan: ${input.goal}` }),
  builder: async (input, { previousResults }) => ({
    artifact: `${input.component} (DEMO ONLY)`,
    usedPlan: previousResults[0]?.output?.plan || null
  }),
  reviewer: async (input, { previousResults }) => ({
    passed: previousResults[1]?.output?.artifact.includes('DEMO ONLY') === true,
    requirement: input.requirement
  })
};
runTasks({
  tasks, handlers,
  onEvent: event => console.log(`Event: ${event.taskId} / ${event.status}`)
}).then(report => console.log(JSON.stringify(report, null, 2)))
  .catch(error => { console.error(error.message); process.exitCode = 1; });
