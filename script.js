/**
 * TodoForge AI - Modern Todo Application
 * A fully functional todo app with localStorage persistence
 * and dark/light theme support
 */

// ============================================
// DOM Elements
// ============================================
const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const clearBtn = document.getElementById('clearBtn');
const themeToggle = document.getElementById('themeToggle');
const totalTasksEl = document.getElementById('totalTasks');
const activeTasksEl = document.getElementById('activeTasks');
const completedTasksEl = document.getElementById('completedTasks');

// ============================================
// State Management
// ============================================
let todos = [];

// ============================================
// LocalStorage Functions
// ============================================

/**
 * Load todos from localStorage
 */
function loadTodos() {
    const stored = localStorage.getItem('todos');
    if (stored) {
        try {
            todos = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading todos:', e);
            todos = [];
        }
    }
}

/**
 * Save todos to localStorage
 */
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// ============================================
// Theme Management
// ============================================

/**
 * Initialize theme from localStorage or system preference
 */
function initTheme() {
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme === 'light' || (!storedTheme && !systemPrefersDark)) {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

/**
 * Toggle between dark and light theme
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// ============================================
// Task Management Functions
// ============================================

/**
 * Generate unique ID for tasks
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Add a new task
 * @param {string} text - Task text
 */
function addTask(text) {
    const task = {
        id: generateId(),
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    todos.unshift(task);
    saveTodos();
    renderTasks();
    updateStats();
}

/**
 * Delete a task by ID
 * @param {string} id - Task ID
 */
function deleteTask(id) {
    const taskEl = document.querySelector(`[data-id="${id}"]`);
    if (taskEl) {
        taskEl.classList.add('removing');
        
        // Wait for animation to complete
        setTimeout(() => {
            todos = todos.filter(task => task.id !== id);
            saveTodos();
            renderTasks();
            updateStats();
        }, 300);
    }
}

/**
 * Toggle task completion status
 * @param {string} id - Task ID
 */
function toggleTask(id) {
    todos = todos.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    
    saveTodos();
    renderTasks();
    updateStats();
}

/**
 * Clear all tasks
 */
function clearAllTasks() {
    const taskElements = document.querySelectorAll('.task-item');
    
    taskElements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('removing');
        }, index * 50);
    });
    
    setTimeout(() => {
        todos = [];
        saveTodos();
        renderTasks();
        updateStats();
    }, taskElements.length * 50 + 300);
}

// ============================================
// Rendering Functions
// ============================================

/**
 * Create a task element
 * @param {Object} task - Task object
 * @returns {HTMLElement} Task element
 */
function createTaskElement(task) {
    const taskEl = document.createElement('div');
    taskEl.className = `task-item${task.completed ? ' completed' : ''}`;
    taskEl.setAttribute('data-id', task.id);
    
    taskEl.innerHTML = `
        <input 
            type="checkbox" 
            class="task-checkbox" 
            ${task.completed ? 'checked' : ''}
            aria-label="Mark task as ${task.completed ? 'incomplete' : 'complete'}"
        >
        <span class="task-text">${escapeHtml(task.text)}</span>
        <button class="delete-btn" aria-label="Delete task">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
        </button>
    `;
    
    // Event listeners
    const checkbox = taskEl.querySelector('.task-checkbox');
    checkbox.addEventListener('change', () => toggleTask(task.id));
    
    const deleteBtn = taskEl.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    
    return taskEl;
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Render all tasks
 */
function renderTasks() {
    taskList.innerHTML = '';
    
    if (todos.length === 0) {
        emptyState.classList.add('show');
        taskList.style.display = 'none';
    } else {
        emptyState.classList.remove('show');
        taskList.style.display = 'flex';
        
        todos.forEach(task => {
            const taskEl = createTaskElement(task);
            taskList.appendChild(taskEl);
        });
    }
}

/**
 * Update statistics display
 */
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(task => task.completed).length;
    const active = total - completed;
    
    // Animate numbers
    animateNumber(totalTasksEl, total);
    animateNumber(activeTasksEl, active);
    animateNumber(completedTasksEl, completed);
}

/**
 * Animate number change
 * @param {HTMLElement} element - Element to update
 * @param {number} target - Target number
 */
function animateNumber(element, target) {
    const current = parseInt(element.textContent) || 0;
    const increment = target > current ? 1 : -1;
    
    if (current !== target) {
        element.textContent = current + increment;
        setTimeout(() => animateNumber(element, target), 50);
    } else {
        element.textContent = target;
    }
}

// ============================================
// Event Listeners
// ============================================

/**
 * Handle form submission
 */
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const text = todoInput.value.trim();
    
    if (text) {
        addTask(text);
        todoInput.value = '';
        todoInput.focus();
    } else {
        // Shake animation for invalid input
        todoInput.classList.add('shake');
        setTimeout(() => todoInput.classList.remove('shake'), 300);
    }
});

/**
 * Handle clear all button click
 */
clearBtn.addEventListener('click', () => {
    if (todos.length > 0) {
        if (confirm('Are you sure you want to clear all tasks?')) {
            clearAllTasks();
        }
    }
});

/**
 * Handle theme toggle click
 */
themeToggle.addEventListener('click', toggleTheme);

/**
 * Handle keyboard shortcuts
 */
document.addEventListener('keydown', (e) => {
    // Focus input on '/' key
    if (e.key === '/' && document.activeElement !== todoInput) {
        e.preventDefault();
        todoInput.focus();
    }
    
    // Escape to blur input
    if (e.key === 'Escape' && document.activeElement === todoInput) {
        todoInput.blur();
    }
});

// ============================================
// Initialization
// ============================================

/**
 * Create sparkles background animation
 */
function createSparkles() {
    const container = document.getElementById('sparklesContainer');
    const sparkleCount = 50;
    
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.animationDelay = Math.random() * 3 + 's';
        sparkle.style.animationDuration = (Math.random() * 2 + 2) + 's';
        
        const size = Math.random() * 3 + 2;
        sparkle.style.width = size + 'px';
        sparkle.style.height = size + 'px';
        
        container.appendChild(sparkle);
    }
}

/**
 * Initialize the application
 */
function init() {
    initTheme();
    createSparkles();
    loadTodos();
    renderTasks();
    updateStats();
    
    // Add shake animation CSS
    const style = document.createElement('style');
    style.textContent = `
        .shake {
            animation: shake 0.3s ease-in-out;
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-8px); }
            75% { transform: translateX(8px); }
        }
    `;
    document.head.appendChild(style);
}

// Start the app
init();
