/** @module promotion */

// Imports
import cookie from './cookie';
import addRipplet from './tools';


// Variables
const promotionDiv = document.getElementById('promotion');
const promotionBtns = Array.from(promotionDiv.querySelectorAll('.btn'));
const acceptBtn = promotionBtns[0];
const cancelBtn = promotionBtns[1];
const startedTimes = cookie.get('startedTimes') || 0;


// Functions
/**
 * Hide callback for setTimeout in hidePromotionDelayed
 *
 * @see hidePromotionDelayed
 */
function hidePromotion() {
  promotionDiv.style.visibility = 'hidden';
}

/**
 * Hide promotion bar with delay
 *
 */
const hidePromotionDelayed = () => {
  promotionDiv.style.bottom = '-10vw';
  setTimeout(hidePromotion, 300);
};

/**
 * Open promotion bar
 *
 */
const showPromotion = () => {
  promotionDiv.style.visibility = 'visible';
  promotionDiv.style.bottom = '0';
};


// Exec
cookie.set('startedTimes', startedTimes);

addRipplet(promotionBtns);

acceptBtn.onclick = () => {
  hidePromotion();
  cookie.set('isSupport', 1);
};
cancelBtn.onclick = hidePromotionDelayed;


// Exports
const promotion = {
  show: showPromotion,
  close: hidePromotionDelayed,
};
export default promotion;
