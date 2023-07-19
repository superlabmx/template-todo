import { Task, TodoListInputs } from './Interfaces';

function TodoList({ list, onDelete }: TodoListInputs) {
    return (
        <ul className="todo-list">
            {list.map((task: Task, index: number) => (
                <li key={index} id={task.id}>
                    <span>{task.title}</span>
                    <button className="delete-btn" onClick={() => onDelete(index, task.id)}>
                        Delete
                    </button>
                </li>
            ))}
        </ul>
    );
}

export default TodoList;