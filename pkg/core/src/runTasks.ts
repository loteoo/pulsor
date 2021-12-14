import { Task, Cycle } from './types';

const runTasks = (tasks: Task[], cycle: Cycle): void =>
  tasks.forEach((task) => {
    // console.log('task', task)
    const cleanup = task.run(cycle.createEmitter(task), task.payload)
    if (cleanup && task.vNode?.el) {
      // @ts-ignore
      if (!task.vNode.el?.clearTasks) {
        // @ts-ignore
        task.vNode.el.clearTasks = [];
      }
      // @ts-ignore
      task.vNode.el?.clearTasks?.push(cleanup)
    }
  });

export default runTasks;
