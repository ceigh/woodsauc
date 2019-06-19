'use strict';

import ripplet from 'ripplet.js';
import settings from './settings';
import notifications from './notifications';

const daUrl = document.getElementById('da-url');
const saveDaUrlBtn = document.getElementById('save-da-url-btn');
const clearDaUrlBtn = document.getElementById('clear-da-url-btn');
const tokenCookie = getCookie('token');

daUrl.value = tokenCookie ? tokenCookie : '';

[daUrl, saveDaUrlBtn, clearDaUrlBtn].forEach(
item => item.addEventListener('click', ripplet) );

daUrl.onclick = function() {
  settings.tools.selectTxt(this);
};

saveDaUrlBtn.onclick = () => {
  const token = daUrl.value;
  if (!token) {
    notifications.sendInside('Введите токен');
    return;
  }
  if (token.length !== 20) {
    notifications.sendInside('Введите корректный токен');
    daUrl.value = '';
    return;
  }
  if (token === getCookie('token')) {
    notifications.sendInside('Этот токен уже установлен');
    return;
  }
  settings.cookie.set('token', token);
  notifications.sendInside('Токен сохранен');
  location.reload();
};

clearDaUrlBtn.onclick = () => {
  if (!daUrl.value) {
    notifications.sendInside('Токен уже удален');
    return;
  }
  daUrl.value = '';
  settings.cookie.delete('token');
  notifications.sendInside('Токен удален');
  location.reload();
};
