// Imports
// eslint-disable-next-line import/no-cycle
import { selectTxt } from './settings';
import cookie from './cookie';
import notifications from './notifications';
import addRipplet from './tools';


// Variables
const daUrl = document.getElementById('da-url');
const saveDaUrlBtn = document.getElementById('save-da-url-btn');
const clearDaUrlBtn = document.getElementById('clear-da-url-btn');
const tokenCookie = cookie.get('token');


// Exec
addRipplet([daUrl, saveDaUrlBtn, clearDaUrlBtn]);

daUrl.value = tokenCookie || '';
daUrl.onclick = () => selectTxt(daUrl);

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
  window.location.reload();
};
clearDaUrlBtn.onclick = () => {
  if (!daUrl.value) {
    notifications.sendInside('Токен уже удален');
    return;
  }
  daUrl.value = '';
  cookie.del('token');
  notifications.sendInside('Токен удален');
  window.location.reload();
};
