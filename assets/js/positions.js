import ripplet from 'ripplet.js';
import notification from './notifications';
import {toTitle, trim} from './stringUtilities';

export {returnWinner, showWinner};

const modal = document.getElementById('modal');
const modalOverlay = document.getElementById('modal-overlay');

modalOverlay.addEventListener('click', ripplet);

// Open modal window with winner name
const showWinner = isBuy => {
  const timerElement = document.getElementById('timer');
  let winner = returnWinner();

  if (isBuy) {
    modal.children[0].innerText = `"${buyWinner}" выкупили, аж за ${buyCost}₽ Pog!`;
    document.title = buyWinner.length > 30 ?
                     `${buyWinner.substring(0, 30)}... выкупили!` :
                     `${buyWinner} выкупили!`;

    notification.sendNotification('Аукцион окончен!',
                                 `Выкупили "${buyWinner.length > 30 ? 
                                       `${buyWinner.substring(0, 30)}...` : buyWinner}"!`);

  } else {
    modal.children[0].innerText = `${winner} победил!`;

    document.title = winner.length > 30 ?
                     `${winner.substring(0, 30)}... победил!` :
                     `${winner} победил!`;

    if (winner === 'Никто не ') {
      notification.sendNotification('Аукцион окончен!', 'Никто не победил :(');

    } else {
      notification.sendNotification('Аукцион окончен!',
                                   `Победа ${winner.length > 30 ? 
                                         `${winner.substring(0, 30)}..."` : winner}!`);
    }
  }

  timerElement.classList.remove('danger');

  modalOverlay.classList.toggle('closed');
  modal.classList.toggle('closed');

  notification.playNotificationSound();

  modalOverlay.onclick = function() {
    modal.classList.toggle('closed');
    modalOverlay.classList.toggle('closed');

    document.title = 'Аукцион β';
  };
};


const returnWinner = () => {
  const names = document.getElementsByClassName('name');
  const costs = document.getElementsByClassName('cost');
  let winner = undefined;
  let maxCost = null;

  for (let i = 0; i < Math.min(names.length, costs.length); ++i) {
    const name = names[i].value;
    const cost = +costs[i].value;

    if (cost > maxCost) {
      maxCost = cost;
      winner = name ? name : winner;
    }
  }

  if (maxCost) {
    winner = toTitle(winner);
  }

  return winner ? `"${trim(winner)}"` : 'Никто не ';
};
