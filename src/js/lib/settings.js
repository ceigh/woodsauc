/** @module settings */

// Imports
import addRipplet from './tools';
// eslint-disable-next-line import/no-cycle
import './background';
// eslint-disable-next-line import/no-cycle
import './settingsDonationAlerts';
// eslint-disable-next-line import/no-cycle
import { enableRansom, disableRansom } from './candidates';


// Variables
const showSettingsBtn = document.getElementById('settings-icon');
const settingsWindow = document.getElementById('settings');
const urlsBtns = Array.from(document.getElementsByClassName('special-url'));

const ransomCheckbox = document.querySelector('#switch1');


// Functions
/**
 * Select all text in input
 *
 * @param {Object} input - input element
 */
const selectTxt = (input) => {
  input.focus();
  input.select();
};

/**
 * Check if URL is URL and it's a picture
 *
 * @param {string} url - URL to test
 * @return {Boolean} - is valid or not
 */
const isUrlValid = (url) => {
  const isImg = /\.(jpg|jpeg|png|gif|webp|svg)$/;
  const isUrl = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/;
  const encodedUrl = encodeURI(url);
  return isImg.test(encodedUrl) && isUrl.test(encodedUrl);
};


// Exec
addRipplet([...urlsBtns, showSettingsBtn, ransomCheckbox]);

showSettingsBtn.onclick = () => settingsWindow.classList.toggle('closed');

ransomCheckbox.onchange = () => {
  if (ransomCheckbox.checked) enableRansom(); else disableRansom();
};


// Exports
export { selectTxt, isUrlValid };
