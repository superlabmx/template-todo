interface Task {
    id: string,
    title: string
}

interface TodoListInputs {
    list: Array<Task>,
    onDelete: Function
}

export type { Task, TodoListInputs };