import { createTodo } from './logic/todo.js';
import { createProject } from './logic/project.js';
import appController from './logic/appController.js';
import uiController from './uiController.js';

const projectDiary = createProject("Calendar");
const task1 = createTodo(
  "Wake Up",
  "Take breakfast",
  "2026-4-15",
  "High",
  "Watch YT or something",
  []
);

const task2 = createTodo(
  "Bath Time",
  "Go to the Gym",
  "2026-4-11",
  "Middle",
  "",
  []
);

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
  uiController.renderTasks(appController.getTodayTasks());
  myForm.reset();
  taskModal.close();
});

projectDiary.addTodo(task1);
projectDiary.addTodo(task2);

appController.addProject(projectDiary);

uiController.renderTasks(appController.getTodayTasks());