/** @module candidates */

// Imports
import ripplet from 'ripplet.js';
import addRipplet from './tools';
import cookie from './cookie';
import notifications from './notifications';
import { selectTxt } from './settings';
import { oneSpace, toTitle } from './stringUtilities';
import winner from './winner';


// Variables
const firstBlock = document.querySelector('.block');
const firstName = firstBlock.querySelector('.name');
const firstCost = firstBlock.querySelector('.cost');
const firstKpLink = firstBlock.querySelector('.kp-link');
const firstClearRowBtn = firstBlock.querySelector('.btn');

const buyBlock = document.querySelector('.block-buy');
const buyText = document.querySelector('.block-buy span');
const buyInput = buyBlock.querySelector('.cost-buy');
const buyClear = buyBlock.querySelector('.btn');
const buyCookie = cookie.get('buyCost');

const modalOverlay = document.getElementById('modal-overlay');
const modal = document.getElementById('modal');
const stopBtn = document.getElementById('stop-btn');
const addBtn = document.getElementById('add-btn');
const resetButton = document.getElementById('reset-icon');
const area = document.getElementById('candidates-area');

const defaultSize = 16.2; // vw
const defaultMargin = 2.96; // vw
const highestMargin = 35.71; // vw
let maxSize = defaultSize;


// Functions
/**
 * Add <link> element to head with type
 *
 * @param {string} type - type of event (preload, prefetch, etc.)
 * @param {string} url - address to load
 */
function addHint(type, url) {
  const el = document.createElement('link');
  if (!type || !url) return;
  el.setAttribute('rel', type);
  el.setAttribute('href', url);
  document.head.appendChild(el);
}

/**
 * Change width of element
 *
 * @private
 * @param {Object} element - element, which width to change
 * @param {Number} width - width value
 */
function applyWidth(element, width) {
  element.style.width = `${width}vw`;
}

/**
 * Trim name element value
 *
 * @private
 * @param {Object} nameEl - name input
 */
function trimValue(nameEl) {
  nameEl.value = nameEl.value.trim();
}

/**
 * Sort name and cost inputs by cost value
 *
 */
function sortCandidates() {
  const names = Array.from(document.getElementsByClassName('name'));
  const costs = Array.from(document.getElementsByClassName('cost'));
  let total = [];

  names.forEach((name, i) => {
    const cost = costs[i];
    const nameVal = name.value;
    const costVal = Number(cost.value);
    const nameTitle = name.getAttribute('title');
    const costTitle = cost.getAttribute('title');
    const link = name.parentElement.parentElement.querySelector('.kp-link').href;

    total.push({
      nameVal,
      costVal,
      nameTitle,
      costTitle,
      link,
    });
  });

  total = total.sort((e1, e2) => e1.costVal - e2.costVal)
    .reverse();

  names.forEach((name, i) => {
    const totalE = total[i];
    let { costVal } = totalE;
    costVal = costVal ? Number(costVal) : '';
    name.value = totalE.nameVal;
    costs[i].value = costVal;
    name.setAttribute('title', totalE.nameTitle);
    costs[i].setAttribute('title', totalE.costTitle);
    name.parentElement.parentElement.querySelector('.kp-link').href = totalE.link;
  });
}

/**
 * Change sizes of all name inputs
 *
 * @param {Object} nameEl - name input
 */
function changeSize(nameEl) {
  const names = Array.from(document.getElementsByClassName('name'));
  const factor = 1.1;
  const delta = nameEl.value.length - 10;
  let width;
  let margin;

  if (delta > 0) {
    width = Number((defaultSize + delta * factor).toFixed(2));
    margin = Number((defaultMargin + delta * factor).toFixed(2));
    margin = margin > highestMargin ? highestMargin : margin;
  } else if (names.length === 1) {
    maxSize = defaultSize;

    names[0].removeAttribute('style');
    addBtn.removeAttribute('style');
    buyText.removeAttribute('style');
  }

  if (width && width > maxSize) {
    maxSize = width;

    names.forEach(name => applyWidth(name, width));
    addBtn.style.width = `${width + 10}vw`;
    buyText.style.marginRight = `${margin}vw`;
  }
}

/**
 * Make values of first name and cost elements empty
 *
 */
function clearFirstRow() {
  firstName.value = '';
  firstCost.value = '';
  firstName.setAttribute('title', 'Фильм, игра, etc');
  firstCost.setAttribute('title', 'Сумма');
  firstKpLink.href = 'https://www.kinopoisk.ru';
  changeSize(firstName);
  sortCandidates();
  // To reset buy position
  if (window.isBuy) window.isBuy = false;
}

/**
 * Remove row from list
 *
 * @param {Object} delBtn - block delete button
 */
function removeRow(delBtn) {
  const names = document.getElementsByClassName('name');

  // Remove .block
  delBtn.parentElement.parentElement.remove();

  // Get back to default size after delete last non-empty row
  if (names.length === 1 && !names[0].value) {
    maxSize = defaultSize;
    names[0].removeAttribute('style');
    addBtn.removeAttribute('style');
    buyText.removeAttribute('style');
  }
}

/**
 * Set title attribute to cost input
 *
 * @param {Object} costEl - cost input
 */
function changeTitle(costEl) {
  const cost = costEl.value ? `: ${costEl.value} ₽` : '';
  costEl.setAttribute('title', `Сумма${cost}`);
}

/**
 * Eval cost input value to calculate
 *
 * @param {Object} costEl - cost input
 */
