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
                const modal = document.querySelector("#modal");
                const modalOverlay = document.querySelector("#modal-overlay");

                modalOverlay.onclick = function() {
                    modal.classList.toggle("closed");
                    modalOverlay.classList.toggle("closed");
                    document.title = "Аукцион";
                };

                let winner = returnWinner();

                modal.children[0].innerText = `${winner} победил!`;

                modal.classList.toggle("closed");
                modalOverlay.classList.toggle("closed");

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
        costs[i].value = total[i].cost;
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
    nameElement.parentNode.parentNode.children[1].href =
        `https://www.kinopoisk.ru/s/type/all/find/${name}/`
}


const addBtn = document.getElementById('add-btn');
let candidatesArea = document.getElementById('candidates-area');

addBtn.onclick = function () {
    let div = document.createElement('div');
    div.className = 'block';

    div.innerHTML = `<label>
                       <input class="name" type="text" placeholder="Фильм" onchange="createLink(this)"> 
                       <input class="cost" type="number" min="0" 
                       onchange="sortCandidates()" placeholder="₽">
                     </label>
                     <a href="https://www.kinopoisk.ru" target="_blank" class="kp-link">
                       <i class="material-icons">video_library</i></a>
                     <button type="button" class="btn" onclick="removeRow(this)">
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

    if (typeof expires == "number" && expires) {
        const d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
    }

    if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
    }

    value = encodeURIComponent(value);

    let updatedCookie = name + "=" + value;

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


const showSettingsBtn = document.getElementById('settings-icon').children[0];
const settingsWindow = document.getElementById('settings');
const saveBGURLBtn = document.getElementById('save-bg-url-btn');
const clearBGURLBtn = document.getElementById('clear-bg-url-btn');
const bgURLInput = document.getElementById('bg-url');
let bgURL = getCookie('bg-url');

showSettingsBtn.onclick = function () {
    settingsWindow.classList.toggle("closed");
};

saveBGURLBtn.onclick = function () {
    setCookie('bg-url', bgURLInput.value);
    changeBG(getCookie('bg-url'));
};

clearBGURLBtn.onclick = function () {
    bgURLInput.value = '';
    saveBGURLBtn.click();
};

changeBG(bgURL);
bgURLInput.value = bgURL ? bgURL : '';
