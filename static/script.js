//TODO: timer animation
//TODO: select from notification
//TODO: fix timer freezes on FF

const firefox = navigator.userAgent.toLowerCase().includes('firefox');
if (firefox && !getCookie('bg-url')) {
    document.querySelector('body').style.backgroundImage = "url('static/38263.jpg')";
}

function notificationSound() {
    const audio = new Audio();
    audio.src = '/static/light.mp3';
    audio.autoplay = true;
}

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

//Title case
String.prototype.toTitle = function() {
  return this.replace(/(^|\s)\S/g, function(t) { return t.toUpperCase() });
};

// Truncate string
String.prototype.truncate = function() {
      return this.replace(/\s+$/, '').replace(/^\s+/, '');
};

// DonationAlerts
let started = false;
try {
    // noinspection JSUnresolvedFunction
    const socket = io('https://socket.donationalerts.ru:443', {'reconnection': false});
    const token = getCookie('token');
    if (token) { // noinspection JSUnresolvedFunction
        socket.emit('add-user', {'token': token, 'type': 'minor'});
    }
    socket.on('donation', function (msg) {
    if (started) {
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
                            <img src="static/icons/round-done-24px.svg" alt="Иконка подтверждения">
                        </button>
                        <button class="notification-btn" type="button" title="Отклонить">
                            <img src="static/icons/round-clear-24px.svg" alt="Иконка очистки">
                        </button>`;

                    notification.children[0].innerText =
                        `Добавить ₽${amount} к "${name.toTitle().replace(/\s+$/, '')}"?`;
                    notification.children[0].setAttribute(
                        'title',
                        `Добавить ₽${amount} к "${name.toTitle().replace(/\s+$/, '')}"?`);


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
                    notificationSound();

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
                        <img src="static/icons/round-done-24px.svg" alt="Иконка подтверждения">
                    </button>
                    <button class="notification-btn" type="button" title="Отклонить">
                        <img src="static/icons/round-clear-24px.svg" alt="Иконка очистки">
                    </button>`;

                notification.children[0].innerText =
                    `Создать "${message.toTitle().replace(/\s+$/, '')}" с ₽${amount}?`;
                notification.children[0].setAttribute(
                    'title',
                    `Создать "${message.toTitle().replace(/\s+$/, '')}" с ₽${amount}?`);

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
                           <img src="static/icons/round-video_library-24px.svg" 
                           alt="Иконка ссылки на кинопоиск"></a>
                         <button type="button" class="btn" 
                         onclick="ripplet(arguments[0]);removeRow(this)" title="Удалить">
                           <img src="static/icons/round-delete-24px.svg" alt="Иконка удаления">
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
                notificationSound();
            }
            let cuteMsg = message.replace(/\s+$/, '');
            cuteMsg = cuteMsg.length > 30 ? `${cuteMsg.substr(0, 30)}...` : cuteMsg;
            sendNotification(`Новое пожертвование${msgJSON['username'] ? ` от ${msgJSON['username']}` : ''}!`,
                {'body': `"${cuteMsg}" с ${amount}₽`,
                'dir': 'ltr', 'lang': 'ru', 'icon': '/static/maple.png'})
        }
    }
});
} catch (e) {
    console.log("Нет подключения, автодобавление не будет работать.");
}

// Timer
function returnWinner() {
    let winner = undefined;
    let maxCost = null;
    let names = document.getElementsByClassName('name');
    let costs = document.getElementsByClassName('cost');

    for (let i = 0; i < Math.min(names.length, costs.length); i++) {
        let name = names[i].value;
        let cost = +costs[i].value;

        if (cost > maxCost) {
            maxCost = cost;
            winner = name ? name : winner;
        }
    }

    if (maxCost) winner = winner.toTitle();
    return winner ? `"${winner.truncate()}"` : "Никто не ";
}


function showWinner() {
    const modal = document.querySelector('#modal');
    const modalOverlay = document.querySelector('#modal-overlay');

    timer.classList.remove('danger');

    modalOverlay.onclick = function() {
        ripplet(arguments[0]);

        modal.classList.toggle('closed');
        modalOverlay.classList.toggle('closed');

        document.title = "Аукцион β";
    };

    let winner = returnWinner();

    if (isBuy) {
        modal.children[0].innerText = `"${buyWinner}" выкупили, аж за ${buyCost}₽ Pog!`;
        document.title =
            buyWinner.length > 30 ? `${buyWinner.substring(0, 30)}... выкупили!` : `${buyWinner} выкупили!`;

        sendNotification("Аукцион окончен!",
        {'body': `Выкупили "${buyWinner.length > 30 ? `${buyWinner.substring(0, 30)}...` : buyWinner}"!`,
                  'dir': 'ltr', 'lang': 'ru', 'icon': '/static/maple.png'})
    } else {
        modal.children[0].innerText = `${winner} победил!`;

        document.title =
            winner.length > 30 ? `${winner.substring(0, 30)}... победил!` : `${winner} победил!`;

        if (winner === "Никто не ") {
            sendNotification("Аукцион окончен!",
                {'body': "Никто не победил :(",
                'dir': 'ltr', 'lang': 'ru', 'icon': '/static/maple.png'})
        } else {
            sendNotification("Аукцион окончен!",
                {'body': `Победа ${winner.length > 30 ? `${winner.substring(0, 30)}..."` : winner}!`,
                'dir': 'ltr', 'lang': 'ru', 'icon': '/static/maple.png'})
        }
    }

    modalOverlay.classList.toggle('closed');
    modal.classList.toggle('closed');
    notificationSound();
}


