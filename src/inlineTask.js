export default function initInlineTask({ appController, createTodo, format, taskModalApi, renderCurrentView }) {
  const btnOpenModal = document.getElementById('btn-add-task');

  let isDraggingFab = false;
  let startX = 0;
  let startY = 0;
  let dragThreshold = 10;
  let ghostNode = null;
  let startRect = null;

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

        ghostNode = btnOpenModal.cloneNode(true);
        ghostNode.id = 'btn-add-task-ghost';
        ghostNode.classList.add('btn-ghost-drag');
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

        let distToCorner = Math.hypot(currentX, window.innerHeight - currentY);
        let isHoveringCancel = distToCorner < 150;

        if (isHoveringCancel) {
          if (cancelZone) cancelZone.classList.add('hovered');
          let shrinkFactor = Math.pow(distToCorner / 150, 1.5);
          let currentScale = Math.max(0.1, 1.15 * shrinkFactor);
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
        ghostNode.style.transform = ghostNode.style.transform + ' scale(0)';
        ghostNode.style.opacity = '0';
        setTimeout(() => {
          if (ghostNode) ghostNode.remove();
          ghostNode = null;
        }, 200);
      }

      if (!isDraggingFab) {
        taskModalApi.openNewTaskModal();
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

        if (currentView.startsWith("project:")) {
          let projId = currentView.replace('project:', '');
          let project = appController.getProjects().find(p => p.id === projId);
          if (project) project.addTodo(newTask);
        } else if (currentView === 'someday') {
          newTask.isSomeday = true;
          if (inbox) inbox.addTodo(newTask);
        } else {
          if (inbox) {
            inbox.addTodo(newTask);
          }
        }

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
}
