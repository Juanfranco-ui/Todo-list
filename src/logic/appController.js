import { isAfter, startOfToday, compareAsc } from 'date-fns';
import { createProject } from './project.js';
import { createTodo } from './todo.js';
import { format } from 'date-fns';

const appController = (function () {
    const inbox = createProject("Inbox");
    inbox.isDefault = true;
    const projects = loadProjects() || [inbox];

    const getProjects = () => projects;
    const addProject = (project) => {

        if (!project) {
            return console.log("Null project") && null;
        }

        const projectDup = projects.find((p) => p.name === project.name);

        if (projectDup) {
            return console.log("Name already exists, choose another")
        }

        projects.push(project);
        saveProjects();
    }

    function saveProjects() {
        let arr = JSON.stringify(projects);
        localStorage.setItem('todoapp-projects', arr)
    }

    function loadProjects() {
        let arr = localStorage.getItem('todoapp-projects');

        if (arr === null) {
            return null;
        };

        let obj = JSON.parse(arr);
        let projectData = obj.map((data) => {
            // Preserve the saved project id so references remain stable
            let project = createProject(data.name, data.id || crypto.randomUUID());
            data.todos.forEach((todo) => {
                let newTask = createTodo(todo.title, todo.description, todo.dueDate, todo.priority, todo.notes, todo.checklist, todo.id);
                newTask.isCompleted = todo.isCompleted;
                newTask.createdAt = todo.createdAt;
                project.addTodo(newTask);
            })

            return project;
        });

        return projectData;
    }

    let currentView = localStorage.getItem('todoapp-view') || "today";

    function getCurrentView() {
        return currentView;
    }

    function getTasksForCurrentView() {
        switch (currentView) {
            case "inbox":
                return getInboxTasks();
            case "today":
                return getTodayTasks();
            case "logbook":
                return getAllTasks().filter(task => task.isCompleted);
            case "upcoming":
                return getUpComingTasks();
            case "anytime":
                return getAnytimeTasks();
            case "someday":
                return getSomedayTasks();
            default:
                if (currentView.startsWith('project:')) {
                    const projId = currentView.replace('project:', '');
                    const project = projects.find(p => p.id === projId);
                    return project ? project.todos : [];
                }
                return getTodayTasks();
        }
    }

    function getInboxTasks() {
        let inboxProject = projects.find(inbox => inbox.name === "Inbox");
        return inboxProject ? inboxProject.todos : [];
    }

    function getUpComingTasks() {
        return getAllTasks().filter(task => task.dueDate !== "" && isAfter(new Date(task.dueDate), startOfToday())).sort((a, b) => compareAsc(new Date(a.dueDate), new Date(b.dueDate)));
    }

    function getAnytimeTasks() {
        return getAllTasks().filter(task => task.dueDate === "" && task.isSomeday === false);
    }

    function getSomedayTasks() {
        return getAllTasks().filter(task => task.isSomeday === true);
    }

    function setCurrentView(newView) {
        currentView = newView;
        localStorage.setItem('todoapp-view', currentView);
    }

    function deleteTask(taskId) {
        projects.forEach((project) => {
            project.removeTodo(taskId);
        });
    }

    function getAllTasks() {
        return projects.reduce((acc, project) => {
            const projectTask = acc.concat(project.todos);
            return projectTask;
        }, []);
    }

    function getTodayTasks() {
        const todayString = format(new Date(), 'yyyy-MM-dd');
        return getAllTasks().filter(t => t.dueDate === todayString);
    }

    function toggleTaskComplete(taskId) {
        let findAll = getAllTasks();
        let taskFinder = findAll.find(task => task.id === taskId);

        if (taskFinder) {
            taskFinder.toggleComplete();
            saveProjects();
        }
    }

    function editTask(taskId, newTitle, newDate, newPriority) {
        let findAll = getAllTasks();
        let taskFinder = findAll.find(task => task.id === taskId);
        
        if (taskFinder) {
            taskFinder.title = newTitle;
            taskFinder.dueDate = newDate;
            taskFinder.priority = newPriority;
            saveProjects();
        }
    }

    function deleteProject(projectId, deleteAll = false) {
        const projectIndex = projects.findIndex(p => p.id === projectId);
        if (projectIndex === -1) return;

        const project = projects[projectIndex];

        if (!deleteAll && project.todos.length > 0) {
            // Move tasks to Inbox
            const inbox = projects.find(p => p.name === 'Inbox');
            if (inbox) {
                project.todos.forEach(task => inbox.addTodo(task));
            }
        }

        projects.splice(projectIndex, 1);
        saveProjects();
    }

    function moveTask(taskId, toProjectId) {
        const task = getAllTasks().find(t => t.id === taskId);
        if (!task) return;

        // Remove from current project
        projects.forEach(p => p.removeTodo(taskId));

        // Add to target project
        const target = projects.find(p => p.id === toProjectId);
        if (target) target.addTodo(task);

        saveProjects();
    }

    return {
        getProjects,
        addProject,
        deleteTask,
        deleteProject,
        moveTask,
        getAllTasks,
        getTodayTasks,
        getCurrentView,
        getTasksForCurrentView,
        getInboxTasks,
        getUpComingTasks,
        getAnytimeTasks,
        getSomedayTasks,
        setCurrentView,
        toggleTaskComplete,
        editTask,
        save: saveProjects
    };
})();

export default appController;