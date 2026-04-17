export const createProject = (name) => {
    const project = {
        name,
        todos: [],
        addTodo(newTodo) {
            project.todos.push(newTodo);
            // project.todos.push(newTodo);
        },
        removeTodo(titleToRemove) {
            project.todos = project.todos.filter((task) => task.title !== titleToRemove);
        }
    };
    return project;
};