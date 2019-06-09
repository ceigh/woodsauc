'use strict';

import ripplet, {defaultOptions} from 'ripplet.js';
import Timer from './timer';
import notifications from './notifications';
import {trim, oneSpace, toTitle} from './stringUtilities';

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

timerBtns.forEach(item => item.addEventListener('click', ripplet));

startBtn.onclick = () => {
  const mins = timerElement.innerHTML.split(':')[0];

  if (mins) {
    setCookie('previousMinutes', mins, {'expires': year});
  }

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





//Dynamic inputs
const defaultSize = 16.2;
const defaultMargin = 2.6;
const highestMargin = 35.4;

let maxSize = defaultSize;
let maxMargin = defaultMargin;

let styleForSize = document.createElement('style');
styleForSize.appendChild(document.createTextNode(
  `.name{width:${defaultSize}vw}`));
document.head.appendChild(styleForSize);

function changeSize(nameElement) {
  let width;
  let margin;
  let delta = nameElement.value.length - 10;

  let names = document.getElementsByClassName('name');

  if (delta > 0) {
    width = defaultSize + delta * 2.1;
    width = +width.toFixed(2);
    margin = defaultMargin + delta * 2.1;
    margin = margin.toFixed(2);
    margin = margin > highestMargin ? highestMargin : margin;
  } else if (names.length === 1) {
    maxSize = defaultSize;
    maxMargin = defaultMargin;
    styleForSize.innerText =
      `.name{width:${defaultSize}vw}#add-btn{width:${defaultSize + 10}vw}.block-buy span{margin-right:${defaultMargin}vw}`;
  }

  if (width && width > maxSize) {
    maxSize = width;
    maxMargin = margin;
    styleForSize.innerText = `.name{width:${width}vw}#add-btn{width:${width+10}vw!important}.block-buy span{margin-right:${margin}vw!important}`;
  }
}

// DonationAlerts
try {
  // noinspection JSUnresolvedFunction
  const socket = io('https://socket.donationalerts.ru:443', {'reconnection': false});
  const token = getCookie('token');
  if (token) { // noinspection JSUnresolvedFunction
    socket.emit('add-user', {'token': token, 'type': 'minor'});
  }
  socket.on('donation', function (msg) {
    if (timer.started) {
      let msgJSON = JSON.parse(msg);
      if (msgJSON['alert_type'] === 1 || msgJSON['alert_type'] === '1') {
        let message = msgJSON['message'];
        message = message.replace(/\s+/g, ' ');
        let amount = +msgJSON['amount'];
        // let currency = msgJSON['currency'];
        // console.log(message, amount, currency);

        let names = document.getElementsByClassName('name');
        let costs = document.getElementsByClassName('cost');
        const notificationArea = document.getElementById('notifications-area');

        let inserted = false;
        for (let i = 0; i < Math.min(names.length, costs.length); i++) {
          let name = names[i].value;
          // let cost = +costs[i].value;

          if (name && message.toLowerCase().includes(name.toLowerCase())) {
            // console.log(`${name} in ${message}`);
            let notification = document.createElement('div');
            notification.className = 'notification';

            // noinspection HtmlUnknownTarget
            notification.innerHTML =
              `<p></p>
                        <button class="notification-btn" type="button" title="Подтвердить">
                            <img src="/static/img/icons/material/done.svg" alt="Иконка подтверждения">
                        </button>
                        <button class="notification-btn" type="button" title="Отклонить">
                            <img src="/static/img/icons/material/clear.svg" alt="Иконка очистки">
                        </button>`;

            notification.children[0].innerText =
              `Добавить ₽${amount} к "${trim(toTitle(name))}"?`;
            notification.children[0].setAttribute(
              'title',
              `Добавить ₽${amount} к "${trim(toTitle(name))}"?`);


            notification.children[1].onclick = function() {
              ripplet(arguments[0]);
              costs = document.getElementsByClassName('cost');
              names = document.getElementsByClassName('name');
              for (let i = 0; i < Math.min(names.length, costs.length); i++) {
                let name = names[i].value;
                let cost = +costs[i].value;

                if (name && message.toLowerCase().includes(name.toLowerCase())) {
                  costs[i].value = amount + cost;
                  checkOnBuy(costs[i]);
                  sortCandidates();
                  changeTitle(costs[i]);
                  notification.classList.add('hidden');
                  setTimeout(function () {
                    notification.remove();
                  }, 300);
                }
              }
            };

            notification.children[2].onclick = function() {
              ripplet(arguments[0]);
              notification.classList.add('hidden');
              setTimeout(function () {
                notification.remove();
              }, 300);
            };

            notificationArea.insertBefore(notification, notificationArea.firstElementChild);
            notifications.playNotificationSound();

            inserted = true;
            break;
          }
        }

        if (!inserted) {
          let notification = document.createElement('div');
          notification.className = 'notification';

          // noinspection HtmlUnknownTarget
          notification.innerHTML =
            `<p></p>
                    <button class="notification-btn" type="button" title="Подтвердить">
                        <img src="/static/img/icons/material/done.svg" alt="Иконка подтверждения">
                    </button>
                    <button class="notification-btn" type="button" title="Отклонить">
                        <img src="/static/img/icons/material/clear.svg" alt="Иконка очистки">
                    </button>`;

          notification.children[0].innerText =
            `Создать "${trim(toTitle(message))}" с ₽${amount}?`;
          notification.children[0].setAttribute(
            'title',
            `Создать "${trim(toTitle(message))}" с ₽${amount}?`);

          notification.children[1].onclick = function() {
            ripplet(arguments[0]);

            let div = document.createElement('div');
            div.className = 'block';

            div.innerHTML =
              `<label>
                           <input class="name" type="text" autocomplete="off"
                           onkeyup="createLink(this);changeSize(this)" onchange="changeSize(this)"
                           placeholder="Позиция" spellcheck="false" onclick="ripplet(arguments[0])">
                           <input onclick="ripplet(arguments[0])" class="cost" type="text" min="0" step="10" 
                             onchange="changeTitle(this);checksum(this);sortCandidates()" 
                             placeholder="₽" value="${amount}" autocomplete="off">
                         </label>
                         <span>
                         <a href="https://www.kinopoisk.ru" target="_blank" class="kp-link"
                           onclick="ripplet(arguments[0])" title="Ссылка на кинопоиск">
                           <img src="/static/img/icons/material/video-library.svg" 
                           alt="Иконка ссылки на кинопоиск"></a>
                         <button type="button" class="btn" 
                         onclick="ripplet(arguments[0]);removeRow(this)" title="Удалить">
                           <img src="/static/img/icons/material/delete.svg" alt="Иконка удаления">
                         </button>
                         </span>`;

            div.children[0].children[0].value = message;
            div.children[0].children[0].setAttribute('title', message);
            div.children[0].children[1].setAttribute(
              'title', `Сумма: ${amount} ₽`);

            changeSize(div.children[0].children[0]);

            checkOnBuy(div.children[0].children[1]);

            candidatesArea.insertBefore(div, candidatesArea.lastElementChild);

            sortCandidates();

            setTimeout(function () {
              div.classList.add('visible');
            }, 20);

            for (let i = 0; i < names.length; i++) {
              createLink(names[i]);
            }

            notification.classList.add('hidden');
            setTimeout(function () {
              notification.remove();
            }, 300);
          };

          notification.children[2].onclick = function() {
            ripplet(arguments[0]);

            notification.classList.add('hidden');
            setTimeout(function () {
              notification.remove();
            }, 300);
          };

          notificationArea.insertBefore(notification, notificationArea.firstElementChild);
          notifications.playNotificationSound();
        }
        let cuteMsg = message.replace(/\s+$/, '');
        cuteMsg = cuteMsg.length > 30 ? `${cuteMsg.substr(0, 30)}...` : cuteMsg;
        sendNotification(`Новое пожертвование${msgJSON['username'] ? ` от ${msgJSON['username']}` : ''}!`,
          {'body': `"${cuteMsg}" с ${amount}₽`,
            'dir': 'ltr', 'lang': 'ru', 'icon': '/static/img/favicon/favicon.png'})
      }
    }
  });
} catch (e) {
  console.log("Нет подключения, автодобавление не будет работать.");
}

// Candidates
function sortCandidates() {
  let total = [];
  let names = document.getElementsByClassName('name');
  let costs = document.getElementsByClassName('cost');

  for (let i = 0; i < Math.min(names.length, costs.length); i++) {
    let name = names[i].value;
    let cost = +costs[i].value;
    let titleName = names[i].getAttribute('title');
    let titleCost = costs[i].getAttribute('title');
    let link = names[i].parentNode.parentNode.children[1].children[0].href;

    total.push({
      'name': name,
      'cost': cost,
      'titleName': titleName,
      'titleCost': titleCost,
      'link': link
    });
  }

  total = total.sort(function (e1, e2) {
    return e1.cost - e2.cost;
  }).reverse();

  // console.log(total);

  for (let i = 0; i < Math.min(names.length, costs.length); i++) {
    let cost = total[i].cost;
    costs[i].value = cost === 0 ? '' : cost;
    names[i].value = total[i].name;
    names[i].setAttribute('title', total[i].titleName);
    costs[i].setAttribute('title', total[i].titleCost);
    names[i].parentNode.parentNode.children[1].children[0].href = total[i].link;
  }
}


function clearRow() {
  let candidateArea = document.getElementById('candidates-area');
  let label = candidateArea.children[1].children[0];
  let link = candidateArea.children[1].children[1].children[0];

  label.children[0].value = '';
  label.children[1].value = '';
  label.children[0].setAttribute('title', 'Фильм, игра, etc');
  label.children[1].setAttribute('title', 'Сумма');
  link.href = 'https://www.kinopoisk.ru';

  changeSize(label.children[0]);
}


function removeRow(delBtn) {
  setTimeout(function () {
    try {
      delBtn.parentNode.parentNode.parentNode.removeChild(delBtn.parentNode.parentNode);
    } catch (e) {}
    // Get back to default size after delete last non-empty row
    let names = document.getElementsByClassName('name');

    if (names.length === 1 && !names[0].value) {
      maxSize = defaultSize;
      styleForSize.innerText =
        `.name{width:${defaultSize}vw}#add-btn{width:${defaultSize + 10}vw}`;
    }
  }, 200);
}


function createLink(nameElement) {
  nameElement.value = oneSpace(nameElement.value);
  let name = nameElement.value;
  if (name) {
    nameElement.parentNode.parentNode.children[1].children[0].href =
      encodeURI(`https://www.kinopoisk.ru/s/type/all/find/${name}/`);
    nameElement.setAttribute('title', toTitle(name));
  } else {
    nameElement.parentNode.parentNode.children[1].children[0].href =
      'https://www.kinopoisk.ru';
    nameElement.setAttribute('title', "Фильм, игра, etc");
  }
}


const addBtn = document.getElementById('add-btn');
let candidatesArea = document.getElementById('candidates-area');

addBtn.onclick = function () {
  let div = document.createElement('div');
  div.className = 'block';

  // noinspection HtmlUnknownTarget
  div.innerHTML =
    `<label>
           <input class="name" type="text" onkeyup="createLink(this);changeSize(this)"  onchange="changeSize(this)"
             onclick="ripplet(arguments[0])" title="Фильм, игра, etc" autocomplete="off" placeholder="Позиция" spellcheck="false">
           <input class="cost" type="text" min="0" step="10" placeholder="₽" title="Сумма"
             onclick="ripplet(arguments[0])" onchange="changeTitle(this);checksum(this);sortCandidates();checkOnBuy(this)" autocomplete="off">
         </label>
         <span>
         <a href="https://www.kinopoisk.ru" target="_blank" class="kp-link" 
           onclick="ripplet(arguments[0])" title="Ссылка на кинопоиск">
           <img src="static/img/icons/material/video-library.svg" alt="Иконка ссылки на кинопоиск"></a>
         <button type="button" class="btn" 
           onclick="ripplet(arguments[0]);removeRow(this)" title="Удалить">
           <img src="/static/img/icons/material/delete.svg" alt="Иконка удаления">
         </button>
        </span>`;

  candidatesArea.insertBefore(div, candidatesArea.lastElementChild);

  ripplet(arguments[0]);

  setTimeout(function () {
    div.classList.add('visible');
  }, 10);

  div.children[0].children[0].focus();

  sortCandidates();
};


// Settings
// Set cookie is in index.html
function setCookie(name, value, options) {
  options = options || {};

  let expires = options.expires;

  if (typeof expires == 'number' && expires) {
    const d = new Date();
    d.setTime(d.getTime() + expires * 1000);
    expires = options.expires = d;
  }

  if (expires && expires.toUTCString) {
    options.expires = expires.toUTCString();
  }

  value = encodeURIComponent(value);

  let updatedCookie = `${name}=${value}`;

  for (const propName in options) {
    updatedCookie += "; " + propName;
    // noinspection JSUnfilteredForInLoop
    const propValue = options[propName];
    if (propValue !== true) {
      updatedCookie += "=" + propValue;
    }
  }

  document.cookie = updatedCookie;
}


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
function isUrlWork(url) {
  const http = new XMLHttpRequest();

  try {
    http.open('HEAD', url, false);
    http.send();
    return http.status === 200;
  } catch (e) {
    console.log(e);
    return false;
  }
}


function isUrlValid(url) {
  // noinspection RegExpRedundantEscape
  const objRE = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&/=]*)/i;
  return objRE.test(url);
}


