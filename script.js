// Task management functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load tasks from localStorage
    let tasks = JSON.parse(localStorage.getItem('studyTasks')) || [];
    
    // DOM elements
    const taskForm = document.getElementById('task-form');
    const taskTitle = document.getElementById('task-title');
    const taskDescription = document.getElementById('task-description');
    const taskDueDate = document.getElementById('task-due-date');
    const taskPriority = document.getElementById('task-priority');
    const allTasksList = document.getElementById('all-tasks');
    const recentTasksList = document.getElementById('recent-tasks');
    const timeline = document.getElementById('timeline');
    const totalTasksEl = document.getElementById('total-tasks');
    const completedTasksEl = document.getElementById('completed-tasks');
    const progressPercentEl = document.getElementById('progress-percent');
    const overallProgressEl = document.getElementById('overall-progress');
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    taskDueDate.min = today;
    
    // Add task event
    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newTask = {
            id: Date.now(),
            title: taskTitle.value,
            description: taskDescription.value,
            dueDate: taskDueDate.value,
            priority: taskPriority.value,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        taskForm.reset();
        
        // Show success message
        alert('Task added successfully!');
    });
    
    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('studyTasks', JSON.stringify(tasks));
    }
    
    // Render all tasks
    function renderTasks() {
        // Clear lists
        allTasksList.innerHTML = '';
        recentTasksList.innerHTML = '';
        timeline.innerHTML = '';
        
        // Sort tasks by due date
        tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        
        // Filter completed tasks
        const completedTasks = tasks.filter(task => task.completed);
        const pendingTasks = tasks.filter(task => !task.completed);
        
        // Update stats
        totalTasksEl.textContent = tasks.length;
        completedTasksEl.textContent = completedTasks.length;
        
        const progressPercent = tasks.length > 0 ? 
            Math.round((completedTasks.length / tasks.length) * 100) : 0;
        progressPercentEl.textContent = `${progressPercent}%`;
        overallProgressEl.style.width = `${progressPercent}%`;
        
        // Render all tasks
        if (tasks.length === 0) {
            allTasksList.innerHTML = `
                <div class="empty-state">
                    <i>📚</i>
                    <p>No tasks yet. Add your first study task!</p>
                </div>
            `;
        } else {
            tasks.forEach(task => {
                const taskItem = createTaskElement(task);
                allTasksList.appendChild(taskItem);
            });
        }
        
        // Render recent tasks (last 3)
        const recentTasks = tasks.slice(-3).reverse();
        if (recentTasks.length === 0) {
            recentTasksList.innerHTML = `
                <div class="empty-state">
                    <p>No recent tasks</p>
                </div>
            `;
        } else {
            recentTasks.forEach(task => {
                const taskItem = createTaskElement(task);
                recentTasksList.appendChild(taskItem);
            });
        }
        
        // Render timeline
        if (pendingTasks.length === 0) {
            timeline.innerHTML = `
                <div class="empty-state">
                    <i>📅</i>
                    <p>No upcoming tasks. Add tasks to see them on the timeline!</p>
                </div>
            `;
        } else {
            // Group tasks by date
            const tasksByDate = {};
            pendingTasks.forEach(task => {
                if (!tasksByDate[task.dueDate]) {
                    tasksByDate[task.dueDate] = [];
                }
                tasksByDate[task.dueDate].push(task);
            });
            
            // Create timeline items
            Object.keys(tasksByDate).sort().forEach(date => {
                const dateTasks = tasksByDate[date];
                const dateObj = new Date(date);
                const day = dateObj.getDate();
                const month = dateObj.toLocaleString('default', { month: 'short' });
                
                const timelineItem = document.createElement('div');
                timelineItem.className = 'timeline-item';
                
                let tasksHTML = '';
                dateTasks.forEach(task => {
                    tasksHTML += `
                        <div class="task-item ${task.priority}">
                            <div class="task-info">
                                <h3>${task.title}</h3>
                                <p class="task-meta">${task.priority} priority</p>
                            </div>
                            <div class="task-actions">
                                <button class="btn btn-success complete-btn" data-id="${task.id}">✓</button>
                                <button class="btn btn-danger delete-btn" data-id="${task.id}">✕</button>
                            </div>
                        </div>
                    `;
                });
                
                timelineItem.innerHTML = `
                    <div class="timeline-date">${day}<br>${month}</div>
                    <div class="timeline-content">
                        ${tasksHTML}
                    </div>
                `;
                
                timeline.appendChild(timelineItem);
            });
        }
        
        // Add event listeners to buttons
        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const taskId = parseInt(this.getAttribute('data-id'));
                completeTask(taskId);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const taskId = parseInt(this.getAttribute('data-id'));
                deleteTask(taskId);
            });
        });
    }
    
    // Create task element
    function createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.priority}`;
        
        const dueDate = new Date(task.dueDate);
        const formattedDate = dueDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        li.innerHTML = `
            <div class="task-info">
                <h3>${task.title} ${task.completed ? '<span style="color: #4caf50;">(Completed)</span>' : ''}</h3>
                <p>${task.description}</p>
                <p class="task-meta">Due: ${formattedDate} | Priority: ${task.priority}</p>
            </div>
            <div class="task-actions">
                ${!task.completed ? 
                    `<button class="btn btn-success complete-btn" data-id="${task.id}">Complete</button>` : 
                    ''}
                <button class="btn btn-danger delete-btn" data-id="${task.id}">Delete</button>
            </div>
        `;
        
        return li;
    }
    
    // Complete task
    function completeTask(taskId) {
        tasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, completed: true };
            }
            return task;
        });
        
        saveTasks();
        renderTasks();
    }
    
    // Delete task
    function deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(task => task.id !== taskId);
            saveTasks();
            renderTasks();
        }
    }
    
    // Initial render
    renderTasks();
});