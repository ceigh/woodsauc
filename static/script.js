// DonationAlerts
let started = false;
try {
    const socket = io('https://socket.donationalerts.ru:443', {'reconnection': false});
    const token = getCookie('token');
    if (token) socket.emit('add-user', {'token': token, 'type': 'minor'});
    socket.on('donation', function (msg) {
    if (started) {
        let msgJSON = JSON.parse(msg);
        if (msgJSON['alert_type'] === 1) {
            let message = msgJSON['message'];
            let amount = msgJSON['amount'];
            // let currency = msgJSON['currency'];
            // console.log(message, amount, currency);

            let names = document.getElementsByClassName('name');
            let costs = document.getElementsByClassName('cost');

            let inserted = false;
            for (let i = 0; i < Math.min(names.length, costs.length); i++) {
                let name = names[i].value;
                let cost = +costs[i].value;

                if (name && message.toLowerCase().includes(name.toLowerCase())) {
                    // console.log(`${name} in ${message}`);
                    if (confirm(`Добавить к "${name}" ${amount}р?`)) {
                        costs[i].value = amount + cost;
                    }
                    inserted = true;
                    break;
                }
            }

            if (!inserted && confirm(`Создать "${message}" с ${amount}р?`)) {
                let div = document.createElement('div');
                div.className = 'block';

                div.innerHTML =
                    `<label>
                       <input class="name" type="text" onkeyup="changeSize(this);createLink(this)"
                         title="Фильм, игра, etc" value="${message}" autocomplete="off" placeholder="Позиция">
                       <input class="cost" type="number" min="0" 
                         onkeyup="changeTitle(this)" onchange="sortCandidates()" placeholder="₽" title="Сумма" 
                         value="${amount}" autocomplete="off">
                     </label>
                     <span>
                     <a href="https://www.kinopoisk.ru" target="_blank" class="kp-link" 
                       title="Ссылка на кинопоиск"><img src="static/icons/round-video_library-24px.svg" 
                       alt="Иконка ссылки на кинопоиск"></a>
                     <button type="button" class="btn" onclick="removeRow(this)" title="Удалить">
                       <img src="static/icons/round-delete-24px.svg" alt="Иконка удаления">
                     </button>
                     </span>`;

                candidatesArea.insertBefore(div, candidatesArea.lastElementChild);

                sortCandidates();

                for (let i = 0; i < names.length; i++) {
                    createLink(names[i]);
                }
            }
        }
    }
});
} catch (e) {
    console.log("Нет подключения, автодобавление не будет работать.");
}

//Dynamic inputs
const defaultSize = 16.2;
let maxSize = defaultSize;

let styleForSize = document.createElement('style');
styleForSize.appendChild(document.createTextNode(
    `.name{width:${defaultSize}vw}`));
document.head.appendChild(styleForSize);

function changeSize(nameElement) {
    let width;
    let delta = nameElement.value.length - 12;
    let names = document.getElementsByClassName('name');

    if (delta > 0) {
        width = Math.round(16.2 + delta * 1.2);
    } else if (names.length === 1) {
        maxSize = defaultSize;
        styleForSize.innerText =
            `.name{width:${defaultSize}vw}#add-btn{width:${defaultSize + 10}vw}`;
    }

    if (width && width > maxSize) {
        maxSize = width;
        styleForSize.innerText = `.name{width:${width}vw}#add-btn{width:${width + 10}vw!important}`;
    }
}

// Timer
function returnWinner() {
    let winner = "Никто не ";
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

    if (maxCost) winner = winner[0].toUpperCase() + winner.substring(1);
    return winner;
}


