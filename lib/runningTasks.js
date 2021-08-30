/* eslint-disable @typescript-eslint/no-var-requires */
const { getAsync, setAsync } = require("./redis");

const getTasks = async () => {
  const data = await getAsync("running_tasks");
  return JSON.parse(data) || [];
};

const addTask = async (task) => {
  // Get currently running tasks
  const runningTasks = await getTasks();

  // Add new running task without duplicates
  const newRunningTasks = Array.from(new Set([...runningTasks, task]));

  // Set new running tasks in redis store
  await setAsync("running_tasks", JSON.stringify(newRunningTasks));

  return newRunningTasks;
};

const removeTask = async (task) => {
  // Get currently running tasks
  const runningTasks = await getTasks();

  // Remove running task
  const newRunningTasks = runningTasks.filter(
    (runningTask) => runningTask !== task
  );

  // Set new running tasks in redis store
  await setAsync("running_tasks", JSON.stringify(newRunningTasks));

  return newRunningTasks;
};

module.exports = { addTask, removeTask, getTasks };
