const uiController = (function () {
    function renderTasks(tasksArray) {
        let content = document.getElementById('app');
        
        // Preserve inline inputs
        let inlineInputs = Array.from(content.querySelectorAll('.inline-task-input-container'));
        
        content.textContent = "";
        
        if (tasksArray.length === 0) {
            let emptyDay = document.createElement('div');
            emptyDay.classList.add('empty-state');
            emptyDay.textContent = "There's no tasks for today, get some rest!";
            content.appendChild(emptyDay);
        } else {
            tasksArray.forEach((t) => {
                let taskDiv = document.createElement('div');
                taskDiv.classList.add('task-item');
                let dateHtml = t.dueDate ? `<span class="task-date">${t.dueDate}</span>` : "";
                let priorityHtml = t.priority ? `<span class="task-priority priority-${t.priority.toLowerCase()}">${t.priority}</span>` : "";

                taskDiv.innerHTML = `<input type="checkbox" class="toggle-checkbox" data-id="${t.id}" ${t.isCompleted ? "checked" : ""}>
                <div class="task-info" data-id="${t.id}">
                    <span class="task-title"></span>
                    ${(dateHtml || priorityHtml) ? `<div class="task-meta">${dateHtml} ${priorityHtml}</div>` : ""}
                </div>
                <button class="delete-btn" data-id="${t.id}">Delete</button>`
                let spanTitle = taskDiv.querySelector('.task-title');
                spanTitle.textContent = t.title;
                if (t.isCompleted) {
                    spanTitle.classList.add('completed');
                }

                content.appendChild(taskDiv);
            });
        }
        
        // Restore inline inputs
        inlineInputs.forEach(input => content.prepend(input));
    }
    return {
        renderTasks
    };
})();

export default uiController;