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
            let project = createProject(data.name);
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
                return getAllTasks();
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
                return getTodayTasks();
        }
    }

    function getInboxTasks() {
        let inboxProject = projects.find(inbox => inbox.name === "Inbox");
        return inboxProject ? inboxProject.todos : [];
    }

    function getUpComingTasks() {
        return getAllTasks().filter(task => task.dueDate !== "" && isAfter(new Date(task.dueDate), startOfToday()).sort((a, b) => compareAsc(new Date(a.dueDate), new Date(b.dueDate))));
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

    return {
        getProjects,
        addProject,
        deleteTask,
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
        save: saveProjects
    };
})();

export default appController;