let startTime;

const timer = document.getElementById('timer');
const minsCookie = getCookie('previousMinutes');
if (minsCookie) {
    timer.innerHTML = `${minsCookie}:00:00`;
}

let timerArray = timer.innerHTML.split(':');
let m = +timerArray[0], s = +timerArray[1], ms = +timerArray[2];
let timerTime = new Date(60000 * m + 1000 * s + ms);


function updateTimer() {
	const currTime = new Date();
    const deltaTime = new Date(currTime - startTime);
    const resultTime = new Date(timerTime - deltaTime);

    let rm = resultTime.getMinutes();  // result minutes
    let rs = resultTime.getSeconds();  // result seconds
    let rms = resultTime.getMilliseconds();  // result milliseconds

    if (!rm && rs < 30) {
        timer.classList.add('danger');
    } else {
        timer.classList.remove('danger')
    }
    
    // if (!(rs % 2)) {
        let winner = returnWinner();

        if (winner !== "Никто не ") {
            winner = winner.length > 30 ? `${winner.substr(0, 30)}..."` : winner;
            document.title = `${winner} - Аукцион β`;
        } else {
            document.title = 'Аукцион β';
        }
    // }
    
    if ((!rm && !rs && rms < 300) || timerTime < deltaTime) {  // minimal rms can't be 0, and it's totally random
    	cancelAnimationFrame(updateTimer);
        timer.innerHTML = '00:00:00';
        showWinner();
        started = false;
    } else {
    	rm = rm < 10 ? `0${rm}` : rm;
        rs = rs < 10 ? `0${rs}` : rs;
        rms = rms < 10 ? `0${rms}` : rms;
        rms = String(rms).substr(0, 2);

        timer.innerHTML = `${rm}:${rs}:${rms}`;

        requestAnimationFrame(updateTimer);
    }
}


function startTimer() {
    const minutes = +timer.innerHTML.split(':')[0];

    if (!started) {
        if (!minutes) {
            showWinner();
        } else {
            startTime = new Date();
            requestAnimationFrame(updateTimer);
            started = true;
        }
    }
}


const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('stop-btn');
const plusBtn = document.getElementById('plus-btn');
const plusTwoBtn = document.getElementById('plus-two-btn');
const minusBtn = document.getElementById('minus-btn');

startBtn.onclick = function () {
    const mins = timer.innerHTML.split(':')[0];

    ripplet(arguments[0]);

    if (mins) {
        setCookie('previousMinutes', mins, {'expires': year});
    }

    startTimer();
};

resetBtn.onclick = function () {
    ripplet(arguments[0]);

    if (started) {
        startTime = new Date(new Date - timerTime + 300);

        let notificationArea = document.getElementById('notifications-area');
        while (notificationArea.children.length > 0) {
            notificationArea.removeChild(notificationArea.firstChild);
        }

        started = false;
    } else {
        m = 0;
        timerTime = new Date(0);

        timer.innerHTML = '00:00:00';
    }
};

plusBtn.onclick = function () {
    ripplet(arguments[0]);

    timerArray = timer.innerHTML.split(':');
    const mins = +timerArray[0];

    if (started) {
        if (mins !== 59) {
            startTime.setMinutes(startTime.getMinutes() + 1);
        }
    } else {
        let rm;

        m = +timerArray[0] + 1;
        m = m > 59 ? 59 : m;
        timerTime = new Date(60000 * m + 1000 * s + ms);

        rm = m < 10 ? `0${m}` : m;
        timer.innerHTML = `${rm}:00:00`
    }
};

