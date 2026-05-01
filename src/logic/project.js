export const createProject = (name, id = crypto.randomUUID()) => {
    const project = {
        name,
        id,
        todos: [],
        addTodo(newTodo) {
            project.todos.push(newTodo);
        },
        removeTodo(idToRemove) {
            project.todos = project.todos.filter((task) => task.id !== idToRemove);
        }
    };
    return project;
};