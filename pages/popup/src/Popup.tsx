import '@src/Popup.css';
import { useState, useEffect } from 'react';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  dueDate: Date;
  completed: boolean;
}

interface StoredPrayerTimes {
  date: string;
  times: Record<string, string>;
}

const Popup = () => {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [prayerTimes, setPrayerTimes] = useState<StoredPrayerTimes | null>(null);
  const [coordinates, setCoordinates] = useState<{latitude: number; longitude: number} | null>(null);

  useEffect(() => {
    loadTasks();
    loadPrayerTimes();
    
    // Get user's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setCoordinates(coords);
        chrome.storage.local.set({ coordinates: coords });
      },
      (error) => console.error('Error getting location:', error)
    );
  }, []);

  const loadTasks = async () => {
    const { tasks = [] } = await chrome.storage.local.get('tasks');
    setTasks(tasks);
  };

  const loadPrayerTimes = async () => {
    const { prayerTimes } = await chrome.storage.local.get('prayerTimes');
    setPrayerTimes(prayerTimes);
  };

  const addTask = async () => {
    if (!newTask || !newTaskDate) return;
    
    const task = {
      id: Date.now().toString(),
      title: newTask,
      dueDate: new Date(newTaskDate),
      completed: false
    };

    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);
    await chrome.storage.local.set({ tasks: updatedTasks });
    setNewTask('');
    setNewTaskDate('');
  };

  const toggleTask = async (taskId: string) => {
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? {...t, completed: !t.completed} : t
    );
    setTasks(updatedTasks);
    await chrome.storage.local.set({ tasks: updatedTasks });
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
              className="flex-1 px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
              placeholder="New task"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
            <input
              type="datetime-local"
              className="px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
              value={newTaskDate}
              onChange={(e) => setNewTaskDate(e.target.value)}
            />
            <button 
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={addTask}>
              Add
            </button>
          </div>

          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center gap-2 p-2 border rounded dark:border-gray-600">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="w-4 h-4"
                />
                <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'dark:text-white'}`}>
                  {task.title}
                </span>
                <span className="text-sm text-gray-500">
                  {format(new Date(task.dueDate), 'MMM d, h:mm a')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'prayer' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold dark:text-white">Prayer Times</h2>
          {coordinates ? (
            <div className="space-y-2">
              {prayerTimes && Object.entries(prayerTimes.times).map(([prayer, time]) => (
                <div key={prayer} className="flex justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded">
                  <span className="capitalize dark:text-white">{prayer}</span>
                  <span className="dark:text-gray-300">{time}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              Please enable location access to see prayer times
            </div>
          )}
        </div>
      )}

      {activeTab === 'dzikir' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold dark:text-white">Daily Dzikir</h2>
          <div className="space-y-2">
            <a 
              href="https://rumaysho.com/2446-dzikir-pagi-petang.html"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-green-100 dark:bg-green-900 dark:text-white rounded hover:bg-green-200 dark:hover:bg-green-800">
              Morning Dzikir
            </a>
            <a
              href="https://rumaysho.com/2446-dzikir-pagi-petang.html"
              target="_blank"
              rel="noopener noreferrer" 
              className="block p-4 bg-orange-100 dark:bg-orange-900 dark:text-white rounded hover:bg-orange-200 dark:hover:bg-orange-800">
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