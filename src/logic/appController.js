import { createProject } from './project.js';
import { format } from 'date-fns';

const appController = (function () {
    const projects = [];
    const inbox = createProject("Inbox");
    inbox.isDefault = true;
    projects.push(inbox);

    const getProjects = () => projects;
    const addProject = (project) => {

        if (!project) {
            return console.log("Null project");
        }

        const projectDup = projects.find((p) => p.name === project.name);

        if (projectDup) {
            return console.log("Name already exists, choose another")
        }

        projects.push(project);
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

    return {
        getProjects,
        addProject,
        getAllTasks,
        getTodayTasks
    };
})();

export default appController;