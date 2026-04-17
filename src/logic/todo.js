export const createTodo = (title, description, dueDate, priority, notes, checklist) => {

    const todo = {
        title,
        description,
        dueDate,
        priority,
        notes,
        checklist,
        isCompleted: false,
        createdAt: Date.now(),
        updatePriority(newPriority) {
            todo.priority = newPriority;
        },
        toggleComplete() {
            todo.isCompleted = !todo.isCompleted;
        }
    };

    return todo;
};