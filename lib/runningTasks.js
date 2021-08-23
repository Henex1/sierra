/* eslint-disable @typescript-eslint/no-var-requires */
const { getAsync, setAsync } = require("./redis");

const addTask = async (task) => {
  // Get currently running tasks
  const data = await getAsync("running_tasks");
  const runningTasks = JSON.parse(data) || [];

  // Add new running task without duplicates
  const newRunningTasks = Array.from(new Set([...runningTasks, task]));

  // Set new running tasks in redis store
  await setAsync("running_tasks", JSON.stringify(newRunningTasks));

  return newRunningTasks;
};

const removeTask = async (task) => {
  // Get currently running tasks
  const data = await getAsync("running_tasks");
  const runningTasks = JSON.parse(data) || [];

  // Remove running task
  const newRunningTasks = runningTasks.filter(
    (runningTask) => runningTask !== task
  );

  // Set new running tasks in redis store
  await setAsync("running_tasks", JSON.stringify(newRunningTasks));

  return newRunningTasks;
};

module.exports = { addTask, removeTask };
