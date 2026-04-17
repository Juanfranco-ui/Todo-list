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
            taskDiv.textContent = t.title;

            content.appendChild(taskDiv);
        });
    }
    return {
        renderTasks
    };
})();

export default uiController;