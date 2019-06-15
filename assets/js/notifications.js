'use strict';

const area = document.getElementById('notifications-area');


/**
  * Play light.mp3 sound
  *
  */
const playNotificationSound = () => {
  const audio = new Audio();

  audio.src = '/static/sound/light.mp3';
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
const makeNotificationOptions = (title, body) => {
  return {
    title: title,
    body: body,
    dir: 'ltr',
    lang: 'ru',
    icon: '/static/img/favicon/favicon.png'
  }
};


/**
  * Send ready notification
  *
  * @param {string} title - title of notification
  * @param {string} body - notification body
  */
const sendNotification = (title, body) => {
  const permission = Notification.permission;
  const options = makeNotificationOptions(title, body);

  // Проверим, поддерживает ли браузер HTML5 Notifications
  if ( !('Notification' in window) ) return;

  // Проверим, есть ли права на отправку уведомлений
  if (permission === 'granted') {

    // Если права есть, отправим уведомление
    createNotification(title, options);

    // Если прав нет, пытаемся их получить
  } else if (permission !== 'denied') {
    Notification.requestPermission(permission => {

    // Если права успешно получены, отправляем уведомление
    if (permission === 'granted') createNotification(title, options);
    });
  }
};


/**
  * Send ready notification
  *
  * @param {string} text - text of notification
  */
const sendInside = text => {
  const notification = document.createElement('div');
  const p = document.createElement('p');

  p.innerText = text;

  notification.appendChild(p);
  notification.className = 'notification';
  area.insertBefore(notification, area.firstElementChild);
  notifications.playNotificationSound();

  setTimeout(() => {
    notification.classList.add('hidden');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 1200);
};


const notifications = {
  playNotificationSound,
  sendNotification,
  sendInside,
  clear
};

export default notifications;