function checksum(costEl) {
  let calc = costEl.value.replace(/[^\d+*/,.-]/g, '')
    .replace(/,/, '.');

  try {
    // eslint-disable-next-line no-eval
    calc = eval(calc);
    if (Number.isNaN(calc) || !Number.isFinite(calc)) {
      costEl.value = '';
    } else {
      calc = calc <= 0 ? '' : Number(Number(calc)
        .toFixed(2));
      costEl.value = calc;
    }
  } catch {
    costEl.value = '';
  }
}

/**
 * Check if cost value is already > buy
 *
 * @param {Object} costEl - cost input
 * @see firstCost
 */
function checkOnBuy(costEl) {
  const need = Number(buyInput.value);
  const curr = Number(costEl.value);
  const name = winner.decorate(toTitle(costEl.previousElementSibling.value));

  if (!need || !name || curr < need) return;

  if (window.started) {
    window.isBuy = true;
    window.buyWinner = name;
    window.buyCost = curr;
    stopBtn.click();
  } else {
    modalOverlay.onclick = () => {
      modal.classList.add('closed');
      modalOverlay.classList.add('closed');
      document.title = 'Аукцион';
    };

    modal.querySelector('p').innerText = `${name} выкупили, аж за ${curr} ₽ Pog!`;
    modalOverlay.classList.remove('closed');
    modal.classList.remove('closed');
    notifications.playNotificationSound();
    notifications.sendNotification('Аукцион окончен!', `Выкупили ${name}!`);
    document.title = `${name} выкупили!`;
  }
}

/**
 * Set href attribute to sibling kp-link
 *
 * @param {Object} nameEl - name input
 */
function createLink(nameEl) {
  const name = nameEl.value;
  let link;
  if (name) {
    link = nameEl.parentElement.parentElement.querySelector('.kp-link');
    link.href = encodeURI(`https://www.kinopoisk.ru/s/type/all/find/${name}/`);
    // link.setAttribute('title', `Искать ${name}`);
    nameEl.setAttribute('title', toTitle(name));
  } else {
    nameEl.parentElement.parentElement.querySelector('.kp-link').href = 'https://www.kinopoisk.ru';
    nameEl.setAttribute('title', 'Фильм, игра, etc');
  }
}

/**
 * Cut more than 2 spaces to one
 *
 * @private
 * @param {Object} nameEl - name input
 */
function oneSpacedValue(nameEl) {
  nameEl.value = oneSpace(nameEl.value);
}

/**
 * Add row to list through copy first block
 *
 * @param {string} [nameVal] - name of position
 * @param {string} [costVal] - cost of position
 *
 */
function createBlock(nameVal = '', costVal = '') {
  const section = firstBlock.cloneNode(true);
  const name = section.querySelector('.name');
  const cost = section.querySelector('.cost');
  const link = section.querySelector('.kp-link');
  const btn = section.querySelector('.btn');
  const delIcon = btn.querySelector('img');
  const fromDA = nameVal && costVal;

  name.value = nameVal;
  cost.value = costVal;

  addRipplet([name, cost, link, btn]);

  btn.onclick = () => removeRow(btn);
  cost.onchange = () => {
    checksum(cost);
    checkOnBuy(cost);
    changeTitle(cost);
    sortCandidates();
  };
  name.onchange = () => changeSize(name);
  name.onkeyup = () => {
    createLink(name);
    changeSize(name);
  };

  delIcon.setAttribute('src', 'img/icons/material/delete.svg');
  delIcon.setAttribute('alt', 'Удалить');
  delIcon.setAttribute('title', 'Удалить');
  link.setAttribute('title', 'Кинопоиск');

  if (fromDA) {
    checkOnBuy(cost);
    createLink(name);
    changeTitle(cost);
  } else {
    name.setAttribute('title', 'Фильм, игра, etc');
    cost.setAttribute('title', 'Сумма');
    link.setAttribute('href', 'https://www.kinopoisk.ru');
  }

  area.insertBefore(section, area.lastElementChild);
  section.classList.add('visible');

  if (fromDA) {
    addHint('prefetch prerender', link.getAttribute('href'));
    changeSize(name);
    sortCandidates();
  } else {
    name.focus();
  }
}

/**
 * Works on click addBtn
 *
 * @private
 * @param {Object} args - arguments object for ripplet
 */
function addBtnClick(...args) {
  createBlock();
  ripplet(args[0]);
}


// Exec
addRipplet([firstName, firstCost, firstKpLink,
  firstClearRowBtn, buyInput, buyClear, resetButton]);

firstName.onchange = () => {
  changeSize(firstName);
  trimValue(firstName);
};
firstName.onkeyup = () => {
  createLink(firstName);
  changeSize(firstName);
  oneSpacedValue(firstName);
};
firstCost.onchange = () => {
  checksum(firstCost);
  checkOnBuy(firstCost);
  changeTitle(firstCost);
  sortCandidates();
};
firstClearRowBtn.onclick = clearFirstRow;

addBtn.onclick = addBtnClick;
resetButton.onclick = () => {
  while (area.children.length > 3) {
    area.children[area.children.length - 2].remove();
  }
  clearFirstRow();
  firstName.focus();
  // To reset buy position
  window.isBuy = false;
};

buyInput.value = buyCookie || '';
changeTitle(buyInput);

buyClear.onclick = () => {
  buyInput.value = '';
  buyInput.setAttribute('title', 'Сумма выкупа');
  cookie.del('buyCost');
};
buyInput.onchange = () => {
  checksum(buyInput);
  changeTitle(buyInput);
  if (buyInput.value) {
    cookie.set('buyCost', buyInput.value);
  } else {
    cookie.del('buyCost');
  }
};
buyInput.onclick = () => selectTxt(buyInput);


// Exports
export {
  sortCandidates, changeTitle, checkOnBuy, createBlock,
};