function notification(text) {
  const tray = document.getElementById('notifications-area');
  const notification = document.createElement('div');
  const p = document.createElement('p');

  p.innerText = text;
  p.setAttribute('title', text);

  notification.appendChild(p);
  notification.className = 'notification';
  tray.insertBefore(notification, tray.firstElementChild);
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
        if (!isUrlWork(`https://cors-anywhere.herokuapp.com/${url}`)) {
          notification("URL неверный, или не отвечает");
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

            setCookie('bg-url', url, {'expires': year});
            setCookie('accent', dominant, {'expires': year});
          });
        }
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

    setCookie('bg-url', '', {'expires': year});
    setCookie('accent', '', {'expires': year});

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
  setCookie('token', token, {'expires': year});

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
  setCookie('token', '', {'expires': year});

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


// Close modal on keydown
document.onkeydown = function(e) {
  const modalOverlay = document.getElementById('modal-overlay');

  if (!modalOverlay.classList.contains('closed') && e.key === 'Escape') {
    modalOverlay.click();
  }
};

// Change title on cost
function changeTitle(costInput) {
  const cost = costInput.value ? `: ${costInput.value} ₽` : '';
  costInput.setAttribute('title', `Сумма${cost}`);
}

// Reset button
const resetButton = document.getElementById('reset-icon');

