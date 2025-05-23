interface Task {
  id: string;
  title: string;
  dueDate: Date;
  completed: boolean;
}

interface PrayerTime {
  name: string;
  time: Date;
}

export const prayerTimes = {
  checkAndNotify: async () => {
    const prayers = await getPrayerTimes();
    const now = new Date();
    
    prayers.forEach(prayer => {
      if (isTimeToNotify(prayer.time, now)) {
        chrome.notifications.create(`prayer-${prayer.name}`, {
          type: 'basic',
          iconUrl: 'icon-128.png',
          title: 'Prayer Time',
          message: `It's time for ${prayer.name} prayer`,
          priority: 2
        });
      }
    });
  }
};

export const taskReminders = {
  checkAndNotify: async () => {
    const tasks = await getTasks();
    const now = new Date();
    
    tasks.forEach(task => {
      if (!task.completed && isTimeToNotify(task.dueDate, now)) {
        chrome.notifications.create(`task-${task.id}`, {
          type: 'basic',
          iconUrl: 'icon-128.png',
          title: 'Task Reminder',
          message: task.title,
          priority: 2
        });
      }
    });
  }
};

export const breakReminders = {
  notify: () => {
    chrome.notifications.create('break-reminder', {
      type: 'basic',
      iconUrl: 'icon-128.png',
      title: 'Break Time',
      message: 'Time to take a short break! Stand up and stretch.',
      priority: 1
    });
  }
};

export const dzikirReminders = {
  checkAndNotify: () => {
    const now = new Date();
    const hour = now.getHours();

    // Morning dzikir (after Fajr)
    if (hour === 5) {
      chrome.notifications.create('dzikir-morning', {
        type: 'basic',
        iconUrl: 'icon-128.png',
        title: 'Morning Dzikir',
        message: 'Time for morning dzikir',
        priority: 2
      });
    }
    
    // Evening dzikir (after Asr)
    if (hour === 16) {
      chrome.notifications.create('dzikir-evening', {
        type: 'basic',
        iconUrl: 'icon-128.png',
        title: 'Evening Dzikir',
        message: 'Time for evening dzikir',
        priority: 2
      });
    }
  }
};

function isTimeToNotify(targetTime: Date, currentTime: Date): boolean {
  return Math.abs(targetTime.getTime() - currentTime.getTime()) < 60000; // Within 1 minute
}

async function getPrayerTimes(): Promise<PrayerTime[]> {
  // TODO: Implement prayer time calculation based on location
  return [];
}

async function getTasks(): Promise<Task[]> {
  // TODO: Get tasks from storage
  return [];
}