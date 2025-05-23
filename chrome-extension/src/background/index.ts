import 'webextension-polyfill';
import { prayerTimes, taskReminders, breakReminders, dzikirReminders } from './reminders';

// Initialize reminders when extension loads
chrome.runtime.onInstalled.addListener(() => {
  console.log('Reminder extension installed');
  setupAlarms();
});

// Setup all alarms
function setupAlarms() {
  // Prayer times alarm
  chrome.alarms.create('prayerCheck', { periodInMinutes: 1 });
  
  // Break reminder alarm (every 30 minutes)
  chrome.alarms.create('breakReminder', { periodInMinutes: 30 });
  
  // Check tasks every minute
  chrome.alarms.create('taskCheck', { periodInMinutes: 1 });
  
  // Check dzikir times
  chrome.alarms.create('dzikirCheck', { periodInMinutes: 1 });
}

// Listen for alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  switch (alarm.name) {
    case 'prayerCheck':
      prayerTimes.checkAndNotify();
      break;
    case 'breakReminder':
      breakReminders.notify();
      break;
    case 'taskCheck':
      taskReminders.checkAndNotify();
      break;
    case 'dzikirCheck':
      dzikirReminders.checkAndNotify();
      break;
  }
});