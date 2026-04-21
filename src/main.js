import { createTodo } from './logic/todo.js';
import { createProject } from './logic/project.js';
import appController from './logic/appController.js';
import uiController from './uiController.js';

let projectDiary = appController.getProjects().find(p => p.name === "Calendar");

if (!projectDiary) {
  projectDiary = createProject("Calendar");
  const task1 = createTodo(
    "Wake Up",
    "Take breakfast",
    "2026-04-17",
    "High",
    "Watch YT or something",
    []
  );

  const task2 = createTodo(
    "Bath Time",
    "Go to the Gym",
    "2026-04-18",
    "Middle",
    "",
    []
  );

  projectDiary.addTodo(task1);
  projectDiary.addTodo(task2);
  appController.addProject(projectDiary);
}

const taskModal = document.getElementById('task-modal');
const btnOpenModal = document.getElementById('btn-add-task');
const btnCancel = document.querySelector('button[type="button"]');

btnOpenModal.addEventListener('click', () => {
  taskModal.showModal();
});

btnCancel.addEventListener('click', () => {
  taskModal.close();
})

const myForm = document.getElementById('task-form');
myForm.addEventListener("submit", function (event) {
  event.preventDefault();
  let titleField = document.getElementById('tName').value;
  let dateField = document.getElementById('tDate').value;
  let prioritySelect = document.getElementById('tSelect').value;

  const newTask = createTodo(titleField, "", dateField, prioritySelect, "", []);
  projectDiary.addTodo(newTask);
  appController.save();
  uiController.renderTasks(appController.getTodayTasks());
  myForm.reset();
  taskModal.close();
});

const appContainer = document.getElementById('app');
appContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    let taskId = e.target.dataset.id;
    console.log("1. Botón borrar presionado. ID:", taskId);
    appController.deleteTask(taskId);
    console.log("2. Tareas restantes en memoria:",
      appController.getAllTasks());
    appController.save();
    uiController.renderTasks(appController.getTasksForCurrentView());
  }

  if (e.target.classList.contains('toggle-checkbox')) {
    let taskId = e.target.dataset.id;
    appController.toggleTaskComplete(taskId);
    uiController.renderTasks(appController.getTasksForCurrentView());
  }
});

const appSidebar = document.getElementById('sidebar');
appSidebar.addEventListener('click', (e) => {
  if (e.target.classList.contains('nav-btn')) {
    document.querySelectorAll('.nav-btn').forEach(button => { button.classList.remove('active'); });
    e.target.classList.add('active');
    let viewName = e.target.dataset.view;
    appController.setCurrentView(viewName);
    uiController.renderTasks(appController.getTasksForCurrentView());
  }
})

// El proyecto Calendar ya se inicia o vincula en la parte superior
uiController.renderTasks(appController.getTasksForCurrentView());