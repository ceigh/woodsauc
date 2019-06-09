'use strict';

const playNotificationSound = () => {
  const audio = new Audio();

  audio.src = '/static/sound/light.mp3';
  audio.autoplay = true;
};

// Open browser window if collapsed
const focusWindow = () => {
  window.focus();
};

// HTML5 notifications
// Make notification element
const createNotification = (title, options) => {
  const notification = new Notification(title, options);

  notification.onclick = focusWindow;
  return notification;
};

const makeNotificationOptions = (title, body) => {
  return {
    title: title,
    body: body,
    dir: 'ltr',
    lang: 'ru',
    icon: '/static/img/favicon/favicon.png'
  }
};

// Send it
const sendNotification = (title, body) => {
  const permission = Notification.permission;
  const options = makeNotificationOptions(title, body);

  // Проверим, поддерживает ли браузер HTML5 Notifications
  if ( !('Notification' in window) ) {
    return;
  }

  // Проверим, есть ли права на отправку уведомлений
  if (permission === 'granted') {

    // Если права есть, отправим уведомление
    createNotification(title, options);

    // Если прав нет, пытаемся их получить
  } else if (permission !== 'denied') {
    Notification.requestPermission(permission => {

      // Если права успешно получены, отправляем уведомление
      if (permission === 'granted') {
        createNotification(title, options);
      }
    });
  }
};

// Clear notification area
const clear = () => {
  const notifications = document.getElementById('notifications-area');
  while (notifications.children.length > 0) {
    notifications.removeChild(notifications.firstChild);
  }
};

// All functions in one object
const notifications = {
  playNotificationSound,
  sendNotification,
  clear
};

export default notifications;
