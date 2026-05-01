import { createTodo } from './logic/todo.js';
import { createProject } from './logic/project.js';
import appController from './logic/appController.js';
import uiController from './uiController.js';
import { format } from 'date-fns';
import "./style.css";

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

let isDraggingFab = false;
let startX = 0;
let startY = 0;
let dragThreshold = 10;
let ghostNode = null;
let startRect = null;
let editingTaskId = null;

btnOpenModal.addEventListener('pointerdown', (e) => {
  if (e.button !== 0 && e.pointerType === 'mouse') return;
  
  isDraggingFab = false;
  startX = e.clientX;
  startY = e.clientY;
  startRect = btnOpenModal.getBoundingClientRect();
  e.preventDefault();

  const onPointerMove = (moveEvent) => {
    let currentX = moveEvent.clientX;
    let currentY = moveEvent.clientY;
    let diffX = Math.abs(currentX - startX);
    let diffY = Math.abs(currentY - startY);
    
    const cancelZone = document.getElementById('cancel-zone');

    if ((diffX > dragThreshold || diffY > dragThreshold) && !isDraggingFab) {
      isDraggingFab = true;
      
      // Create flashy ghost clone
      ghostNode = btnOpenModal.cloneNode(true);
      ghostNode.id = 'btn-add-task-ghost';
      ghostNode.classList.add('btn-ghost-drag');
      // Place it exactly over the original button initially
      ghostNode.style.left = startRect.left + 'px';
      ghostNode.style.top = startRect.top + 'px';
      ghostNode.style.bottom = 'auto';
      ghostNode.style.right = 'auto';
      document.body.appendChild(ghostNode);
      
      if (cancelZone) cancelZone.classList.add('active');
    }
    
    if (isDraggingFab && ghostNode) {
      let translateX = currentX - startX;
      let translateY = currentY - startY;
      
      // Check collision with bottom left cancel zone
      let distToCorner = Math.hypot(currentX, window.innerHeight - currentY);
      let isHoveringCancel = distToCorner < 150;
      
      if (isHoveringCancel) {
          if (cancelZone) cancelZone.classList.add('hovered');
          // Black hole effect: exponential shrink based on distance to corner
          let shrinkFactor = Math.pow(distToCorner / 150, 1.5); // 1.5 exponent for smooth suck-in effect
          let currentScale = Math.max(0.1, 1.15 * shrinkFactor);
          // Also reduce rotation as it gets sucked in
          let currentRotation = -5 * shrinkFactor;
          ghostNode.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale}) rotate(${currentRotation}deg)`;
      } else {
          if (cancelZone) cancelZone.classList.remove('hovered');
          ghostNode.style.transform = `translate(${translateX}px, ${translateY}px) scale(1.15) rotate(-5deg)`;
      }
    }
  };

  const onPointerUp = (upEvent) => {
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    
    const cancelZone = document.getElementById('cancel-zone');
    if (cancelZone) {
        cancelZone.classList.remove('active');
        cancelZone.classList.remove('hovered');
    }

    let isCanceled = false;
    if (isDraggingFab && upEvent) {
        let dropDist = Math.hypot(upEvent.clientX, window.innerHeight - upEvent.clientY);
        isCanceled = dropDist < 150;
    }
    
    if (ghostNode) {
      // Disappear animation
      ghostNode.style.transform = ghostNode.style.transform + ' scale(0)';
      ghostNode.style.opacity = '0';
      setTimeout(() => {
        if (ghostNode) ghostNode.remove();
        ghostNode = null;
      }, 200);
    }
    
    if (!isDraggingFab) {
      editingTaskId = null;
      myForm.reset();
      populateProjectSelect();
      preselectProject();
      taskModal.showModal();
    } else if (!isCanceled) {
      createInlineTaskInput();
    }
  };

  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', onPointerUp);
});

function createInlineTaskInput() {
  const appContainer = document.getElementById('app');

  const container = document.createElement('div');
  container.classList.add('inline-task-input-container');
  
  const input = document.createElement('input');
  input.type = 'text';
  input.classList.add('inline-task-input');
  input.placeholder = 'New Task...';
  
  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.classList.add('inline-cancel-btn');
  cancelBtn.innerHTML = '<i class="fas fa-times"></i>'; // FontAwesome close icon
  // fallback to "X" text if FontAwesome fails to load:
  // but we can just use the X HTML entity:
  cancelBtn.innerHTML = '&times;';
  cancelBtn.addEventListener('click', () => {
      container.remove();
  });
  
  container.appendChild(input);
  container.appendChild(cancelBtn);
  appContainer.prepend(container);
  
  input.focus();
  
  let isSaved = false;
  const saveAndClose = (forceRemoveEmpty = false) => {
    if (isSaved || !container.parentNode) return; 
    let text = input.value.trim();
    
    if (text) {
      isSaved = true;
      const newTask = createTodo(text, "", "", "low", "", []);
      let currentView = appController.getCurrentView();
      if (currentView === "today") {
         newTask.dueDate = format(new Date(), 'yyyy-MM-dd');
      }
      let inbox = appController.getProjects().find(p => p.name === "Inbox");
      if (inbox) inbox.addTodo(newTask);
      
      appController.save();
      renderCurrentView();
      
      if (container.parentNode) container.remove();
    } else if (forceRemoveEmpty) {
      if (container.parentNode) container.remove();
    }
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      saveAndClose(true);
    } else if (e.key === 'Escape') {
      container.remove();
    }
  });

  input.addEventListener('blur', () => {
    saveAndClose(false);
  });
}

function closeTaskModal() {
  taskModal.classList.add('closing');
  setTimeout(() => {
    taskModal.close();
    taskModal.classList.remove('closing');
  }, 280);
}

btnCancel.addEventListener('click', () => {
  closeTaskModal();
})

const myForm = document.getElementById('task-form');
myForm.addEventListener("submit", function (event) {
  event.preventDefault();
  let titleField = document.getElementById('tName').value;
  let dateField = document.getElementById('tDate').value;
  let prioritySelect = document.querySelector('input[name="task-priority"]:checked').value;

  if (editingTaskId) {
      appController.editTask(editingTaskId, titleField, dateField, prioritySelect);
      // Handle project change
      const selectedProjectId = document.getElementById('tProject').value;
      appController.moveTask(editingTaskId, selectedProjectId);
  } else {
      const newTask = createTodo(titleField, "", dateField, prioritySelect, "", []);
      const selectedProjectId = document.getElementById('tProject').value;
      const targetProject = appController.getProjects().find(p => p.id === selectedProjectId);
      const fallbackInbox = appController.getProjects().find(p => p.name === 'Inbox');
      (targetProject || fallbackInbox).addTodo(newTask);
  }
  
  appController.save();
  renderCurrentView();
  myForm.reset();
  editingTaskId = null;
  closeTaskModal();
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
    renderCurrentView();
  }

  if (e.target.classList.contains('toggle-checkbox')) {
    let taskId = e.target.dataset.id;
    appController.toggleTaskComplete(taskId);
    renderCurrentView();
  }
  
  let taskInfo = e.target.closest('.task-info');
  if (taskInfo) {
    let taskId = taskInfo.dataset.id;
    let task = appController.getAllTasks().find(t => t.id === taskId);
    if (task) {
        editingTaskId = taskId;
        document.getElementById('tName').value = task.title;
        document.getElementById('tDate').value = task.dueDate || "";
        let priorityRadio = document.querySelector(`input[name="task-priority"][value="${task.priority || 'low'}"]`);
        if (priorityRadio) priorityRadio.checked = true;
        taskModal.showModal();
    }
  }
});

const viewSelectorBtn = document.getElementById('view-selector-btn');
const viewDropdown = document.getElementById('view-dropdown');

// Toggle dropdown when clicking the title button
viewSelectorBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  viewSelectorBtn.classList.toggle('open');
  viewDropdown.classList.toggle('hidden');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!viewDropdown.contains(e.target) && !viewSelectorBtn.contains(e.target)) {
    viewSelectorBtn.classList.remove('open');
    viewDropdown.classList.add('hidden');
  }
});

// Handle navigation globally (sidebar and dropdown)
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

// ========== PROJECT MANAGEMENT ==========
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
    // If we were viewing this project, go back to inbox
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

// Handle project delete button click
document.getElementById('sidebar-projects-list').addEventListener('click', (e) => {
  const deleteBtn = e.target.closest('.project-delete-btn');
  if (deleteBtn) {
    e.stopPropagation();
    const projectId = deleteBtn.dataset.projectId;
    const project = appController.getProjects().find(p => p.id === projectId);
    if (!project) return;

    if (project.todos.length === 0) {
      // No tasks, delete immediately without dialog
      appController.deleteProject(projectId, true);
      if (appController.getCurrentView() === `project:${projectId}`) {
        appController.setCurrentView('inbox');
      }
      renderCurrentView();
      renderSidebarProjects();
    } else {
      // Show confirmation modal
      pendingDeleteProjectId = projectId;
      document.getElementById('confirm-body').textContent =
        `"${project.name}" has ${project.todos.length} task(s). What would you like to do?`;
      confirmModal.showModal();
    }
  }
});

// Add project inline input
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
      populateProjectSelect();
    }
    if (input.parentNode) input.remove();
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') input.remove();
  });
  input.addEventListener('blur', save);
});

function populateProjectSelect() {
  const select = document.getElementById('tProject');
  if (!select) return;
  const projects = appController.getProjects();
  select.innerHTML = projects.map(p =>
    `<option value="${p.id}">${p.name}</option>`
  ).join('');
}

// Pre-select the project in the modal based on current view
function preselectProject() {
  const select = document.getElementById('tProject');
  if (!select) return;
  const view = appController.getCurrentView();
  if (view.startsWith('project:')) {
    const projId = view.replace('project:', '');
    select.value = projId;
  } else {
    // default to inbox
    const inbox = appController.getProjects().find(p => p.name === 'Inbox');
    if (inbox) select.value = inbox.id;
  }
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
  uiController.renderTasks(appController.getTasksForCurrentView());
}

renderCurrentView();
populateProjectSelect();