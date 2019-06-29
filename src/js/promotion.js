import ripplet from 'ripplet.js';
import cookie  from './cookie';

const promotionDiv = document.getElementById('promotion');
const promotionBtns = Array.from(promotionDiv.querySelectorAll('.btn'));
const acceptBtn = promotionBtns[0];
const cancelBtn = promotionBtns[1];

let startedTimes = cookie.get('startedTimes');
startedTimes = startedTimes === undefined ? 0 : startedTimes;
cookie.set('startedTimes', startedTimes);

promotionBtns.forEach(btn => btn.addEventListener('click', ripplet));

acceptBtn.onclick = () => {
  closePromotion();
  cookie.set('isSupport', 1);
};
cancelBtn.onclick = () => closePromotion();

const closePromotion = () => {
  promotionDiv.style.bottom = '-10vw';
  setTimeout(() => promotionDiv.style.visibility = 'hidden', 300);
};
const showPromotion = () => {
  promotionDiv.style.visibility = 'visible';
  promotionDiv.style.bottom = '0';
};

const promotion = {
  show: showPromotion,
  close: showPromotion
};

export default promotion;
