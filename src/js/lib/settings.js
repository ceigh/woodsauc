// Imports
import addRipplet from './tools';
// eslint-disable-next-line import/no-cycle
import './background';
// eslint-disable-next-line import/no-cycle
import './settingsDonationAlerts';


// Variables
const showSettingsBtn = document.getElementById('settings-icon');
const settingsWindow = document.getElementById('settings');
const urlsBtns = Array.from(document.getElementsByClassName('special-url'));


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
addRipplet([...urlsBtns, showSettingsBtn]);

showSettingsBtn.onclick = () => settingsWindow.classList.toggle('closed');


// Exports
export { selectTxt, isUrlValid };