function startTimer() {
    started = true;
    startBtn.onclick = undefined;

    const timer = document.getElementById('timer');
    let time = timer.innerHTML;
    let arr = time.split(':');
    let m = arr[0];
    let s = arr[1];
    let ms = arr[2];

    if (ms == 0) {
        if (s == 0) {
            if (m == 0) {
                //Modal
                const modal = document.querySelector('#modal');
                const modalOverlay = document.querySelector('#modal-overlay');
                started = false;
                timer.classList.remove('danger');

                modalOverlay.onclick = function() {
                    modal.classList.toggle('closed');
                    modalOverlay.classList.toggle('closed');
                    document.title = "Аукцион β";
                };

                let winner = returnWinner();

                modal.children[0].innerText = `${winner} победил!`;

                modal.classList.toggle('closed');
                modalOverlay.classList.toggle('closed');

                document.title = `${winner} победил!`;

                // Get back play button functional
                startBtn.onclick = function () {
                    startTimer();
                };

                return;
            }

            m--;
            s = 59;

            if (m < 10) m = `0${m}`;
        }

        s--;

        if (s < 30 && m == 0) {
            timer.className = ('danger')
        } else timer.classList.remove('danger');

        if (s < 10) s = `0${s}`;

        let winner = returnWinner();
        winner = winner === "Никто не " ? '' : ` - ${winner}`;
        document.title = `${m}:${s}${winner}`;

        ms = 99;
    } else ms--;

    if (ms < 10) ms = `0${ms}`;

    timer.innerHTML = `${m}:${s}:${ms}`;
    setTimeout(startTimer, 10);
}


const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('stop-btn');
const plusBtn = document.getElementById('plus-btn');
const plusTwoBtn = document.getElementById('plus-two-btn');
const minusBtn = document.getElementById('minus-btn');

startBtn.onclick = function () {
    startTimer();
};

resetBtn.onclick = function () {
    timer.innerHTML = '00:00:00';
};

plusBtn.onclick = function () {
    let time = timer.innerHTML;
    let arr = time.split(':');
    let m = arr[0];
    let s = arr[1];
    let ms = arr[2];
    m++;
    if (m < 10) m = `0${m}`;
    timer.innerHTML = `${m}:${s}:${ms}`;
};

plusTwoBtn.onclick = function () {
    let time = timer.innerHTML;
    let arr = time.split(':');
    let m = arr[0];
    let s = arr[1];
    let ms = arr[2];
    m++;
    m++;
    if (m < 10) m = `0${m}`;
    timer.innerHTML = `${m}:${s}:${ms}`;
};

minusBtn.onclick = function () {
    let time = timer.innerHTML;
    let arr = time.split(':');
    let m = arr[0];
    let s = arr[1];
    let ms = arr[2];
    m--;
    if (m < 0) {
        m = '00';
    } else if (m < 10) {
        m = `0${m}`;
    }
    timer.innerHTML = `${m}:${s}:${ms}`;
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
        costs[i].value = cost == 0 ? '' : cost;
        names[i].value = total[i].name;
        names[i].setAttribute('title', total[i].titleName);
        costs[i].setAttribute('title', total[i].titleCost);
        names[i].parentNode.parentNode.children[1].children[0].href = total[i].link;
    }
}


function clearRow() {
    let candidateArea = document.getElementById('candidates-area');
    let label = candidateArea.children[0].children[0];
    let link = candidateArea.children[0].children[1].children[0];

    label.children[0].value = '';
    label.children[1].value = '';
    label.children[0].setAttribute('title', 'Фильм, игра, etc');
    label.children[1].setAttribute('title', 'Сумма');
    link.href = 'https://www.kinopoisk.ru';

    changeSize(label.children[0]);
}


function removeRow(delBtn) {
    delBtn.parentNode.parentNode.parentNode.removeChild(delBtn.parentNode.parentNode);
    // Get back to default size after delete last non-empty row
    let names = document.getElementsByClassName('name');

    if (names.length === 1 && !names[0].value) {
        maxSize = defaultSize;
        styleForSize.innerText =
            `.name{width:${defaultSize}vw}#add-btn{width:${defaultSize + 10}vw}`;
    }
}


function createLink(nameElement) {
    let name = nameElement.value;
    if (name) {
        nameElement.parentNode.parentNode.children[1].children[0].href =
            `https://www.kinopoisk.ru/s/type/all/find/${name}/`;
        nameElement.setAttribute('title', name);
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
    div.innerHTML = `<label>
                       <input class="name" type="text" onkeyup="changeSize(this);createLink(this)" 
                         title="Фильм, игра, etc" autocomplete="off" placeholder="Позиция">
                       <input class="cost" type="number" min="0" 
                         onkeyup="changeTitle(this)" onchange="sortCandidates()" placeholder="₽" title="Сумма" autocomplete="off">
                     </label>
                     <span>
                     <a href="https://www.kinopoisk.ru" target="_blank" class="kp-link" 
                       title="Ссылка на кинопоиск"><img src="static/icons/round-video_library-24px.svg" 
                       alt="Иконка ссылки на кинопоиск"></a>
                     <button type="button" class="btn" onclick="removeRow(this)" title="Удалить">
                       <img src="static/icons/round-delete-24px.svg" alt="Иконка удаления">
                     </button>
                    </span>`;

    candidatesArea.insertBefore(div, candidatesArea.lastElementChild);

    sortCandidates();
};


// Settings
function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}


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
        const propValue = options[propName];
        if (propValue !== true) {
            updatedCookie += "=" + propValue;
        }
    }

    document.cookie = updatedCookie;
}


