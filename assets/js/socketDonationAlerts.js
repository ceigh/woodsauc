'use strict';

import notifications from './notifications';
import winner from './winner';
import {oneSpace, toTitle} from './stringUtilities';
import {sortCandidates, changeTitle, checkOnBuy, createBlock} from './candidates';

const socketUrl = 'https://socket.donationalerts.ru:443';
const socketOpt = {'reconnection': true};

try { connect(); }
catch (e) { notifications.sendInside('Нет подключения, к DonationAlerts.') }


/**
 * Connect to DonationAlerts socket and create listeners
 *
 */
function connect() {
  const token = getCookie('token');
  let socket;
  if (!token) return;
  socket = io(socketUrl, socketOpt);
  socket.emit( 'add-user', {'token': token, 'type': 'minor'} );
  socket.on( 'donation', msg => donationHandler(msg) );
}


/**
 * Create notification on donation
 *
 * @param {string} msg - JSON string from DonationAlerts
 *                       with information about donation
 */
const donationHandler = msg => {
  let inserted = false;
  let amount,
      message,
      msgJSON,
      names,
      costs,
      notificationText;

  if (!window.started) return;

  msgJSON = JSON.parse(msg);

  if (msgJSON.alert_type != 1) return;

  message = oneSpace(msgJSON.message);
  amount = Number(msgJSON.amount);

  names = Array.from( document.getElementsByClassName('name') );
  costs = Array.from( document.getElementsByClassName('cost') );

  costs.some((item, i) => {
    const name = names[i].value;
    const isIncludes = name && message.trim().toLowerCase()
                                 .includes( name.trim().toLowerCase() );
    const addToPosition = () => {
      const names = Array.from( document.getElementsByClassName('name') );
      const costs = Array.from( document.getElementsByClassName('cost') );
      costs.some( (item, i) => {
        const name = names[i].value;
        const cost = Number(item.value);
        const isIncludes = name && message.toLowerCase().includes( name.toLowerCase() );

        if (isIncludes) {
          item.value = amount + cost;
          checkOnBuy(item);
          changeTitle(item);
          sortCandidates();
          return true;
        }
        return false;
      });
    };

    notificationText = `Добавить ₽${amount} к "${toTitle(name)}"?`;

    if (isIncludes) {
      notifications.sendPrompt(notificationText, addToPosition);
      inserted = true;
      return true;
    }
    return false;
  });

  notifications.sendNotification(
    `Новое пожертвование${!msgJSON.username ? '' : ` от ${msgJSON.username}`}!`,
    `${winner.decorate( oneSpace(message) )} с ${amount}₽`);

  if (inserted) return;

  notificationText = `Создать "${ toTitle(message).trim() }" с ₽${amount}?`;
  const createPosition = () => {
    createBlock(message, amount);
  };
  notifications.sendPrompt(notificationText, createPosition);
};
