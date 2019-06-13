'use strict';

import ripplet, {defaultOptions} from 'ripplet.js';
import Timer from './timer';
import notifications from './notifications';
import sortCandidates from './candidates';
import cookie from "./settings";

const firefox = navigator.userAgent.toLowerCase().includes('firefox');
const body = document.querySelector('body');

if (firefox && !getCookie('bg-url')) {
  body.style.backgroundImage = "url('/static/img/bg/tree.jpg')";
}

const minsCookie = getCookie('previousMinutes');
const timerElement = document.getElementById('timer');

if (minsCookie) {
  timerElement.innerHTML = `${minsCookie}:00:00`;
}

const timer = new Timer(timerElement);

const timerBtns = Array.from(document.getElementById('timer-btns').children);
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const plusBtn = document.getElementById('plus-btn');
const plusTwoBtn = document.getElementById('plus-two-btn');
const minusBtn = document.getElementById('minus-btn');

const modalOverlay = document.getElementById('modal-overlay');

timerBtns.forEach(item => item.addEventListener('click', ripplet));

modalOverlay.addEventListener('click', ripplet);
document.onkeydown = e => {
  if (!modalOverlay.classList.contains('closed') && e.key === 'Escape') {
    modalOverlay.click();
  }
};

startBtn.onclick = () => {
  const mins = timerElement.innerHTML.split(':')[0];
  if (mins) cookie.set('previousMinutes', mins);
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





// Settings
function changeBG(url) {
  const bgImg = new Image();

  if (url && url !== '') {
    bgImg.onload = function(){
      body.style.backgroundImage = `url(${bgImg.src})`;
    };
    bgImg.src = url;
  } else {
    if (firefox) {
      body.style.backgroundImage = "url('/static/img/bg/tree.jpg')";
    } else {
      body.style.backgroundImage = "url('/static/img/bg/tree.webp')";
    }
  }
}

function sheet(css) {
  let style = document.createElement("style");
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
  return style
}


function textSelect(inputElem) {
  inputElem.focus();
  inputElem.select();
}


const showSettingsBtn = document.getElementById('settings-icon');
const settingsWindow = document.getElementById('settings');
const saveBGURLBtn = document.getElementById('save-bg-url-btn');
const clearBGURLBtn = document.getElementById('clear-bg-url-btn');
const bgURLInput = document.getElementById('bg-url');
const colorExctractor = document.getElementById('color-extractor');
const year = 31622400;
let bgURL = getCookie('bg-url');
let styleElement;

bgURLInput.onclick = function () {
  ripplet(arguments[0]);
  textSelect(this);
};

showSettingsBtn.onclick = function () {
  ripplet(arguments[0]);

  settingsWindow.classList.toggle("closed");
};

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

let colorCookie = getCookie('accent');

// noinspection JSUnresolvedVariable
defaultOptions.clearingDuration = '.3s';
// noinspection JSUnresolvedVariable
defaultOptions.spreadingDuration = '.3s';
let color;
if (colorCookie) {
  const rgb = hexToRgb(colorCookie);
  color = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, .6)`;
} else {
  color = 'rgba(243, 151, 39, .6)';
}
// noinspection JSUnresolvedVariable
defaultOptions.color = color;

if (colorCookie && colorCookie !== '') {
  let accentShadow = hexToRgb(colorCookie);
  accentShadow = `rgba(${accentShadow.r}, ${accentShadow.g}, ${accentShadow.b}, 0.7)`;
  styleElement = sheet(`.name,.cost,#bg-url,.danger,#da-url,.cost-buy{color:${colorCookie}!important}
input:focus{--accent:${colorCookie}!important;--shadow:${accentShadow}!important}
::selection{background:${accentShadow}!important}::-moz-selection{background:${accentShadow}}!important`);
} else {
  styleElement = sheet(`.name,.cost,#bg-url,.danger,#da-url,.cost-buy{color:#f39727!important}
input:focus{--accent:#f39727!important;--shadow:rgba(243, 151, 39, 0.7)!important}
::selection{background:rgba(243,151,39,.7)}::-moz-selection{background:rgba(243,151,39,.7)}`);
}


/**
 * @return {boolean}
 */
// function isUrlWork(url) {
// TODO FIXME: async, await
//   const http = new XMLHttpRequest();
//
//   try {
//     http.open('HEAD', url, false);
//     http.send();
//     return http.status === 200;
//   } catch (e) {
//     console.log(e);
//     return false;
//   }
// }


function isUrlValid(url) {
  const isUrl = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/i;
  const isImg = /\.(jpg|jpeg|png|gif|webp|svg)$/;
  url = encodeURI(url);
  return isImg.test(url) && isUrl.test(url);
}

function notification(text) {
  const area = document.getElementById('notifications-area');
  const notification = document.createElement('div');
  const p = document.createElement('p');

  p.innerText = text;
  p.setAttribute('title', text);

  notification.appendChild(p);
  notification.className = 'notification';
  area.insertBefore(notification, area.firstElementChild);
  notifications.playNotificationSound();

  setTimeout(function () {
    notification.classList.add('hidden');
    setTimeout(function () {
      notification.remove();
    }, 300);
  }, 1200);
}


saveBGURLBtn.onclick = function () {
  const url = bgURLInput.value;

  ripplet(arguments[0]);

  if (!url) {
    notification("Нет URL фона");
  } else {
    if (url === getCookie('bg-url')) {
      notification("Этот фон уже установлен");
    } else {
      if (!isUrlValid(url)) {
        notification("Введите корректный URL");
      } else {
        changeBG(url);

        notification("Фон обновлен");

        // Change Accent color
        colorExctractor.setAttribute(
          'src', `https://cors-anywhere.herokuapp.com/${url}`);

        colorExctractor.addEventListener('load', function () {
          // noinspection JSUnresolvedFunction
          const vibrant = new Vibrant(this);
          // noinspection JSUnresolvedFunction
          const swatches = vibrant.swatches();
          // noinspection JSUnresolvedFunction
          const dominant = swatches['Vibrant'].getHex();
          let shadow = hexToRgb(dominant);

          // noinspection JSUnresolvedVariable
          defaultOptions.color = `rgba(${shadow.r}, ${shadow.g}, ${shadow.b}, .6)`;

          shadow = `rgba(${shadow.r}, ${shadow.g}, ${shadow.b}, .7)`;

          styleElement.innerText = `.name,.cost,#bg-url,.danger,#da-url,.cost-buy{color:${dominant}!important}
                          input:focus{--accent:${dominant}!important;--shadow:${shadow}!important}
                          ::selection{background:${shadow}!important}::-moz-selection{background:${shadow}!important}`;

          cookie.set('bg-url', url);
          cookie.set('accent', dominant);
        });
      }
    }
  }
};

