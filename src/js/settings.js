'use strict';

import ripplet from 'ripplet.js';
import './background';
import './settingsDonationAlerts';

const showSettingsBtn = document.getElementById('settings-icon');
const settingsWindow = document.getElementById('settings');
const urlsBtns = Array.from( document.getElementsByClassName('special-url') );

showSettingsBtn.addEventListener('click', ripplet);

showSettingsBtn.onclick = () => settingsWindow.classList.toggle('closed');

urlsBtns.forEach( (item) => item.addEventListener('click', ripplet) );


/**
  * Select all text in input
  *
  * @param {Object} input - input element
  */
const selectTxt = input => {
  input.focus();
  input.select();
};


/**
 * Check if URL is URL and it's a picture
 *
 * @param {string} url - URL to test
 * @return {Boolean} - is valid or not
 */
const isUrlValid = url => {
  const isImg = /\.(jpg|jpeg|png|gif|webp|svg)$/;
  const isUrl = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/;
  url = encodeURI(url);
  return isImg.test(url) && isUrl.test(url);
};


/**
 * Check is URL loaded
 * @return {boolean} - loaded or not
 */
//TODO FIXME: async, await
/*async function isUrlWork(url) {
  const http = new XMLHttpRequest();
  url = `https://cors-anywhere.herokuapp.com/${url}`;
  try {
    http.open('HEAD', url, true);
    http.send();
    return await (http.status === 200);
  } catch {
    return false;
  }
}*/

export {selectTxt, isUrlValid};
