export default function initTaskModal({ appController, createTodo, renderCurrentView }) {
    const taskModal = document.getElementById('task-modal');
    const btnCancel = document.querySelector('#task-form button[type="button"]');
    const myForm = document.getElementById('task-form');

    let editingTaskId = null;
    let originalProjectId = null;

    function closeTaskModal() {
        taskModal.classList.add('closing');
        setTimeout(() => {
            taskModal.close();
            taskModal.classList.remove('closing');
        }, 280);
    }

    btnCancel.addEventListener('click', closeTaskModal);

    function populateProjectSelect() {
        const select = document.getElementById('tProject');
        if (!select) return;
        const projects = appController.getProjects();
        select.innerHTML = projects.map(p =>
            `<option value="${p.id}">${p.name}</option>`
        ).join('');
    }

    function preselectProject() {
        const select = document.getElementById('tProject');
        if (!select) return;
        const view = appController.getCurrentView();
        if (view.startsWith('project:')) {
            const projId = view.replace('project:', '');
            select.value = projId;
        } else {
            const inbox = appController.getProjects().find(p => p.name === 'Inbox');
            if (inbox) select.value = inbox.id;
        }
    }

    function openNewTaskModal() {
        editingTaskId = null;
        myForm.reset();
        populateProjectSelect();
        preselectProject();
        taskModal.showModal();
    }

    document.getElementById('app').addEventListener('click', (e) => {
        let taskInfo = e.target.closest('.task-info');
        if (!taskInfo) return;

        let taskId = taskInfo.dataset.id;
        let task = appController.getAllTasks().find(t => t.id === taskId);
        originalProjectId = appController.getProjects().find(p => p.todos.some(t => t.id === taskId)).id;

        if (task) {
            editingTaskId = taskId;
            document.getElementById('tName').value = task.title;
            document.getElementById('tDate').value = task.dueDate || "";
            let priorityRadio = document.querySelector(`input[name="task-priority"][value="${task.priority || 'low'}"]`);
            document.getElementById('tSomeday').checked = task.isSomeday;
            document.getElementById('tags-input').value = task.notes || "";
            if (priorityRadio) priorityRadio.checked = true;
            populateProjectSelect();
            document.getElementById('tProject').value = originalProjectId;
            taskModal.showModal();
        }
    });

    myForm.addEventListener("submit", function (event) {
        event.preventDefault();
        let titleField = document.getElementById('tName').value;
        let dateField = document.getElementById('tDate').value;
        let prioritySelect = document.querySelector('input[name="task-priority"]:checked').value;

        if (editingTaskId) {
            appController.editTask(editingTaskId, titleField, dateField, prioritySelect, document.getElementById('tags-input').value);
            const selectedProjectId = document.getElementById('tProject').value;
            if (selectedProjectId !== originalProjectId) {
                appController.moveTask(editingTaskId, selectedProjectId);
            }
        } else {
            const newTask = createTodo(titleField, "", dateField, prioritySelect, document.getElementById('tags-input').value, []);
            newTask.isSomeday = document.getElementById('tSomeday').checked;
            const selectedProjectId = document.getElementById('tProject').value;
            const targetProject = appController.getProjects().find(p => p.id === selectedProjectId);
            const fallbackInbox = appController.getProjects().find(p => p.name === 'Inbox');
            (targetProject || fallbackInbox).addTodo(newTask);
        }
        let task = appController.getAllTasks().find(t => t.id === editingTaskId);
        if (task) task.isSomeday = document.getElementById('tSomeday').checked;

        appController.save();
        renderCurrentView();
        myForm.reset();
        editingTaskId = null;
        closeTaskModal();
    });

    return {
        openNewTaskModal,
        populateProjectSelect,
    };
}
