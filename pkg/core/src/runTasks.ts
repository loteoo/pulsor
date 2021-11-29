const runTasks = (tasks: Task[], cycle: Cycle): void =>
    tasks.forEach((task) => {
        console.log('task', task)
        const cleanup = task.run(cycle.createEmitter(task), task.payload)
        if (cleanup) {
            if (!task.vNode?.clearTasks) {
                // @ts-ignore
                task.vNode.clearTasks = [];
            }
            task.vNode?.clearTasks?.push(cleanup)
        }
    });

export default runTasks;