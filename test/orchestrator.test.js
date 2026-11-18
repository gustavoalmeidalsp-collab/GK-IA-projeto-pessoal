'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { runTasks, MAX_TASKS } = require('../src');
const task = (id, agent = 'ok') => ({ id, agent, input: { id } });

test('runs in order and provides previous outputs', async () => {
  const visited = [];
  const report = await runTasks({
    tasks: [task('first'), task('second')],
    handlers: { ok: async (input, state) => {
      visited.push(input.id);
      return { fromPrevious: state.previousResults[0]?.output?.fromPrevious ?? 'initial' };
    } }
  });
  assert.deepEqual(visited, ['first', 'second']);
  assert.equal(report.results[1].output.fromPrevious, 'initial');
  assert.deepEqual(report.summary, { total: 2, executed: 2, succeeded: 2, failed: 0, skipped: 0, stoppedEarly: false });
});

test('empty workflow is successful', async () => {
  const report = await runTasks({ tasks: [], handlers: {} });
  assert.equal(report.status, 'completed');
  assert.deepEqual(report.results, []);
});

test('missing handler fails with safe code and stops', async () => {
  let invoked = false;
  const report = await runTasks({ tasks: [task('missing', 'nope'), task('later')],
    handlers: { ok: () => { invoked = true; } } });
  assert.equal(report.status, 'failed');
  assert.equal(report.results[0].errorCode, 'HANDLER_NOT_FOUND');
  assert.equal(report.summary.skipped, 1);
  assert.equal(invoked, false);
});

test('continueOnError runs subsequent tasks', async () => {
  const report = await runTasks({ tasks: [task('missing', 'nope'), task('next')],
    handlers: { ok: () => 'done' }, continueOnError: true });
  assert.equal(report.summary.failed, 1);
  assert.equal(report.summary.succeeded, 1);
  assert.equal(report.results[1].output, 'done');
});

test('exceptions do not expose message or stack', async () => {
  const report = await runTasks({ tasks: [task('x')],
    handlers: { ok: () => { throw new Error('do not expose private email@example.org'); } } });
  assert.equal(report.results[0].errorCode, 'HANDLER_FAILED');
  assert.doesNotMatch(JSON.stringify(report), /private|example\.org|stack/);
});

test('valid error codes are preserved', async () => {
  const report = await runTasks({ tasks: [task('x')],
    handlers: { ok: () => { throw Object.assign(new Error('private'), { code: 'VALIDATION_ERROR' }); } } });
  assert.equal(report.results[0].errorCode, 'VALIDATION_ERROR');
});

test('rejects duplicate task IDs', async () => {
  await assert.rejects(runTasks({ tasks: [task('same'), task('same')], handlers: {} }), /Duplicate task id/);
});

test('validates input and task limit', async () => {
  await assert.rejects(runTasks({ tasks: 'not-array', handlers: {} }), TypeError);
  await assert.rejects(runTasks({ tasks: [task('../bad')], handlers: {} }), TypeError);
  await assert.rejects(runTasks({ tasks: [task('okay', '')], handlers: {} }), TypeError);
  await assert.rejects(runTasks({ tasks: [null], handlers: {} }), TypeError);
  await assert.rejects(runTasks({ tasks: [], handlers: {}, onEvent: 'bad' }), TypeError);
  await assert.rejects(runTasks({ tasks: Array.from({length: MAX_TASKS + 1}, (_, i) => task(String(i))), handlers: {} }), RangeError);
});

test('cancels before starting a new task', async () => {
  const controller = new AbortController();
  const report = await runTasks({ tasks: [task('first'), task('second')],
    handlers: { ok: () => { controller.abort(); return 'done'; } }, signal: controller.signal });
  assert.equal(report.status, 'canceled');
  assert.equal(report.summary.executed, 1);
  assert.equal(report.summary.skipped, 1);
});

test('already canceled signal prevents execution', async () => {
  const controller = new AbortController(); controller.abort();
  const report = await runTasks({ tasks: [task('first')], handlers: { ok: () => 1 }, signal: controller.signal });
  assert.equal(report.summary.executed, 0);
  assert.equal(report.status, 'canceled');
});

test('status events omit task input and output', async () => {
  const events = [];
  await runTasks({ tasks: [{ id: 'a', agent: 'ok', input: { secret: 'PRIVATE_VALUE' } }],
    handlers: { ok: () => 'SENSITIVE_OUTPUT' }, onEvent: e => events.push(e) });
  assert.deepEqual(events.map(e => e.status), ['started', 'completed']);
  assert.doesNotMatch(JSON.stringify(events), /PRIVATE_VALUE|SENSITIVE_OUTPUT/);
});

test('observer errors do not affect the run', async () => {
  const report = await runTasks({ tasks: [task('a')], handlers: { ok: () => 1 },
    onEvent: () => { throw new Error('observer offline'); } });
  assert.equal(report.status, 'completed');
});

test('inherited object properties are not handlers', async () => {
  const report = await runTasks({ tasks: [task('a', 'toString')], handlers: {} });
  assert.equal(report.results[0].errorCode, 'HANDLER_NOT_FOUND');
});

test('does not modify frozen task objects', async () => {
  const tasks = [Object.freeze(task('a'))];
  await runTasks({ tasks: Object.freeze(tasks), handlers: { ok: () => 1 } });
  assert.equal(tasks[0].id, 'a');
});