clearBGURLBtn.onclick = function () {
  ripplet(arguments[0]);

  if (!bgURLInput.value) {
    notification("Фон уже сброшен");
  } else {
    changeBG('');

    bgURLInput.value = '';

    // noinspection JSUnresolvedVariable
    defaultOptions.color = 'rgba(243, 151, 39, .6)';

    styleElement.innerText = `.name,.cost,#bg-url,.danger,#da-url,.cost-buy{color:#f39727!important}
            input:focus{--accent:#f39727!important;--shadow:rgba(243,151,39,.7)!important});
            ::selection{background:rgba(243,151,39,.7)}::-moz-selection{background:rgba(243,151,39,.7)}`;

    cookie.delete('bg-url');
    cookie.delete('accent');

    notification("Фон сброшен");
  }
};

changeBG(bgURL);
bgURLInput.value = bgURL ? bgURL : '';

//DA URL
const daURL = document.getElementById('da-url');
const saveDAURLBtn = document.getElementById('save-da-url-btn');
const clearDAURLBtn = document.getElementById('clear-da-url-btn');
const tokenCookie = getCookie('token');

daURL.onclick = function () {
  ripplet(arguments[0]);
  textSelect(this);
};

daURL.value = tokenCookie ? tokenCookie : '';

saveDAURLBtn.onclick = function () {
  ripplet(arguments[0]);

  let token = daURL.value;
  cookie.set('token', token);

  const notificationArea = document.getElementById('notifications-area');
  let notification = document.createElement('div');
  notification.className = 'notification';

  notification.innerHTML =
    `<p title="Токен сохранен">Токен сохранен</p>`;

  notificationArea.insertBefore(notification, notificationArea.firstElementChild);
  notifications.playNotificationSound();

  setTimeout(function () {
    notification.classList.add('hidden');
    setTimeout(function () {
      notification.remove();
      location.reload();
    }, 300);
  }, 800);
};

