'use strict';

export {notificationSound, sendNotification};

// Play notification sound
const notificationSound = () => {
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

// Send it
const sendNotification = (title, options) => {
  const permission = Notification.permission;

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
