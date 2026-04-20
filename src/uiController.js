const uiController = (function () {
    function renderTasks(tasksArray) {
        let content = document.getElementById('app');
        content.textContent = "";
        if (tasksArray.length === 0) {
            let emptyDay = document.createElement('div');
            emptyDay.textContent = "There's no tasks for today, get some rest!";
            content.appendChild(emptyDay);
            return;
        }
        tasksArray.forEach((t) => {
            let taskDiv = document.createElement('div');
            taskDiv.classList.add('task-item');
            taskDiv.innerHTML = `<input type="checkbox" class="toggle-checkbox" data-id="${t.id}" ${t.isCompleted ? "checked" : ""}>

            <span class="task-title"></span>
            <button class="delete-btn" data-id="${t.id}">Delete</button>`
            let spanTitle = taskDiv.querySelector('.task-title');
            spanTitle.textContent = t.title;

            content.appendChild(taskDiv);
        });
    }
    return {
        renderTasks
    };
})();

export default uiController;