import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Circle, Archive } from 'lucide-react';
import confetti from 'canvas-confetti';
import './TaskList.css';

export default function TaskList({ onTaskComplete }) {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');

    // Load tasks
    useEffect(() => {
        const saved = localStorage.getItem('deepwork_tasks');
        if (saved) {
            try {
                setTasks(JSON.parse(saved));
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    // Save tasks
    useEffect(() => {
        localStorage.setItem('deepwork_tasks', JSON.stringify(tasks));
    }, [tasks]);

    const addTask = (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        const task = {
            id: crypto.randomUUID(),
            text: newTask,
            completed: false,
            createdAt: new Date().toISOString()
        };

        setTasks(prev => [task, ...prev]);
        setNewTask('');
    };

    const toggleTask = (id) => {
        const taskToUpdate = tasks.find(t => t.id === id);
        if (!taskToUpdate) return;

        const willBeCompleted = !taskToUpdate.completed;

        // Update state purely
        setTasks(prev => prev.map(t => {
            if (t.id === id) {
                return { ...t, completed: willBeCompleted };
            }
            return t;
        }));

        // Trigger side effect ONLY if completing (and outside the setter)
        if (willBeCompleted && onTaskComplete) {
            // Confetti explosion!
            const rect = document.activeElement ? document.activeElement.getBoundingClientRect() : null;
            // Try to originate from the button click if possible, else default
            // Actually activeElement might likely be the button.

            confetti({
                particleCount: 80,
                spread: 60,
                origin: rect ? {
                    x: (rect.left + rect.width / 2) / window.innerWidth,
                    y: (rect.top + rect.height / 2) / window.innerHeight
                } : { y: 0.6 },
                colors: ['#7c3aed', '#2563eb', '#3b82f6', '#60a5fa'],
                disableForReducedMotion: true
            });

            onTaskComplete(taskToUpdate.text);
        }
    };

    const deleteTask = (id) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const clearCompleted = () => {
        setTasks(prev => prev.filter(t => !t.completed));
    };

    return (
        <div className="task-list-container">
            <div className="task-header">
                <h3>Mission Log</h3>
                {tasks.some(t => t.completed) && (
                    <button onClick={clearCompleted} className="clear-btn" title="Clear completed">
                        <Archive size={16} />
                    </button>
                )}
            </div>

            <form onSubmit={addTask} className="task-form">
                <input
                    type="text"
                    placeholder="Add a new objective..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    className="task-input"
                />
                <button type="submit" className="add-task-btn" disabled={!newTask.trim()}>
                    <Plus size={20} />
                </button>
            </form>

            <div className="tasks-scroll">
                {tasks.length === 0 ? (
                    <div className="empty-tasks">
                        <p>No active missions.</p>
                    </div>
                ) : (
                    <ul className="tasks-ul">
                        {tasks.map(task => (
                            <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                                <button
                                    className="check-btn"
                                    onClick={() => toggleTask(task.id)}
                                >
                                    {task.completed ? (
                                        <CheckCircle className="icon-checked" size={20} />
                                    ) : (
                                        <Circle className="icon-unchecked" size={20} />
                                    )}
                                </button>
                                <span className="task-text">{task.text}</span>
                                <button
                                    className="delete-btn"
                                    onClick={() => deleteTask(task.id)}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
