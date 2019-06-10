import notification from './notifications';
import {toTitle, trim} from './stringUtilities';

const modal = document.getElementById('modal');
const modalOverlay = document.getElementById('modal-overlay');
const timerElement = document.getElementById('timer');

/**
  * Open modal window with winner result
  *
  * @param {boolean} isBuy - a variable that indicates,
  *                          that the winner is purchased
  * @param {string} [result] - ready compiled winner to show
  */
const showWinner = (isBuy, result = undefined) => {
  if (!result) result = compileWinner( returnWinner() );

  if (isBuy) {
    modal.children[0].innerText = `"${buyWinner}" выкупили, аж за ${buyCost}₽ Pog!`;
    document.title = buyWinner.length > 30 ?
                     `${buyWinner.substring(0, 30)}... выкупили!` :
                     `${buyWinner} выкупили!`;

    notification.sendNotification('Аукцион окончен!',
                                 `Выкупили "${buyWinner.length > 30 ? 
                                       `${buyWinner.substring(0, 30)}...` : buyWinner}"!`);

  } else {
    modal.children[0].innerText = result;
    notification.sendNotification('Аукцион окончен!', result);
    document.title = result;
  }

  timerElement.classList.remove('danger');

  notification.playNotificationSound();

  modalOverlay.classList.toggle('closed');
  modal.classList.toggle('closed');

  modalOverlay.onclick = () => {
    modal.classList.toggle('closed');
    modalOverlay.classList.toggle('closed');

    document.title = 'WoodsAuc';
  };
};

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
  return !winner ? null : winner;
};

/**
  * Join addEnding call with decorate
  *
  * @param {(undefined|?string)} winner - winner name from returnWinner
  * @see returnWinner
  * @return {string} - result of winner computing
  */
const compileWinner = winner => {
  return addEnding(decorateWinner(winner));
};

/**
  * Append last word to result phrase
  *
  * @param {(undefined|?string)} winner - winner name,
  *                                       result from decorateWinner
  * @see decorateWinner
  * @return {string} - winner name + case ending
  */
const addEnding = winner => {
  const ending = winner ? 'победил' : winner === null ? 'победила' : 'победил';
  return `${humanizeWinner(winner)} ${ending}!`;
};

/**
  * Add dots if larger than 30 chars and quotes lazy
  *
  * @param {(undefined|?string)} winner - winner name
  * @see returnWinner
  * @return {(undefined|?string)} - if !cost - undefined,
  *                                 if !name - null,
  *                                 if name && cost - string with handsome decoration
  */
const decorateWinner = winner => {
  if (!winner) return winner;
  winner = toTitle(trim(winner));
  winner = winner.length < 30 ? winner : `${winner.substr(0, 30)}...`;
  return JSON.stringify(winner);
};

/**
  * Convert winner to human readable string
  *
  * @param {(undefined|?string)} winner - winner name
  * @see returnWinner
  * @return {string} - human readable result
  */
const humanizeWinner = winner => {
  return winner ? winner : winner === null ? 'Пустая позиция' : 'Никто не';
};

const winner = {
  'show': showWinner,
  'return': returnWinner,
  'compile': compileWinner,
  'addEnding': addEnding,
  'decorate': decorateWinner,
  'humanize': humanizeWinner
};

export default winner;