plusTwoBtn.onclick = function () {
    ripplet(arguments[0]);

    timerArray = timer.innerHTML.split(':');
    const mins = +timerArray[0];

    if (started) {
        if (mins === 58) {
            startTime.setMinutes(startTime.getMinutes() + 1);
        } else if (mins < 58) {
            startTime.setMinutes(startTime.getMinutes() + 2);
        }
    } else {
        let rm;

        m = +timerArray[0] + 2;
        m = m > 59 ? 59 : m;
        timerTime = new Date(60000 * m + 1000 * s + ms);

        rm = m < 10 ? `0${m}` : m;
        timer.innerHTML = `${rm}:00:00`
    }
};

minusBtn.onclick = function () {
    const minutes = +timer.innerHTML.split(':')[0];

    ripplet(arguments[0]);

    if (minutes) {
        if (started) {
            startTime.setMinutes(startTime.getMinutes() - 1);
        } else {
            let rm;

            timerArray = timer.innerHTML.split(':');
            m = +timerArray[0] - 1;
            timerTime = new Date(60000 * m + 1000 * s + ms);

            rm = m < 10 ? `0${m}` : m;
            timer.innerHTML = `${rm}:00:00`
        }
    }
};


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

function trim(string) {
    return string.replace(/^\s+/, '').replace(/\s{2,}$/, '').replace(/\s+/g, ' ')
}

function createLink(nameElement) {
    nameElement.value = trim(nameElement.value);
    let name = nameElement.value;
    if (name) {
        nameElement.parentNode.parentNode.children[1].children[0].href =
            encodeURI(`https://www.kinopoisk.ru/s/type/all/find/${name}/`);
        nameElement.setAttribute('title', name.toTitle());
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
           <img src="static/icons/round-video_library-24px.svg" alt="Иконка ссылки на кинопоиск"></a>
         <button type="button" class="btn" 
           onclick="ripplet(arguments[0]);removeRow(this)" title="Удалить">
           <img src="static/icons/round-delete-24px.svg" alt="Иконка удаления">
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
    const body = document.querySelector('body');
    const bgImg = new Image();

    if (url && url !== '') {
        bgImg.onload = function(){
            body.style.backgroundImage = `url(${bgImg.src})`;
        };
        bgImg.src = url;
    } else {
        if (firefox) {
            body.style.backgroundImage = "url('static/38263.jpg')";
        } else {
            body.style.backgroundImage = "url('static/38263.webp')";
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
ripplet.defaultOptions.clearingDuration = '.3s';
// noinspection JSUnresolvedVariable
ripplet.defaultOptions.spreadingDuration = '.3s';
let color;
if (colorCookie) {
    const rgb = hexToRgb(colorCookie);
    color = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, .6)`;
} else {
    color = 'rgba(243, 151, 39, .6)';
}
// noinspection JSUnresolvedVariable
ripplet.defaultOptions.color = color;

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
    notificationSound();

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
                        ripplet.defaultOptions.color = `rgba(${shadow.r}, ${shadow.g}, ${shadow.b}, .6)`;

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
        ripplet.defaultOptions.color = 'rgba(243, 151, 39, .6)';

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
    notificationSound();

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
    notificationSound();

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
    let winnerName = nameElem.value.toTitle().truncate();

    if (neededCost && winnerName && currentCost >= neededCost) {
        if (!started) {
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
            notificationSound();
            sendNotification("Аукцион окончен!",
            {'body': `Выкупили "${winnerName.length > 30 ? `${winnerName.substring(0, 30)}...` : winnerName}"!`,
                      'dir': 'ltr', 'lang': 'ru', 'icon': '/static/maple.png'})
        } else {
            buyWinner = winnerName;
            buyCost = currentCost;
            isBuy = true;
            resetBtn.click();
        }
    }
}

//HTML5 notifications
function sendNotification(title, options) {
    // Проверим, поддерживает ли браузер HTML5 Notifications
    if (!('Notification' in window)) {
        console.log("Ваш браузер не поддерживает HTML Notifications, его необходимо обновить.");
    } else if (Notification.permission === 'granted') {  // Проверим, есть ли права на отправку уведомлений
        // Если права есть, отправим уведомление
        const notification = new Notification(title, options);

        function focusWindow() {
            window.focus();
        }

        notification.onclick = focusWindow;
    } else if (Notification.permission !== 'denied') {  // Если прав нет, пытаемся их получить
        // noinspection JSIgnoredPromiseFromCall
        Notification.requestPermission(function (permission) {
            // Если права успешно получены, отправляем уведомление
            if (permission === 'granted') {
                const notification = new Notification(title, options);

                notification.onclick = focusWindow;
            } else {
                // Юзер отклонил наш запрос на показ уведомлений
                console.log('Вы запретили показывать уведомления');
            }
        });
    } else {
        // Пользователь ранее отклонил наш запрос на показ уведомлений
    }
}


if (Notification.permission === 'default') {
    // noinspection JSIgnoredPromiseFromCall
    Notification.requestPermission();
}