function changeBG(url) {
    let body = document.getElementsByTagName('body')[0];

    if (url && url !== '') {
        body.style.backgroundImage = `url(${url})`;
    } else {
        body.style.backgroundImage = "url('static/38263.webp')";
    }
}


function sheet(css) {
    let style = document.createElement("style");
	style.appendChild(document.createTextNode(css));
	document.head.appendChild(style);
	return style
}


const showSettingsBtn = document.getElementById('settings-icon').children[0];
const settingsWindow = document.getElementById('settings');
const saveBGURLBtn = document.getElementById('save-bg-url-btn');
const clearBGURLBtn = document.getElementById('clear-bg-url-btn');
const bgURLInput = document.getElementById('bg-url');
const colorExctractor = document.getElementById('color-extractor');
const year = 31622400;
let bgURL = getCookie('bg-url');
let styleElement;

showSettingsBtn.onclick = function () {
    settingsWindow.classList.toggle("closed");
};

let colorCookie = getCookie('accent');
if (colorCookie && colorCookie !== '') {
    styleElement = sheet(`.name,.cost,#bg-url,.danger,#da-url{color:${colorCookie}!important}`);
} else {
    styleElement = sheet(`.name,.cost,#bg-url,.danger,#da-url{color:#f39727!important}`);
}

saveBGURLBtn.onclick = function () {
    setCookie('bg-url', bgURLInput.value, {'expires': year});
    changeBG(getCookie('bg-url'));

    // Change Accent color
    colorExctractor.setAttribute('src', `https://cors-anywhere.herokuapp.com/${bgURLInput.value}`);
    colorExctractor.addEventListener('load', function () {
    const vibrant = new Vibrant(this);
    const swatches = vibrant.swatches();
    // for (const swatch in swatches)
    //     if (swatches.hasOwnProperty(swatch) && swatches[swatch]) {
    //         console.log(swatch, swatches[swatch].getHex())
    //     }

    let dominantRGB = swatches['Vibrant'].getHex();
    styleElement.innerText = `.name,.cost,#bg-url,.danger,#da-url{color:${dominantRGB}!important}`;
    setCookie('accent', dominantRGB, {'expires': year});
    });
};

clearBGURLBtn.onclick = function () {
    bgURLInput.value = '';
    saveBGURLBtn.click();
    styleElement.innerText = `.name,.cost,#bg-url,.danger,#da-url{color:#f39727!important}`;
    setCookie('accent', '', {'expires': year});
};

changeBG(bgURL);
bgURLInput.value = bgURL ? bgURL : '';

//DA URL
const daURL = document.getElementById('da-url');
const saveDAURLBtn = document.getElementById('save-da-url-btn');
const clearDAURLBtn = document.getElementById('clear-da-url-btn');
const tokenCookie = getCookie('token');

daURL.value = tokenCookie ? tokenCookie : '';

saveDAURLBtn.onclick = function () {
    let token = daURL.value;
    setCookie('token', token, {'expires': year});
    alert('Токен сохранен');
    location.reload();
};

clearDAURLBtn.onclick = function () {
    daURL.value = '';
    setCookie('token', '', {'expires': year});
    location.reload();
};


// Close modal on keydown
document.onkeydown = function(e) {
    const modal = document.querySelector('#modal');
    const modalOverlay = document.querySelector('#modal-overlay');

    if(e.key === "Escape" || e.key === "Enter") {
        modal.className = ('closed');
        modalOverlay.className = ('closed');
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
    let candidatesArea = document.getElementById('candidates-area');
    while (candidatesArea.children.length > 2) {
        candidatesArea.removeChild(candidatesArea.children[candidatesArea.children.length-2]);
    }
    clearRow();
};
