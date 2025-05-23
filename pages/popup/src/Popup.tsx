import '@src/Popup.css';
import { useState, useEffect } from 'react';
import { withErrorBoundary, withSuspense } from '@extension/shared';

interface Task {
  id: string;
  title: string;
  dueDate: Date;
  completed: boolean;
}

const Popup = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');

  const addTask = () => {
    if (!newTask || !newTaskDate) return;
    
    const task = {
      id: Date.now().toString(),
      title: newTask,
      dueDate: new Date(newTaskDate),
      completed: false
    };

    setTasks([...tasks, task]);
    setNewTask('');
    setNewTaskDate('');
  };

  return (
    <div className="w-[400px] min-h-[500px] bg-white dark:bg-gray-800 p-4">
      <nav className="flex gap-2 mb-4">
        <button 
          className={`px-4 py-2 rounded ${activeTab === 'tasks' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('tasks')}>
          Tasks
        </button>
        <button 
          className={`px-4 py-2 rounded ${activeTab === 'prayer' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('prayer')}>
          Prayer Times
        </button>
        <button 
          className={`px-4 py-2 rounded ${activeTab === 'dzikir' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('dzikir')}>
          Dzikir
        </button>
      </nav>

      {activeTab === 'tasks' && (
        <div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              className="flex-1 px-3 py-2 border rounded"
              placeholder="New task"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
            <input
              type="datetime-local"
              className="px-3 py-2 border rounded"
              value={newTaskDate}
              onChange={(e) => setNewTaskDate(e.target.value)}
            />
            <button 
              className="px-4 py-2 bg-green-500 text-white rounded"
              onClick={addTask}>
              Add
            </button>
          </div>

          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center gap-2 p-2 border rounded">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => {
                    setTasks(tasks.map(t => 
                      t.id === task.id ? {...t, completed: !t.completed} : t
                    ));
                  }}
                />
                <span className={task.completed ? 'line-through' : ''}>
                  {task.title}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(task.dueDate).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'prayer' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Prayer Times</h2>
          {/* Prayer times will be implemented */}
        </div>
      )}

      {activeTab === 'dzikir' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Daily Dzikir</h2>
          <div className="space-y-2">
            <a 
              href="https://rumaysho.com/2446-dzikir-pagi-petang.html"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-green-100 rounded hover:bg-green-200">
              Morning Dzikir
            </a>
            <a
              href="https://rumaysho.com/2446-dzikir-pagi-petang.html"
              target="_blank"
              rel="noopener noreferrer" 
              className="block p-4 bg-orange-100 rounded hover:bg-orange-200">
              Evening Dzikir
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default withErrorBoundary(
  withSuspense(Popup, <div>Loading...</div>),
  <div>Error occurred</div>
);