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
                    document.title = "Аукцион";
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


// DonationAlerts
let started = false;
const socket = io('socket.donationalerts.ru:3001', {'reconnection': false});
const token = getCookie('token');
if (token) socket.emit('add-user', {'token': token, 'type': 'minor'});
socket.on('donation', function (msg) {
    if (started) {
        let msgJSON = JSON.parse(msg);
        if (msgJSON['alert_type'] === '1') {
            // console.log(msgJSON);
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
                    costs[i].value = amount + cost;
                    inserted = true;
                    break;
                }
            }

            if (!inserted) {
                let div = document.createElement('div');
                div.className = 'block';

                div.innerHTML =
                    `<label>
                       <input class="name" type="text" placeholder="Позиция" 
                         onchange="createLink(this)" title="Фильм, игра, etc" value="${message}" autocomplete="off"> 
                       <input class="cost" type="number" min="0" 
                         onchange="sortCandidates()" placeholder="₽" title="Сумма" value="${amount}" autocomplete="off">
                     </label>
                     <a href="https://www.kinopoisk.ru" target="_blank" class="kp-link" 
                       title="Ссылка на кинопоиск">
                       <i class="material-icons">video_library</i></a>
                     <button type="button" class="btn" onclick="removeRow(this)" title="Удалить">
                       <i class="material-icons">delete</i>
                     </button>`;

                candidatesArea.insertBefore(div, candidatesArea.lastElementChild);

                sortCandidates();

                for (let i = 0; i < names.length; i++) {
                    createLink(names[i]);
                }
            }
        }
    }
});

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

        total.push({
            'name': name,
            'cost': cost
        });
    }

    total = total.sort(function (e1, e2) {
        return e1.cost - e2.cost;
    }).reverse();

    // console.log(total);

    for (let i = 0; i < Math.min(names.length, costs.length); i++) {
        names[i].value = total[i].name;
        let cost = total[i].cost;
        costs[i].value = cost == 0 ? '' : cost;
    }
}


function clearRow() {
    let candidateArea = document.getElementById('candidates-area');
    let label = candidateArea.children[0].children[0];
    let link = candidateArea.children[0].children[1];

    label.children[0].value = '';
    label.children[1].value = '';
    link.href = 'https://www.kinopoisk.ru';
}


function removeRow(delBtn) {
    delBtn.parentNode.parentNode.removeChild(delBtn.parentNode);
}


function createLink(nameElement) {
    let name = nameElement.value;
    if (name) {
        nameElement.parentNode.parentNode.children[1].href =
            `https://www.kinopoisk.ru/s/type/all/find/${name}/`
    } else {
        nameElement.parentNode.parentNode.children[1].href =
            'https://www.kinopoisk.ru'
    }
}


const addBtn = document.getElementById('add-btn');
let candidatesArea = document.getElementById('candidates-area');

addBtn.onclick = function () {
    let div = document.createElement('div');
    div.className = 'block';

    div.innerHTML = `<label>
                       <input class="name" type="text" placeholder="Позиция" 
                         onchange="createLink(this)" title="Фильм, игра, etc" autocomplete="off"> 
                       <input class="cost" type="number" min="0" 
                         onchange="sortCandidates()" placeholder="₽" title="Сумма" autocomplete="off">
                     </label>
                     <a href="https://www.kinopoisk.ru" target="_blank" class="kp-link" 
                       title="Ссылка на кинопоиск">
                       <i class="material-icons">video_library</i></a>
                     <button type="button" class="btn" onclick="removeRow(this)" title="Удалить">
                       <i class="material-icons">delete</i>
                     </button>`;

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
        body.style.backgroundImage = "url('static/38263.jpg')";
    }
}


// function componentToHex(c) {
//     var hex = c.toString(16);
//     return hex.length == 1 ? "0" + hex : hex;
// }
//
// function rgbToHex(r, g, b) {
//     return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
// }
//
//
// function padZero(str, len) {
//     len = len || 2;
//     var zeros = new Array(len).join('0');
//     return (zeros + str).slice(-len);
// }


// function invertColor(hex, bw) {
//     if (hex.indexOf('#') === 0) {
//         hex = hex.slice(1);
//     }
//     // convert 3-digit hex to 6-digits.
//     if (hex.length === 3) {
//         hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
//     }
//     if (hex.length !== 6) {
//         throw new Error('Invalid HEX color.');
//     }
//     var r = parseInt(hex.slice(0, 2), 16),
//         g = parseInt(hex.slice(2, 4), 16),
//         b = parseInt(hex.slice(4, 6), 16);
//     if (bw) {
//         // http://stackoverflow.com/a/3943023/112731
//         return (r * 0.299 + g * 0.587 + b * 0.114) > 186
//             ? '#000000'
//             : '#FFFFFF';
//     }
//     // invert color components
//     r = (255 - r).toString(16);
//     g = (255 - g).toString(16);
//     b = (255 - b).toString(16);
//     // pad each with zeros and return
//     return "#" + padZero(r) + padZero(g) + padZero(b);
// }


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
    setCookie('bg-url', bgURLInput.value);
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
    setCookie('accent', dominantRGB);
    });
};

clearBGURLBtn.onclick = function () {
    bgURLInput.value = '';
    saveBGURLBtn.click();
    styleElement.innerText = `.name,.cost,#bg-url,.danger,#da-url{color:#f39727!important}`;
    setCookie('accent', '');
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
    token = token.substr(token.lastIndexOf('token=') + 6);
    setCookie('token', token);
    alert('Токен сохранен');
    location.reload();
};

clearDAURLBtn.onclick = function () {
    daURL.value = '';
    setCookie('token', '');
    location.reload();
};