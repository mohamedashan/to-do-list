const STORAGE_KEY = 'simple-todo-list-tasks';

const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');
const taskList = document.querySelector('#task-list');
const emptyState = document.querySelector('#empty-state');
const taskCount = document.querySelector('#task-count');
const clearCompletedButton = document.querySelector('#clear-completed');
const filterButtons = document.querySelectorAll('.filter-btn');

let tasks = loadTasks();
let currentFilter = 'all';

function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getVisibleTasks() {
  if (currentFilter === 'active') return tasks.filter((task) => !task.completed);
  if (currentFilter === 'completed') return tasks.filter((task) => task.completed);
  return tasks;
}

function renderTasks() {
  const visibleTasks = getVisibleTasks();
  taskList.innerHTML = '';
  emptyState.hidden = visibleTasks.length > 0;

  visibleTasks.forEach((task) => {
    const item = document.createElement('li');
    item.className = `list-group-item task-item${task.completed ? ' completed' : ''}`;
    item.innerHTML = `
      <input class="task-check" type="checkbox" aria-label="Mark task as complete" ${task.completed ? 'checked' : ''}>
      <span class="task-text">${escapeHtml(task.text)}</span>
      <button class="btn btn-sm delete-btn delete-task" type="button" aria-label="Delete task">&times;</button>
    `;

    item.querySelector('.task-check').addEventListener('change', () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    });

    item.querySelector('.delete-task').addEventListener('click', () => {
      tasks = tasks.filter((savedTask) => savedTask.id !== task.id);
      saveTasks();
      renderTasks();
    });

    taskList.appendChild(item);
  });

  const remaining = tasks.filter((task) => !task.completed).length;
  taskCount.textContent = `${remaining} ${remaining === 1 ? 'task' : 'tasks'} left`;
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.unshift({ id: Date.now(), text, completed: false });
  saveTasks();
  taskForm.reset();
  taskInput.focus();
  renderTasks();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => filterButton.classList.toggle('active', filterButton === button));
    renderTasks();
  });
});

clearCompletedButton.addEventListener('click', () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

renderTasks();


// Press "/" from anywhere to quickly focus the task input.
document.addEventListener('keydown', (event) => {
  const tagName = document.activeElement?.tagName.toLowerCase();
  if (event.key === '/' && tagName !== 'input' && tagName !== 'textarea') {
    event.preventDefault();
    taskInput.focus();
  }
});
