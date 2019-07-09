/** @module winner */

// Imports
import ripplet from 'ripplet.js';
import notification from './notifications';
import { toTitle } from './stringUtilities';


// Variables
const modal = document.getElementById('modal');
const modalOverlay = document.getElementById('modal-overlay');
const timerElement = document.getElementById('timer');


// Functions
/**
 * Return raw position with max cost
 *
 * @return {(undefined|?string)} - if !cost - undefined,
 *                                 if !name - null,
 *                                 if name && cost - string
 */
const returnWinner = () => {
  const names = document.getElementsByClassName('name');
  const costs = Array.from(document.getElementsByClassName('cost'))
    .map(cost => Number(cost.value));
  const maxCost = Math.max.apply(null, costs);

  if (!maxCost) return;
  const winner = names[costs.indexOf(maxCost)].value;
  // eslint-disable-next-line consistent-return
  return winner || null;
};

/**
 * Convert winner to human readable string
 *
 * @private
 * @param {(undefined|?string)} winner - winner name
 * @see returnWinner
 * @return {string} - human readable result
 */
const humanizeWinner = winner => (winner || (winner === null ? 'Пустая позиция' : 'Никто не'));

/**
 * Append last word to result phrase
 *
 * @private
 * @param {(undefined|?string)} winner - winner name,
 *                                       result from decorateWinner
 * @see decorateWinner
 * @return {string} - winner name + case ending
 */
const addEnding = (winner) => {
  let ending;
  if (winner) {
    ending = 'победил';
  } else {
    ending = winner === null ? 'победила' : 'победил';
  }
  return `${humanizeWinner(winner)} ${ending}!`;
};

/**
 * Add dots if larger than 20 chars and quotes lazy
 *
 * @private
 * @param {(undefined|?string)} winner - winner name
 * @see returnWinner
 * @return {(undefined|?string)} - if !cost - undefined,
 *                                 if !name - null,
 *                                 if name && cost - string with handsome decoration
 */
const decorateWinner = (winner) => {
  if (!winner) return winner;
  const titled = toTitle(winner)
    .trim();
  const formatted = titled.length < 20
    ? titled
    : `${titled.substr(0, 20)}...`;
  return JSON.stringify(formatted);
};

/**
 * Join addEnding call with decorate
 *
 * @param {(undefined|?string)} winner - winner name from returnWinner
 * @see returnWinner
 * @return {string} - result of winner computing
 */
const compileWinner = winner => addEnding(decorateWinner(winner));

/**
 * Open modal window with winner result
 *
 * @param {string} [result] - ready compiled winner to show
 */
const showWinner = (result) => {
  const compiled = result || compileWinner(returnWinner());

  if (!window.isBuy) {
    modal.querySelector('p').innerText = compiled;
    notification.sendNotification('Аукцион окончен!', compiled);
    document.title = compiled;
  } else {
    const buyed = window.buyWinner;
    modal.querySelector('p').innerText = `${buyed} выкупили, аж за ${window.buyCost}₽ Pog!`;
    document.title = `${compiled} выкупили!`;
    notification.sendNotification('Аукцион окончен!', `Выкупили ${buyed}`);
  }

  timerElement.classList.remove('danger');
  notification.playNotificationSound();
  modalOverlay.classList.toggle('closed');
  modal.classList.toggle('closed');
  modalOverlay.onclick = () => {
    modal.classList.toggle('closed');
    modalOverlay.classList.toggle('closed');

    document.title = 'Аукцион';
  };
};


// Exec
modalOverlay.addEventListener('click', ripplet);
document.onkeyup = (e) => {
  if (!modalOverlay.classList.contains('closed') && e.key === 'Escape') {
    modalOverlay.click();
  }
};


// Exports
const winner = {
  show: showWinner,
  return: returnWinner,
  compile: compileWinner,
  addEnding,
  decorate: decorateWinner,
  humanize: humanizeWinner,
};
export default winner;
