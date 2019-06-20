'use strict';

import ripplet from 'ripplet.js';
import cookie from './cookie';
import notifications from './notifications';
import {selectTxt} from './settings';

const daUrl = document.getElementById('da-url');
const saveDaUrlBtn = document.getElementById('save-da-url-btn');
const clearDaUrlBtn = document.getElementById('clear-da-url-btn');
const tokenCookie = cookie.get('token');

daUrl.value = tokenCookie ? tokenCookie : '';

[daUrl, saveDaUrlBtn, clearDaUrlBtn].forEach(
item => item.addEventListener('click', ripplet) );

daUrl.onclick = function() {
  selectTxt(this);
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
  if (token === cookie.get('token')) {
    notifications.sendInside('Этот токен уже установлен');
    return;
  }
  cookie.set('token', token);
  notifications.sendInside('Токен сохранен');
  location.reload();
};

clearDaUrlBtn.onclick = () => {
  if (!daUrl.value) {
    notifications.sendInside('Токен уже удален');
    return;
  }
  daUrl.value = '';
  cookie.del('token');
  notifications.sendInside('Токен удален');
  location.reload();
};
