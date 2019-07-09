/** @module notifications */

// Imports
import ripplet from 'ripplet.js';
import { oneSpace } from './stringUtilities';


// Variables
const area = document.getElementById('notifications-area');


// Functions
/**
 * Play light.mp3 sound
 *
 */
const playNotificationSound = () => {
  const audio = new Audio();

  audio.src = 'light.mp3';
  audio.autoplay = true;
};

/**
 * Clear notification area
 *
 */
const clear = () => {
  while (area.children.length > 0) {
    area.removeChild(area.firstChild);
  }
};

/**
 * Open browser window if collapsed
 *
 */
const focusWindow = () => window.focus();

/**
 * Make notification element
 *
 * @param {string} title - title of notification
 * @param {Object} options - notification settings
 */
const createNotification = (title, options) => {
  const notification = new Notification(title, options);

  notification.onclick = focusWindow;
  return notification;
};

/**
 * Return taken title and body and make default options object
 *
 * @param {string} title - title of notification
 * @param {string} body - notification body
 */
const makeNotificationOptions = (title, body) => ({
  title,
  body,
  dir: 'ltr',
  lang: 'ru',
  icon: 'img/favicons/apple-touch-icon-72x72-precomposed.png',
});

/**
 * Send ready notification
 *
 * @param {string} title - title of notification
 * @param {string} body - notification body
 */
const sendNotification = (title, body) => {
  const { permission } = Notification;
  const options = makeNotificationOptions(title, body);

  // Check support for HTML5 Notifications
  if (!('Notification' in window)) return;

  // Check rights on notify
  if (permission === 'granted') {
    // Если права есть, отправим уведомление
    createNotification(title, options);

    // Если прав нет, пытаемся их получить
  } else if (permission !== 'denied') {
    Notification.requestPermission((perm) => {
      if (perm === 'granted') createNotification(title, options);
    });
  }
};

/**
 * Send ready notification
 *
 * @param {string} text - text of notification
 */
const sendInside = (text) => {
  const notification = document.createElement('div');
  const p = document.createElement('p');

  p.innerText = text;

  notification.appendChild(p);
  notification.className = 'notification';
  area.insertBefore(notification, area.firstElementChild);
  playNotificationSound();

  setTimeout(() => {
    notification.classList.add('hidden');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 1200);
};

/**
 * Send ready notification with prompt
 *
 * @param {string} text - text of notification
 * @param {function} acceptCallback - function on accept
 */
const sendPrompt = (text, acceptCallback) => {
  const notification = document.createElement('div');
  const p = document.createElement('p');
  const acceptBtn = document.createElement('button');
  const cancelBtn = document.createElement('button');
  const acceptIcon = document.createElement('img');
  const cancelIcon = document.createElement('img');
  const formattedText = oneSpace(text);

  notification.className = 'notification';

  p.innerText = formattedText;
  p.setAttribute('title', formattedText);

  acceptIcon.setAttribute('src', 'img/icons/material/done.svg');
  cancelIcon.setAttribute('src', 'img/icons/material/clear.svg');
  acceptIcon.setAttribute('alt', 'Подтвердить');
  cancelIcon.setAttribute('alt', 'Отклонить');

  [acceptBtn, cancelBtn].forEach((item) => {
    item.className = 'notification-btn';
    item.setAttribute('type', 'button');
  });
  acceptBtn.setAttribute('title', 'Подтвердить');
  cancelBtn.setAttribute('title', 'Отклонить');
  acceptBtn.addEventListener('click', ripplet);
  cancelBtn.addEventListener('click', ripplet);

  cancelBtn.onclick = () => {
    notification.classList.add('hidden');
    setTimeout(() => notification.remove(), 300);
  };
  acceptBtn.onclick = () => {
    acceptCallback();
    cancelBtn.click();
  };

  acceptBtn.appendChild(acceptIcon);
  cancelBtn.appendChild(cancelIcon);

  notification.appendChild(p);
  notification.appendChild(acceptBtn);
  notification.appendChild(cancelBtn);

  area.insertBefore(notification, area.firstChild);
  playNotificationSound();
};


// Exec
if (Notification.permission === 'default') Notification.requestPermission();


// Exports
const notifications = {
  playNotificationSound,
  sendNotification,
  sendInside,
  sendPrompt,
  clear,
};
export default notifications;
