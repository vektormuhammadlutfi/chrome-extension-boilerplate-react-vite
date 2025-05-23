import { Coordinates, CalculationMethod, Prayer, PrayerTimes } from 'adhan';
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

export const prayerTimes = {
  checkAndNotify: async () => {
    const coordinates = await getStoredCoordinates();
    if (!coordinates) return;

    const params = CalculationMethod.MuslimWorldLeague();
    const date = new Date();
    const prayerTimes = new PrayerTimes(coordinates, date, params);
    
    const prayers = [
      { name: 'Fajr', time: prayerTimes.fajr },
      { name: 'Dhuhr', time: prayerTimes.dhuhr },
      { name: 'Asr', time: prayerTimes.asr },
      { name: 'Maghrib', time: prayerTimes.maghrib },
      { name: 'Isha', time: prayerTimes.isha }
    ];

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

    // Store prayer times for today
    const storedTimes: StoredPrayerTimes = {
      date: format(date, 'yyyy-MM-dd'),
      times: {
        fajr: format(prayerTimes.fajr, 'HH:mm'),
        dhuhr: format(prayerTimes.dhuhr, 'HH:mm'),
        asr: format(prayerTimes.asr, 'HH:mm'),
        maghrib: format(prayerTimes.maghrib, 'HH:mm'),
        isha: format(prayerTimes.isha, 'HH:mm')
      }
    };
    
    await chrome.storage.local.set({ prayerTimes: storedTimes });
  }
};

export const taskReminders = {
  checkAndNotify: async () => {
    const { tasks = [] } = await chrome.storage.local.get('tasks');
    const now = new Date();
    
    tasks.forEach((task: Task) => {
      if (!task.completed && isTimeToNotify(new Date(task.dueDate), now)) {
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

async function getStoredCoordinates(): Promise<Coordinates | null> {
  const { coordinates } = await chrome.storage.local.get('coordinates');
  if (!coordinates) return null;
  return new Coordinates(coordinates.latitude, coordinates.longitude);
}