resetButton.onclick = function () {
  ripplet(arguments[0]);

  let candidatesArea = document.getElementById('candidates-area');
  while (candidatesArea.children.length > 3) {
    candidatesArea.removeChild(candidatesArea.children[candidatesArea.children.length-2]);
  }
  clearRow();
};

const urlsBtns = document.getElementsByClassName('special-url');
for (let i = 0; i < urlsBtns.length; i++) {
  urlsBtns[i].onclick = function () {
    ripplet(arguments[0]);
  }
}

//Summary cost
function checksum(costElement) {
  let calculated = costElement.value.replace(/[^\d+*/,.-]/g, '');
  calculated = calculated.replace(/,/, '.');
  try {
    calculated = eval(calculated);
    if (isNaN(calculated) || !isFinite(calculated)) {
      costElement.value = '';
      costElement.setAttribute('title', 'Сумма');
    } else {
      calculated = calculated > 0 ? +calculated.toFixed(2) : '';
      costElement.value = calculated;
      costElement.setAttribute('title', `Сумма: ${calculated} ₽`);
    }
  } catch (e) {
    costElement.value = '';
    costElement.setAttribute('title', 'Сумма');
  }
}

// Buy
const costBuy = document.getElementsByClassName('cost-buy')[0];
const costBuyCookie = getCookie('buyCost');
const costBuyClearBtn = document.querySelector('.block-buy .btn');
let isBuy = false;
let buyWinner;
let buyCost;

