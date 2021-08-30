import { getAsync, setAsync } from "./redis";

export const getTasks = async (): Promise<Array<string>> => {
  const data = (await getAsync("running_tasks")) || "";
  return JSON.parse(data) || [];
};

export const addTask = async (task: string) => {
  // Get currently running tasks
  const runningTasks = await getTasks();

  // Add new running task without duplicates
  const newRunningTasks = Array.from(new Set([...runningTasks, task]));

  // Set new running tasks in redis store
  await setAsync("running_tasks", JSON.stringify(newRunningTasks));

  return newRunningTasks;
};

export const removeTask = async (task: string) => {
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
