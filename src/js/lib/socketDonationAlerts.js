// Imports
import io from 'socket.io-client';
import cookie from './cookie';
import notifications from './notifications';
import winner from './winner';

import { oneSpace, toTitle } from './stringUtilities';

import {
  changeTitle, checkOnBuy, createBlock, sortCandidates,
} from './candidates';


// Variables
const socketUrl = 'https://socket.donationalerts.ru:443';
const socketCfg = { reconnection: true };


// Functions
/**
 * Add donation value on needed position
 *
 * @private
 * @param {string} message - donation message
 * @param {Number} amount - donation value
 *
 */
const addToPosition = (message, amount) => {
  const names = Array.from(document.getElementsByClassName('name'));
  const costs = Array.from(document.getElementsByClassName('cost'));

  costs.some((cost, i) => {
    const nameVal = names[i].value;
    const costVal = Number(cost.value);

    const isIncludes = nameVal && message.toLowerCase()
      .includes(nameVal.toLowerCase());

    if (isIncludes) {
      cost.value = costVal + amount;

      checkOnBuy(cost);
      changeTitle(cost);
      sortCandidates();
      return true;
    }
    return false;
  });
};

/**
 * Create notification on donation
 *
 * @param {string} msg - JSON string from DonationAlerts
 *                       with information about donation
 */
const donationHandler = (msg) => {
  const msgJSON = JSON.parse(msg);
  const message = oneSpace(msgJSON.message);
  const amount = Number(msgJSON.amount);
  const names = Array.from(document.getElementsByClassName('name'));
  const costs = Array.from(document.getElementsByClassName('cost'));
  let inserted = false;
  let notificationText;

  // eslint-disable-next-line eqeqeq
  if (msgJSON.alert_type != 1) return;
  if (!window.started) return;

  costs.some((cost, i) => {
    const nameVal = names[i].value;
    const isIncludes = nameVal && message.trim()
      .toLowerCase()
      .includes(nameVal.trim()
        .toLowerCase());


    notificationText = `Добавить ${amount} ₽ к "${toTitle(nameVal)}"?`;

    if (isIncludes) {
      notifications.sendPrompt(notificationText,
        () => addToPosition(message, amount));
      inserted = true;
      return true;
    }
    return false;
  });

  notifications.sendNotification(
    `Новое пожертвование${msgJSON.username ? ` от ${msgJSON.username}` : ''}!`,
    `${winner.decorate(oneSpace(message))} с ${amount} ₽`,
  );

  if (inserted) return;

  notificationText = `Создать "${toTitle(message)
    .trim()}" с ${amount} ₽?`;

  notifications.sendPrompt(notificationText,
    () => createBlock(message, amount));
};

/**
 * Connect to DonationAlerts socket and create listeners
 *
 * @private
 */
const connect = () => {
  const token = cookie.get('token');
  const socket = io(socketUrl, socketCfg);

  if (!token) return;

  socket.emit('add-user', {
    token,
    type: 'minor',
  });
  socket.on('donation', msg => donationHandler(msg));
};


// Exec
try {
  connect();
} catch {
  notifications.sendInside('Нет подключения, к DonationAlerts.');
}