costBuy.value = costBuyCookie ? costBuyCookie : '';
changeTitle(costBuy);

costBuy.onchange = function () {
  changeTitle(this);
  checksum(this);
  setCookie('buyCost', this.value, {'expires': year});
};

costBuy.onclick = function () {
  ripplet(arguments[0]);
};

costBuyClearBtn.onclick = function () {
  ripplet(arguments[0]);
  costBuy.value = '';
  setCookie('buyCost', '', {'expires': -1});
};

function checkOnBuy(costElem) {
  const neededCost = +costBuy.value;
  const currentCost = +costElem.value;

  const nameElem = costElem.previousElementSibling;
  let winnerName = trim(toTitle(nameElem.value));

  if (neededCost && winnerName && currentCost >= neededCost) {
    if (!timer.started) {
      const modal = document.querySelector('#modal');
      const modalOverlay = document.querySelector('#modal-overlay');

      modalOverlay.onclick = function() {
        ripplet(arguments[0]);

        modal.classList.toggle('closed');
        modalOverlay.classList.toggle('closed');
        document.title = "Аукцион β";
      };

      modal.children[0].innerText = `"${winnerName}" выкупили, аж за ${currentCost}₽ Pog!`;
      document.title =
        winnerName.length > 30 ? `${winnerName.substring(0, 30)}..." выкупили!` : `${winnerName} выкупили!`;

      modal.classList.toggle('closed');
      modalOverlay.classList.toggle('closed');
      notifications.playNotificationSound();
      notifications.sendNotification("Аукцион окончен!",
        {'body': `Выкупили "${winnerName.length > 30 ? `${winnerName.substring(0, 30)}...` : winnerName}"!`,
          'dir': 'ltr', 'lang': 'ru', 'icon': '/static/dist/img/favicon/favicon.png'})
    } else {
      buyWinner = winnerName;
      buyCost = currentCost;
      isBuy = true;
      stopBtn.click();
    }
  }
}

if (Notification.permission === 'default') {
  Notification.requestPermission();
}
