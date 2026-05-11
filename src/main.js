import { createTodo } from './logic/todo.js';
import { createProject } from './logic/project.js';
import appController from './logic/appController.js';
import renderTasks from './uiController.js';
import { format } from 'date-fns';
import "./style.css";
import initTaskModal from './taskModal.js';
import initInlineTask from './inlineTask.js';

const inbox = appController.getProjects().find(p => p.name === 'Inbox');
if (inbox && inbox.todos.length === 0) {
  const welcome = createTodo("Welcome to your Todo List!", "", "", "low", "", []);
  inbox.addTodo(welcome);
  appController.save();
}

function renderCurrentView() {
  const currentView = appController.getCurrentView();
  const title = document.getElementById('h-title');

  if (currentView.startsWith('project:')) {
    const projId = currentView.replace('project:', '');
    const project = appController.getProjects().find(p => p.id === projId);
    if (title) title.textContent = project ? project.name : 'Project';
  } else if (title) {
    title.textContent = currentView.charAt(0).toUpperCase() + currentView.slice(1);
  }

  const dateStr = document.getElementById('h-date');
  if (dateStr) {
    dateStr.textContent = format(new Date(), 'EEEE, MMMM d');
  }

  document.querySelectorAll('.nav-btn').forEach(button => {
    button.classList.remove('active');
    if (button.dataset.view === currentView) {
      button.classList.add('active');
    }
  });

  renderSidebarProjects();
  renderTasks(appController.getTasksForCurrentView(), appController.getCurrentView());
}

const taskModalApi = initTaskModal({ appController, createTodo, renderCurrentView });
initInlineTask({ appController, createTodo, format, taskModalApi, renderCurrentView });

// ========== NAVEGACIÓN ==========
const viewSelectorBtn = document.getElementById('view-selector-btn');
const viewDropdown = document.getElementById('view-dropdown');

viewSelectorBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  viewSelectorBtn.classList.toggle('open');
  viewDropdown.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
  if (!viewDropdown.contains(e.target) && !viewSelectorBtn.contains(e.target)) {
    viewSelectorBtn.classList.remove('open');
    viewDropdown.classList.add('hidden');
  }
});

document.addEventListener('click', (e) => {
  let navBtn = e.target.closest('.nav-btn');
  if (navBtn && !e.target.classList.contains('project-delete-btn')) {
    let viewName = navBtn.dataset.view;
    if (viewName) {
      appController.setCurrentView(viewName);
      renderCurrentView();
      viewSelectorBtn.classList.remove('open');
      viewDropdown.classList.add('hidden');
    }
  }
});

// ========== ACCIONES SOBRE TAREAS (borrar, completar) ==========
const appContainer = document.getElementById('app');
appContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    let taskId = e.target.dataset.id;
    appController.deleteTask(taskId);
    appController.save();
    renderCurrentView();
  }

  if (e.target.classList.contains('toggle-checkbox')) {
    let taskId = e.target.dataset.id;
    appController.toggleTaskComplete(taskId);
    renderCurrentView();
  }
});

// ========== GESTIÓN DE PROYECTOS ==========
const confirmModal = document.getElementById('confirm-modal');
const confirmMoveBtn = document.getElementById('confirm-move-inbox');
const confirmDeleteBtn = document.getElementById('confirm-delete-all');
const confirmCancelBtn = document.getElementById('confirm-cancel');
let pendingDeleteProjectId = null;

function closeConfirmModal() {
  confirmModal.classList.add('closing');
  setTimeout(() => {
    confirmModal.close();
    confirmModal.classList.remove('closing');
    pendingDeleteProjectId = null;
  }, 200);
}

confirmCancelBtn.addEventListener('click', closeConfirmModal);

confirmMoveBtn.addEventListener('click', () => {
  if (pendingDeleteProjectId) {
    appController.deleteProject(pendingDeleteProjectId, false);
    if (appController.getCurrentView() === `project:${pendingDeleteProjectId}`) {
      appController.setCurrentView('inbox');
    }
    renderCurrentView();
    renderSidebarProjects();
    closeConfirmModal();
  }
});

confirmDeleteBtn.addEventListener('click', () => {
  if (pendingDeleteProjectId) {
    appController.deleteProject(pendingDeleteProjectId, true);
    if (appController.getCurrentView() === `project:${pendingDeleteProjectId}`) {
      appController.setCurrentView('inbox');
    }
    renderCurrentView();
    renderSidebarProjects();
    closeConfirmModal();
  }
});

function renderSidebarProjects() {
  const list = document.getElementById('sidebar-projects-list');
  if (!list) return;

  list.textContent = '';
  const projects = appController.getProjects().filter(p => p.name !== 'Inbox');

  projects.forEach(project => {
    const btn = document.createElement('button');
    btn.className = 'nav-btn project-nav-btn';
    btn.dataset.view = `project:${project.id}`;
    btn.innerHTML = `
      <span class="project-btn-name">&#128193; ${project.name}</span>
      <button class="project-delete-btn" data-project-id="${project.id}" title="Delete project">&times;</button>
    `;
    if (appController.getCurrentView() === `project:${project.id}`) {
      btn.classList.add('active');
    }
    list.appendChild(btn);
  });
}

document.getElementById('sidebar-projects-list').addEventListener('click', (e) => {
  const deleteBtn = e.target.closest('.project-delete-btn');
  if (deleteBtn) {
    e.stopPropagation();
    const projectId = deleteBtn.dataset.projectId;
    const project = appController.getProjects().find(p => p.id === projectId);
    if (!project) return;

    if (project.todos.length === 0) {
      appController.deleteProject(projectId, true);
      if (appController.getCurrentView() === `project:${projectId}`) {
        appController.setCurrentView('inbox');
      }
      renderCurrentView();
      renderSidebarProjects();
    } else {
      pendingDeleteProjectId = projectId;
      document.getElementById('confirm-body').textContent =
        `"${project.name}" has ${project.todos.length} task(s). What would you like to do?`;
      confirmModal.showModal();
    }
  }
});

const addProjectBtn = document.getElementById('sidebar-add-project-btn');
addProjectBtn.addEventListener('click', () => {
  const list = document.getElementById('sidebar-projects-list');
  if (document.querySelector('.sidebar-inline-input')) return;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'sidebar-inline-input';
  input.placeholder = 'Project name...';
  list.prepend(input);
  input.focus();

  const save = () => {
    const name = input.value.trim();
    if (name) {
      appController.addProject(createProject(name));
      renderSidebarProjects();
      taskModalApi.populateProjectSelect();
    }
    if (input.parentNode) input.remove();
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') input.remove();
  });
  input.addEventListener('blur', save);
});

renderCurrentView();
taskModalApi.populateProjectSelect();
