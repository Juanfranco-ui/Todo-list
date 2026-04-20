export const createProject = (name) => {
    const project = {
        name,
        todos: [],
        addTodo(newTodo) {
            project.todos.push(newTodo);
            // project.todos.push(newTodo);
        },
        removeTodo(idToRemove) {
            project.todos = project.todos.filter((task) => task.id !== idToRemove);
        }
    };
    return project;
};