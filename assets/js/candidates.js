'use strict';

import ripplet from 'ripplet.js';
import notifications from './notifications';
import settings from './settings';
import winner from  './winner';
import {oneSpace, toTitle, trim} from './stringUtilities';

export {sortCandidates, changeTitle, checkOnBuy, createBlock};

const firstBlock = document.querySelector('.block');
const firstName = firstBlock.querySelector('.name');
const firstCost = firstBlock.querySelector('.cost');
const firstKpLink = firstBlock.querySelector('.kp-link');
const firstClearRowBtn = firstBlock.querySelector('.btn');

const buyBlock = document.querySelector('.block-buy');
const buyText = document.querySelector('.block-buy span');
const buyInput = buyBlock.querySelector('.cost-buy');
const buyClear = buyBlock.querySelector('.btn');
const buyCookie = getCookie('buyCost');

const modalOverlay = document.getElementById('modal-overlay');
const modal = document.getElementById('modal');
const stopBtn = document.getElementById('stop-btn');
const addBtn = document.getElementById('add-btn');
const resetButton = document.getElementById('reset-icon');
const area = document.getElementById('candidates-area');

const defaultSize = 16.2; // vw
const defaultMargin = 2.6; // vw
const highestMargin = 35.25; // vw
let maxSize = defaultSize;
let maxMargin = defaultMargin;

firstName.addEventListener('click', ripplet);
firstCost.addEventListener('click', ripplet);
firstKpLink.addEventListener('click', ripplet);
firstClearRowBtn.addEventListener('click', ripplet);
buyInput.addEventListener('click', ripplet);
buyClear.addEventListener('click', ripplet);
resetButton.addEventListener('click', ripplet);

firstName.onchange = function() {
  changeSize(this);
  trimValue(this);
};
firstName.onkeyup = function() {
  createLink(this);
  changeSize(this);
  oneSpacedValue(this);
};
firstCost.onchange = function() {
  checksum(this);
  checkOnBuy(this);
  changeTitle(this);
  sortCandidates();
};
firstClearRowBtn.onclick = clearFirstRow;

addBtn.onclick = function() {
  createBlock();
  ripplet(arguments[0]);
};
resetButton.onclick = () => {
  while (area.children.length > 3) {
    area.children[area.children.length - 2].remove();
  }
  clearFirstRow();
};

buyInput.value = !buyCookie ? '' : buyCookie;
changeTitle(buyInput);

buyClear.onclick = () => {
  buyInput.value = '';
  buyInput.setAttribute('title', 'Сумма выкупа');
  settings.cookie.delete('buyCost');
};
buyInput.onchange = function () {
  checksum(this);
  changeTitle(this);
  if (this.value) settings.cookie.set('buyCost', this.value);
  else settings.cookie.delete('buyCost');
};


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

    total.push( {nameVal, costVal, nameTitle, costTitle, link} );
  });

  total = total.sort((e1, e2) => e1.costVal - e2.costVal).reverse();

  names.forEach((name, i) => {
    const totalE = total[i];
    let costVal = totalE.costVal;
    costVal = !costVal ? '' : Number(costVal);
    name.value = totalE.nameVal;
    costs[i].value = costVal;
    name.setAttribute('title', totalE.nameTitle);
    costs[i].setAttribute('title', totalE.costTitle);
    name.parentElement.parentElement.querySelector('.kp-link').href = totalE.link;
  });
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
  const cost = !costEl.value ? '' : `: ${costEl.value} ₽`;
  costEl.setAttribute('title', `Сумма${cost}`);
}


/**
 * Eval cost input value to calculate
 *
 * @param {Object} costEl - cost input
 */
function checksum(costEl) {
  let calc = costEl.value.replace(/[^\d+*/,.-]/g, '').replace(/,/, '.');

  try {
    calc = eval(calc);
    if ( isNaN(calc) || !isFinite(calc) ) {
      costEl.value = '';
    } else {
      calc = calc <= 0 ? '' : Number( Number(calc).toFixed(2) );
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
      document.title = 'WoodsAuc';
    };

    modal.querySelector('p').innerText = `${name} выкупили, аж за ${curr}₽ Pog!`;
    modalOverlay.classList.remove('closed');
    modal.classList.remove('closed');
    notifications.playNotificationSound();
    notifications.sendNotification('Аукцион окончен!', `Выкупили ${name}!`);
    document.title = `${name} выкупили!`;
  }
}


/**
 * Change sizes of all name inputs
 *
 * @param {Object} nameEl - name input
 */
function changeSize(nameEl) {
  const names = Array.from( document.getElementsByClassName('name') );
  let delta = nameEl.value.length - 10;
  let width;
  let margin;

  if (delta > 0) {
    width = Number( (defaultSize + delta * 2.1).toFixed(2) );
    margin = Number( (defaultMargin + delta * 2.1).toFixed(2) );
    margin = margin > highestMargin ? highestMargin : margin;
  } else if (names.length === 1) {
    maxSize = defaultSize;
    maxMargin = defaultMargin;

    names[0].removeAttribute('style');
    addBtn.removeAttribute('style');
    buyText.removeAttribute('style');
  }

  if (width && width > maxSize) {
    maxSize = width;
    maxMargin = margin;

    names.forEach(name => name.style.width = `${width}vw`);
    addBtn.style.width = `${width + 10}vw`;
    buyText.style.marginRight = `${margin}vw`;
  }
}


/**
 * Set href attribute to sibling kp-link
 *
 * @param {Object} nameEl - name input
 */
function createLink(nameEl) {
  const name = nameEl.value;

  if (name) {
    nameEl.parentElement.parentElement.querySelector('.kp-link').href =
      encodeURI(`https://www.kinopoisk.ru/s/type/all/find/${name}/`);
    nameEl.setAttribute( 'title', toTitle(name) );
  } else {
    nameEl.parentElement.parentElement.querySelector('.kp-link').href =
      'https://www.kinopoisk.ru';
    nameEl.setAttribute('title', 'Фильм, игра, etc');
  }
}


/**
 * Trim name element value
 *
 * @param {Object} nameEl - name input
 */
function trimValue(nameEl) {
  nameEl.value = trim(nameEl.value);
}


/**
 * Cut more than 2 spaces to one
 *
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
  const div = firstBlock.cloneNode(true);
  const name = div.querySelector('.name');
  const cost = div.querySelector('.cost');
  const link = div.querySelector('.kp-link');
  const btn = div.querySelector('.btn');
  const delIcon = btn.querySelector('img');
  const fromDA = nameVal && costVal;

  name.value = nameVal;
  cost.value = costVal;

  name.addEventListener('click', ripplet);
  cost.addEventListener('click', ripplet);
  link.addEventListener('click', ripplet);
  btn.addEventListener('click', ripplet);

  btn.onclick = function() {
    removeRow(this);
  };
  name.onkeyup = function() {
    createLink(this);
    changeSize(this);
  };
  name.onchange = function() {
    changeSize(this);
  };
  cost.onchange = function() {
    checksum(this);
    checkOnBuy(this);
    changeTitle(this);
    sortCandidates();
  };

  delIcon.setAttribute('src', '/static/img/icons/material/delete.svg');
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

  area.insertBefore(div, area.lastElementChild);
  div.classList.add('visible');

  if (fromDA) {
    changeSize(name);
    sortCandidates();
  } else {
    name.focus();
  }
}
