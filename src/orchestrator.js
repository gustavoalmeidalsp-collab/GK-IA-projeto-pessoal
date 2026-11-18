'use strict';

/**
 * Dependency-free sequential named-agent orchestrator.
 * Educational companion to GKIA Assistente, NOT its private production runtime.
 */
const MAX_TASKS = 50;
const IDENTIFIER = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/;

function assertTask(task, index) {
  if (!task || typeof task !== 'object' || Array.isArray(task)) {
    throw new TypeError(`tasks[${index}] must be an object`);
  }
  if (typeof task.id !== 'string' || !IDENTIFIER.test(task.id)) {
    throw new TypeError(`tasks[${index}].id must be 1–64 safe characters`);
  }
  if (typeof task.agent !== 'string' || !IDENTIFIER.test(task.agent)) {
    throw new TypeError(`tasks[${index}].agent must be 1–64 safe characters`);
  }
}

function errorCodeFor(error) {
  const code = error && error.code;
  return typeof code === 'string' && /^[A-Z][A-Z0-9_]{0,39}$/.test(code)
    ? code
    : 'HANDLER_FAILED';
}

/**
 * @param {object} options
 * @param {Array<{id:string,agent:string,input?:unknown}>} options.tasks
 * @param {Record<string,Function>} options.handlers Named handler functions.
 * @param {unknown} [options.context] Shared caller-controlled context.
 * @param {boolean} [options.continueOnError=false] Continue after task failure.
 * @param {(event:object)=>void} [options.onEvent] Status-only observer.
 * @param {AbortSignal} [options.signal] Cancellation checked before each task.
 * @returns {Promise<{status:string, results:Array, summary:object}>}
 */
async function runTasks(options = {}) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('options must be an object');
  }
  const { tasks, handlers, context = {}, continueOnError = false,
    onEvent = () => {}, signal } = options;
  if (!Array.isArray(tasks)) throw new TypeError('tasks must be an array');
  if (tasks.length > MAX_TASKS) throw new RangeError(`Maximum ${MAX_TASKS} tasks per run`);
  if (!handlers || typeof handlers !== 'object' || Array.isArray(handlers)) {
    throw new TypeError('handlers must be an object');
  }
  if (typeof continueOnError !== 'boolean') throw new TypeError('continueOnError must be boolean');
  if (typeof onEvent !== 'function') throw new TypeError('onEvent must be a function');
  if (signal !== undefined &&
    (!signal || typeof signal !== 'object' || typeof signal.aborted !== 'boolean')) {
    throw new TypeError('signal must be an AbortSignal-like object');
  }

  const seen = new Set();
  for (const [index, task] of tasks.entries()) {
    assertTask(task, index);
    if (seen.has(task.id)) throw new Error(`Duplicate task id: ${task.id}`);
    seen.add(task.id);
  }

  const results = [];
  let failed = 0;
  let stopped = false;
  let canceled = false;
  function emit(status, task, index) {
    try { onEvent(Object.freeze({ status, taskId: task.id, agent: task.agent, index })); }
    catch { /* events are best effort */ }
  }

  for (const [index, task] of tasks.entries()) {
    if (signal?.aborted) {
      canceled = true;
      emit('canceled', task, index);
      break;
    }
    emit('started', task, index);
    const handler = Object.hasOwn(handlers, task.agent) ? handlers[task.agent] : undefined;
    if (typeof handler !== 'function') {
      results.push({ taskId: task.id, agent: task.agent, status: 'failed', errorCode: 'HANDLER_NOT_FOUND' });
      failed++;
      emit('failed', task, index);
      if (!continueOnError) { stopped = true; break; }
      continue;
    }
    try {
      const output = await handler(task.input, {
        taskId: task.id, index, context, previousResults: Object.freeze([...results]), signal
      });
      results.push({ taskId: task.id, agent: task.agent, status: 'completed', output });
      emit('completed', task, index);
    } catch (error) {
      results.push({ taskId: task.id, agent: task.agent, status: 'failed', errorCode: errorCodeFor(error) });
      failed++;
      emit('failed', task, index);
      if (!continueOnError) { stopped = true; break; }
    }
  }
  const status = canceled ? 'canceled' : failed ? 'failed' : 'completed';
  return {
    status,
    results,
    summary: {
      total: tasks.length,
      executed: results.length,
      succeeded: results.length - failed,
      failed,
      skipped: tasks.length - results.length,
      stoppedEarly: stopped || canceled
    }
  };
}

module.exports = { runTasks, MAX_TASKS };
