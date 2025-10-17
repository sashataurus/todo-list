// To-Do List Application
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

    // Создание структуры приложения
    createAppStructure() {
        const app = document.getElementById('app');

        // Заголовок
        const title = this.createElement('h1', { class: 'app-title' }, 'To-Do List');
        
        // Форма добавления задачи
        const addForm = this.createAddForm();
        
        // Панель управления
        const controlsPanel = this.createControlsPanel();
        
        // Список задач
        const tasksList = this.createElement('div', { class: 'tasks-list' });
        tasksList.id = 'tasksList';

        // Собираем структуру
        app.append(title, addForm, controlsPanel, tasksList);
    }

    // Создание формы добавления задачи
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

        // Устанавливаем сегодняшнюю дату по умолчанию
        dateInput.valueAsDate = new Date();

        textGroup.append(textLabel, textInput);
        dateGroup.append(dateLabel, dateInput);
        form.append(textGroup, dateGroup, addButton);

        return form;
    }

    // Создание панели управления
    createControlsPanel() {
        const panel = this.createElement('div', { class: 'controls-panel' });

        // Поиск
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

        // Фильтры и сортировка
        const filterGroup = this.createElement('div', { class: 'control-group' });

        // Фильтр по статусу
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

        // Сортировка
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

    // Создание элемента задачи
    createTaskElement(task) {
        const taskElement = this.createElement('div', {
            class: `task-item ${task.completed ? 'completed' : ''}`,
            'data-task-id': task.id,
            draggable: true
        });

        // Чекбокс выполнения
        const checkbox = this.createElement('input', {
            type: 'checkbox',
            class: 'task-checkbox',
            checked: task.completed
        });

        // Контент задачи
        const content = this.createElement('div', { class: 'task-content' });
        const text = this.createElement('div', { class: 'task-text' }, task.text);
        const date = this.createElement('div', { class: 'task-date' }, this.formatDate(task.date));

        content.append(text, date);

        // Кнопки управления
        const actions = this.createElement('div', { class: 'task-actions' });
        const editButton = this.createElement('button', {
            class: 'action-button edit-button',
            title: 'Редактировать'
        }, '✏️');
        const deleteButton = this.createElement('button', {
            class: 'action-button delete-button',
            title: 'Удалить'
        }, '🗑️');

        actions.append(editButton, deleteButton);
        taskElement.append(checkbox, content, actions);

        return taskElement;
    }

    // Отображение списка задач
    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        tasksList.innerHTML = '';

        let filteredTasks = this.filterTasks(this.tasks);
        filteredTasks = this.searchTasks(filteredTasks);
        filteredTasks = this.sortTasks(filteredTasks);

        if (filteredTasks.length === 0) {
            const emptyMessage = this.createElement('div', { 
                class: 'task-item',
                style: 'text-align: center; color: #666;'
            }, this.searchTerm ? 'Задачи не найдены' : 'Нет задач');
            tasksList.append(emptyMessage);
            return;
        }

        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            tasksList.append(taskElement);
        });
    }

    // Фильтрация задач по статусу
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

    // Поиск задач
    searchTasks(tasks) {
        if (!this.searchTerm) return tasks;
        
        const searchLower = this.searchTerm.toLowerCase();
        return tasks.filter(task => 
            task.text.toLowerCase().includes(searchLower)
        );
    }

    // Сортировка задач
    sortTasks(tasks) {
        return tasks.sort((a, b) => {
            if (this.currentSort === 'date') {
                return new Date(a.date) - new Date(b.date);
            } else {
                return a.text.localeCompare(b.text);
            }
        });
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Добавление задачи
        document.querySelector('.add-task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Поиск
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchTerm = e.target.value.trim();
            this.renderTasks();
        });

        // Фильтрация
        document.getElementById('filterSelect').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.renderTasks();
        });

        // Сортировка
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderTasks();
        });

        // Делегирование событий для списка задач
        document.getElementById('tasksList').addEventListener('click', (e) => {
            const taskElement = e.target.closest('.task-item');
            if (!taskElement) return;

            const taskId = taskElement.dataset.taskId;

            if (e.target.classList.contains('task-checkbox')) {
                this.toggleTaskCompletion(taskId);
            } else if (e.target.classList.contains('delete-button')) {
                this.deleteTask(taskId);
            } else if (e.target.classList.contains('edit-button')) {
                this.editTask(taskId);
            }
        });

        // Drag and drop
        this.setupDragAndDrop();
    }

    // Настройка Drag and Drop
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

    // Вспомогательная функция для Drag and Drop
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

    // Обновление порядка задач после Drag and Drop
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

    // Добавление задачи
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
            
            // Сброс формы
            textInput.value = '';
            dateInput.valueAsDate = new Date();
            textInput.focus();
        }
    }

    // Удаление задачи
    deleteTask(taskId) {
        if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.renderTasks();
        }
    }

    // Переключение статуса выполнения
    toggleTaskCompletion(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    // Редактирование задачи
    editTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (!task) return;

        const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
        const contentElement = taskElement.querySelector('.task-content');
        const textElement = contentElement.querySelector('.task-text');
        const dateElement = contentElement.querySelector('.task-date');

        // Создаем поля для редактирования
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
            type: 'button',
            style: 'margin-top: 10px;'
        }, 'Сохранить');

        const cancelButton = this.createElement('button', {
            class: 'add-button',
            type: 'button',
            style: 'margin-top: 5px; background-color: #6c757d;'
        }, 'Отмена');

        // Заменяем контент на поля редактирования
        contentElement.innerHTML = '';
        contentElement.append(editTextInput, editDateInput, saveButton, cancelButton);

        // Обработчики для кнопок
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

        // Сохранение по Enter
        editTextInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveHandler();
            }
        });
    }

    // Сохранение в localStorage
    saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }

    // Загрузка из localStorage
    loadTasks() {
        const saved = localStorage.getItem('todoTasks');
        return saved ? JSON.parse(saved) : [];
    }

    // Вспомогательная функция для создания элементов
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

    // Форматирование даты
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
}

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});