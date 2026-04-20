export const createTodo = (title, description, dueDate, priority, notes, checklist, id = crypto.randomUUID()) => {

    const todo = {
        title,
        description,
        dueDate,
        priority,
        notes,
        checklist,
        id,
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