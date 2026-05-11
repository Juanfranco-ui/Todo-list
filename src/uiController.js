export default function renderTasks(tasksArray, currentView) {
    let content = document.getElementById('app');

    let inlineInputs = Array.from(content.querySelectorAll('.inline-task-input-container'));

    content.textContent = "";

    if (tasksArray.length === 0) {
        let emptyDay = document.createElement('div');
        emptyDay.classList.add('empty-state');
        if (currentView === "inbox") {
            emptyDay.textContent = "No tasks in inbox";
        } else if (currentView === "today") {
            emptyDay.textContent = "Nothing due today";
        } else if (currentView === "someday") {
            emptyDay.textContent = "No someday tasks";
        } else if (currentView === "logbook") {
            emptyDay.textContent = "No completed tasks yet";
        } else if (currentView === "upcoming") {
            emptyDay.textContent = "No upcoming tasks";
        } else if (currentView === "anytime") {
            emptyDay.textContent = "No pending tasks";
        } else if (currentView.startsWith("project:")) {
            emptyDay.textContent = "This project is empty";
        } else {
            emptyDay.textContent = "There's no tasks for today, get some rest!";
        }
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
            if (t.notes) {
                let noteSpan = document.createElement('span');
                noteSpan.textContent = t.notes;
                taskDiv.querySelector('.task-info').appendChild(noteSpan);
            }
            if (t.isCompleted) {
                spanTitle.classList.add('completed');
            }

            content.appendChild(taskDiv);
        });
    }

    inlineInputs.forEach(input => content.prepend(input));
}