clearDAURLBtn.onclick = function () {
  ripplet(arguments[0]);

  daURL.value = '';
  cookie.delete('token');

  const notificationArea = document.getElementById('notifications-area');
  let notification = document.createElement('div');
  notification.className = 'notification';

  notification.innerHTML =
    `<p title="Токен удален">Токен удален</p>`;

  notificationArea.insertBefore(notification, notificationArea.firstElementChild);
  notifications.playNotificationSound();

  setTimeout(function () {
    notification.classList.add('hidden');
    setTimeout(function () {
      notification.remove();
      location.reload();
    }, 300);
  }, 800);
};

const urlsBtns = document.getElementsByClassName('special-url');
for (let i = 0; i < urlsBtns.length; i++) {
  urlsBtns[i].onclick = function () {
    ripplet(arguments[0]);
  }
}

if (Notification.permission === 'default') {
  // noinspection JSIgnoredPromiseFromCall
  Notification.requestPermission();
}


// DonationAlerts
// try {
//   // noinspection JSUnresolvedFunction
//   const socket = io('https://socket.donationalerts.ru:443', {'reconnection': false});
//   const token = getCookie('token');
//   if (token) { // noinspection JSUnresolvedFunction
//     socket.emit('add-user', {'token': token, 'type': 'minor'});
//   }
//   socket.on('donation', function (msg) {
//     if (timer.started) {
//       let msgJSON = JSON.parse(msg);
//       if (msgJSON['alert_type'] === 1 || msgJSON['alert_type'] === '1') {
//         let message = msgJSON['message'];
//         message = message.replace(/\s+/g, ' ');
//         let amount = +msgJSON['amount'];
//         // let currency = msgJSON['currency'];
//         // console.log(message, amount, currency);
//
//         let names = document.getElementsByClassName('name');
//         let costs = document.getElementsByClassName('cost');
//         const notificationArea = document.getElementById('notifications-area');
//
//         let inserted = false;
//         for (let i = 0; i < Math.min(names.length, costs.length); i++) {
//           let name = names[i].value;
//           // let cost = +costs[i].value;
//
//           if (name && message.toLowerCase().includes(name.toLowerCase())) {
//             // console.log(`${name} in ${message}`);
//             let notification = document.createElement('div');
//             notification.className = 'notification';
//
//             // noinspection HtmlUnknownTarget
//             notification.innerHTML =
//               `<p></p>
//                         <button class="notification-btn" type="button" title="Подтвердить">
//                             <img src="/static/img/icons/material/done.svg" alt="Иконка подтверждения">
//                         </button>
//                         <button class="notification-btn" type="button" title="Отклонить">
//                             <img src="/static/img/icons/material/clear.svg" alt="Иконка очистки">
//                         </button>`;
//
//             notification.children[0].innerText =
//               `Добавить ₽${amount} к "${trim(toTitle(name))}"?`;
//             notification.children[0].setAttribute(
//               'title',
//               `Добавить ₽${amount} к "${trim(toTitle(name))}"?`);
//
//
//             notification.children[1].onclick = function() {
//               ripplet(arguments[0]);
//               costs = document.getElementsByClassName('cost');
//               names = document.getElementsByClassName('name');
//               for (let i = 0; i < Math.min(names.length, costs.length); i++) {
//                 let name = names[i].value;
//                 let cost = +costs[i].value;
//
//                 if (name && message.toLowerCase().includes(name.toLowerCase())) {
//                   costs[i].value = amount + cost;
//                   checkOnBuy(costs[i]);
//                   candidates.sort();
//                   changeTitle(costs[i]);
//                   notification.classList.add('hidden');
//                   setTimeout(function () {
//                     notification.remove();
//                   }, 300);
//                 }
//               }
//             };
//
//             notification.children[2].onclick = function() {
//               ripplet(arguments[0]);
//               notification.classList.add('hidden');
//               setTimeout(function () {
//                 notification.remove();
//               }, 300);
//             };
//
//             notificationArea.insertBefore(notification, notificationArea.firstElementChild);
//             notifications.playNotificationSound();
//
//             inserted = true;
//             break;
//           }
//         }
//
//         if (!inserted) {
//           let notification = document.createElement('div');
//           notification.className = 'notification';
//
//           // noinspection HtmlUnknownTarget
//           notification.innerHTML =
//             `<p></p>
//                     <button class="notification-btn" type="button" title="Подтвердить">
//                         <img src="/static/img/icons/material/done.svg" alt="Иконка подтверждения">
//                     </button>
//                     <button class="notification-btn" type="button" title="Отклонить">
//                         <img src="/static/img/icons/material/clear.svg" alt="Иконка очистки">
//                     </button>`;
//
//           notification.children[0].innerText =
//             `Создать "${ trim( toTitle(message) ) }" с ₽${amount}?`;
//           notification.children[0].setAttribute(
//             'title',
//             `Создать "${ trim( toTitle(message) ) }" с ₽${amount}?`);
//
//           notification.children[1].onclick = function() {
//             ripplet(arguments[0]);
//
//             let div = document.createElement('div');
//             div.className = 'block';
//
//             div.innerHTML =
//               `<label>
//                            <input class="name" type="text" autocomplete="off"
//                            onkeyup="createLink(this);changeSize(this)" onchange="changeSize(this)"
//                            placeholder="Позиция" spellcheck="false" onclick="ripplet(arguments[0])">
//                            <input onclick="ripplet(arguments[0])" class="cost" type="text" min="0" step="10"
//                              onchange="changeTitle(this);checksum(this);sortCandidates()"
//                              placeholder="₽" value="${amount}" autocomplete="off">
//                          </label>
//                          <span>
//                          <a href="https://www.kinopoisk.ru" target="_blank" class="kp-link"
//                            onclick="ripplet(arguments[0])" title="Ссылка на кинопоиск">
//                            <img src="/static/img/icons/material/video-library.svg"
//                            alt="Иконка ссылки на кинопоиск"></a>
//                          <button type="button" class="btn"
//                          onclick="ripplet(arguments[0]);removeRow(this)" title="Удалить">
//                            <img src="/static/img/icons/material/delete.svg" alt="Иконка удаления">
//                          </button>
//                          </span>`;
//
//             div.children[0].children[0].value = message;
//             div.children[0].children[0].setAttribute('title', message);
//             div.children[0].children[1].setAttribute(
//               'title', `Сумма: ${amount} ₽`);
//
//             changeSize(div.children[0].children[0]);
//
//             checkOnBuy(div.children[0].children[1]);
//
//             candidatesArea.insertBefore(div, candidatesArea.lastElementChild);
//
//             candidates.sort();
//
//             setTimeout(function () {
//               div.classList.add('visible');
//             }, 20);
//
//             for (let i = 0; i < names.length; i++) {
//               createLink(names[i]);
//             }
//
//             notification.classList.add('hidden');
//             setTimeout(function () {
//               notification.remove();
//             }, 300);
//           };
//
//           notification.children[2].onclick = function() {
//             ripplet(arguments[0]);
//
//             notification.classList.add('hidden');
//             setTimeout(function () {
//               notification.remove();
//             }, 300);
//           };
//
//           notificationArea.insertBefore(notification, notificationArea.firstElementChild);
//           notifications.playNotificationSound();
//         }
//         let cuteMsg = message.replace(/\s+$/, '');
//         cuteMsg = cuteMsg.length > 30 ? `${cuteMsg.substr(0, 30)}...` : cuteMsg;
//         notifications.sendNotification(`Новое пожертвование${!msgJSON['username'] ? '' :
//                                             ` от ${msgJSON['username']}`}!`,
//                                       `"${cuteMsg}" с ${amount}₽`)
//       }
//     }
//   });
// } catch (e) {
//   console.log("Нет подключения, автодобавление не будет работать.");
// }
