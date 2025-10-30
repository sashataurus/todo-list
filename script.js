class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.currentSort = 'date';
        this.searchTerm = '';
        this.draggedItem = null;
        this.init();
    }

    init() {
        this.createAppStructure();
        this.renderTasks();
        this.setupEventListeners();
    }

    createAppStructure() {
        const app = document.getElementById('app');

        const title = this.createElement('h1', { class: 'app-title' }, 'To-Do List');
        
        // форма добавления задачи
        const addForm = this.createAddForm();
        
        // панель управления
        const controlsPanel = this.createControlsPanel();
        
        // список задач
        const tasksList = this.createElement('div', { class: 'tasks-list' });
        tasksList.id = 'tasksList';

        app.append(title, addForm, controlsPanel, tasksList);
    }

    // форма добавления задачи
    createAddForm() {
        const form = this.createElement('form', { class: 'add-task-form' });
        
        const textGroup = this.createElement('div', { class: 'form-group' });
        const textLabel = this.createElement('label', { for: 'taskText' }, 'Новая задача:');
        const textInput = this.createElement('input', {
            type: 'text',
            id: 'taskText',
            class: 'form-input',
            placeholder: 'Введите задачу...',
            required: true
        });

        const dateGroup = this.createElement('div', { class: 'form-group' });
        const dateLabel = this.createElement('label', { for: 'taskDate' }, 'Дата выполнения:');
        const dateInput = this.createElement('input', {
            type: 'date',
            id: 'taskDate',
            class: 'form-input',
            required: true
        });

        const addButton = this.createElement('button', {
            type: 'submit',
            class: 'add-button'
        }, 'Добавить задачу');

        dateInput.valueAsDate = new Date();

        textGroup.append(textLabel, textInput);
        dateGroup.append(dateLabel, dateInput);
        form.append(textGroup, dateGroup, addButton);

        return form;
    }

    // панель управления
    createControlsPanel() {
        const panel = this.createElement('div', { class: 'controls-panel' });

        // поиск
        const searchGroup = this.createElement('div', { class: 'control-group' });
        const searchItem = this.createElement('div', { class: 'control-item' });
        const searchInput = this.createElement('input', {
            type: 'text',
            id: 'searchInput',
            class: 'form-input',
            placeholder: 'Поиск задач...'
        });
        searchItem.append(searchInput);
        searchGroup.append(searchItem);

        const filterGroup = this.createElement('div', { class: 'control-group' });

        // фильтр
        const filterItem = this.createElement('div', { class: 'control-item' });
        const filterSelect = this.createElement('select', { id: 'filterSelect', class: 'form-input' });
        const filterOptions = [
            { value: 'all', text: 'Все задачи' },
            { value: 'active', text: 'Активные' },
            { value: 'completed', text: 'Выполненные' }
        ];
        
        filterOptions.forEach(option => {
            filterSelect.append(this.createElement('option', { value: option.value }, option.text));
        });
        filterItem.append(filterSelect);

        // сортировка
        const sortItem = this.createElement('div', { class: 'control-item' });
        const sortSelect = this.createElement('select', { id: 'sortSelect', class: 'form-input' });
        const sortOptions = [
            { value: 'date', text: 'По дате' },
            { value: 'text', text: 'По названию' }
        ];
        
        sortOptions.forEach(option => {
            sortSelect.append(this.createElement('option', { value: option.value }, option.text));
        });
        sortItem.append(sortSelect);

        filterGroup.append(filterItem, sortItem);
        panel.append(searchGroup, filterGroup);

        return panel;
    }

    // элементы задачи
    createTaskElement(task) {
        const taskElement = this.createElement('div', {
            class: `task-item ${task.completed ? 'completed' : ''}`,
            'data-task-id': task.id,
            draggable: true
        });

        const checkboxContainer = this.createElement('label', {
            class: 'task-checkbox-container'
        });

        const checkbox = this.createElement('input', {
            type: 'checkbox',
            class: 'task-checkbox',
            checked: task.completed
        });

        const customCheckbox = this.createElement('div', { class: 'custom-checkbox' });
        const checkmark = this.createElement('span', { class: 'checkmark' }, '✓');
        
        customCheckbox.append(checkmark);
        checkboxContainer.append(checkbox, customCheckbox);

        const content = this.createElement('div', { class: 'task-content' });
        const text = this.createElement('div', { class: 'task-text' }, task.text);
        const date = this.createElement('div', { class: 'task-date' }, this.formatDate(task.date));

        content.append(text, date);

        const actions = this.createElement('div', { class: 'task-actions' });
        const editButton = this.createElement('button', {
            class: 'action-button edit-button',
            title: 'Редактировать'
        });

        const editIcon = this.createElement('img', {
            src: 'images/карандаш.png',
            alt: 'Редактировать',
            class: 'action-icon'
        });
        editButton.appendChild(editIcon);

        const deleteButton = this.createElement('button', {
            class: 'action-button delete-button',
            title: 'Удалить'
        });

        const deleteIcon = this.createElement('img', {
            src: 'images/корзина.png', 
            alt: 'Удалить',
            class: 'action-icon'
        });
        deleteButton.appendChild(deleteIcon);

        actions.append(editButton, deleteButton);
        taskElement.append(checkboxContainer, content, actions);

        return taskElement;
    }

    // отображение списка задач
    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        
        while (tasksList.firstChild) {
            tasksList.removeChild(tasksList.firstChild);
        }

        let filteredTasks = this.filterTasks(this.tasks);
        filteredTasks = this.searchTasks(filteredTasks);
        filteredTasks = this.sortTasks(filteredTasks);

        if (filteredTasks.length === 0) {
            const emptyMessage = this.createElement('div', { 
                class: 'task-item'
            }, this.searchTerm ? 'Задачи не найдены' : 'Нет задач');
            
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.color = '#666';
            
            tasksList.append(emptyMessage);
            return;
        }

        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            tasksList.append(taskElement);
        });
    }

    // фильтрация задач
    filterTasks(tasks) {
        switch (this.currentFilter) {
            case 'active':
                return tasks.filter(task => !task.completed);
            case 'completed':
                return tasks.filter(task => task.completed);
            default:
                return tasks;
        }
    }

    // поиск задач
    searchTasks(tasks) {
        if (!this.searchTerm) return tasks;
        
        const searchLower = this.searchTerm.toLowerCase();
        return tasks.filter(task => 
            task.text.toLowerCase().includes(searchLower)
        );
    }

    // сортировка задач
    sortTasks(tasks) {
        return tasks.sort((a, b) => {
            if (this.currentSort === 'date') {
                return new Date(a.date) - new Date(b.date);
            } else {
                return a.text.localeCompare(b.text);
            }
        });
    }

    // обработчики событий
    setupEventListeners() {
        // добавление задачи
        document.querySelector('.add-task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // поиск
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchTerm = e.target.value.trim();
            this.renderTasks();
        });

        // фильтрация
        document.getElementById('filterSelect').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.renderTasks();
        });

        // сортировка
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderTasks();
        });

        // делегирование событий
        document.getElementById('tasksList').addEventListener('click', (e) => {
            const taskElement = e.target.closest('.task-item');
            if (!taskElement) return;

            const taskId = taskElement.dataset.taskId;

            // Находим на какую именно кнопку кликнули (даже если по картинке)
            const deleteButton = e.target.closest('.delete-button');
            const editButton = e.target.closest('.edit-button');

            if (e.target.classList.contains('task-checkbox') || 
                e.target.classList.contains('custom-checkbox') ||
                e.target.classList.contains('task-checkbox-container') ||
                e.target.classList.contains('checkmark')) {
                this.toggleTaskCompletion(taskId);
            } else if (deleteButton) {
                this.deleteTask(taskId);
            } else if (editButton) {
                this.editTask(taskId);
            }
        });

        // drag and drop
        this.setupDragAndDrop();
    }

    // drag and drop
    setupDragAndDrop() {
        const tasksList = document.getElementById('tasksList');
        
        tasksList.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('task-item')) {
                this.draggedItem = e.target;
                e.target.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            }
        });

        tasksList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(tasksList, e.clientY);
            const dragging = document.querySelector('.dragging');
            
            if (afterElement == null) {
                tasksList.appendChild(dragging);
            } else {
                tasksList.insertBefore(dragging, afterElement);
            }
        });

        tasksList.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('task-item')) {
                e.target.classList.remove('dragging');
                this.updateTaskOrder();
            }
        });
    }

    // между какими элементами drag and drop
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // обновление порядка задач после drag and drop
    updateTaskOrder() {
        const tasksList = document.getElementById('tasksList');
        const taskElements = tasksList.querySelectorAll('.task-item');
        const newOrder = [];

        taskElements.forEach(element => {
            const taskId = element.dataset.taskId;
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                newOrder.push(task);
            }
        });

        this.tasks = newOrder;
        this.saveTasks();
    }

    // добавление задачи
    addTask() {
        const textInput = document.getElementById('taskText');
        const dateInput = document.getElementById('taskDate');

        const task = {
            id: Date.now().toString(),
            text: textInput.value.trim(),
            date: dateInput.value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        if (task.text) {
            this.tasks.push(task);
            this.saveTasks();
            this.renderTasks();
            
            textInput.value = '';
            dateInput.valueAsDate = new Date();
            textInput.focus();
        }
    }

    // удаление задачи
    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.renderTasks();
    }

    // статус выполнения
    toggleTaskCompletion(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    // редактирование задачи
    editTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (!task) return;

        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        const contentElement = taskElement.querySelector('.task-content');
        
        while (contentElement.firstChild) {
            contentElement.removeChild(contentElement.firstChild);
        }

        const editTextInput = this.createElement('input', {
            type: 'text',
            class: 'form-input',
            value: task.text
        });

        const editDateInput = this.createElement('input', {
            type: 'date',
            class: 'form-input',
            value: task.date
        });

        const saveButton = this.createElement('button', {
            class: 'add-button',
            type: 'button'
        }, 'Сохранить');

        const cancelButton = this.createElement('button', {
            class: 'add-button',
            type: 'button'
        }, 'Отмена');

        saveButton.style.marginTop = '10px';
        cancelButton.style.marginTop = '5px';
        cancelButton.style.backgroundColor = '#6c757d';

        contentElement.append(editTextInput, editDateInput, saveButton, cancelButton);

        const saveHandler = () => {
            const newText = editTextInput.value.trim();
            const newDate = editDateInput.value;

            if (newText) {
                task.text = newText;
                task.date = newDate;
                this.saveTasks();
                this.renderTasks();
            }
        };

        const cancelHandler = () => {
            this.renderTasks();
        };

        saveButton.addEventListener('click', saveHandler);
        cancelButton.addEventListener('click', cancelHandler);

        editTextInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveHandler();
            }
        });
    }

    // сохранение в localStorage
    saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }

    // загрузка из localStorage
    loadTasks() {
        const saved = localStorage.getItem('todoTasks');
        return saved ? JSON.parse(saved) : [];
    }

    // создание элементов
    createElement(tag, attributes = {}, textContent = '') {
        const element = document.createElement(tag);
        
        Object.keys(attributes).forEach(key => {
            element.setAttribute(key, attributes[key]);
        });
        
        if (textContent) {
            element.textContent = textContent;
        }
        
        return element;
    }

    // форматирование даты
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});