const runTasks = (tasks: Task[], cycle: Cycle): TaskCleanupFunction[] =>
    tasks.map((task) =>
        task.run(cycle.createEmitter(task), task.payload)
    )
    .filter(Boolean) as TaskCleanupFunction[];

export default runTasks;