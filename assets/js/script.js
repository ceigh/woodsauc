'use strict';

import ripplet from 'ripplet.js';
import './candidates';
import './background';
import './settingsDonationAlerts';
import './socketDonationAlerts';
import notifications from './notifications';
import settings from './settings';
import Timer from './timer';

const minsCookie = getCookie('previousMinutes');
const timerElement = document.getElementById('timer');
if (minsCookie) timerElement.innerHTML = `${minsCookie}:00:00`;

const timer = new Timer(timerElement);
const timerBtns = Array.from(document.getElementById('timer-btns').children);
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const plusBtn = document.getElementById('plus-btn');
const plusTwoBtn = document.getElementById('plus-two-btn');
const minusBtn = document.getElementById('minus-btn');
timerBtns.forEach( item => item.addEventListener('click', ripplet) );

const modalOverlay = document.getElementById('modal-overlay');
modalOverlay.addEventListener('click', ripplet);
document.onkeydown = e => {
  if (!modalOverlay.classList.contains('closed') && e.key === 'Escape') {
    modalOverlay.click();
  }
};

startBtn.onclick = () => {
  const mins = timerElement.innerHTML.split(':')[0];
  if (mins) settings.cookie.set('previousMinutes', mins);
  timer.start();
};
stopBtn.onclick = () => {
  if (timer.started) {
    timer.timeStart = new Date(new Date - timer.time + 300);
    notifications.clear();
    timer.stop()
  } else {
    timer.reset();
  }
};
plusBtn.onclick = () => timer.plusOne();
plusTwoBtn.onclick = () => timer.plusTwo();
minusBtn.onclick = () => timer.minusOne();
