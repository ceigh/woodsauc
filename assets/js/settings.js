'use strict';

const year = 31622400; // sec


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
  const isUrl = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)/;
  url = encodeURI(url);
  return isImg.test(url) && isUrl.test(url);
};


/**
 * Check is URL loaded
 * @return {boolean} - loaded or not
 */
//TODO FIXME: async, await
/*const isUrlWork = url => {
  const http = new XMLHttpRequest();

  try {
    http.open('HEAD', url, false);
    http.send();
    return http.status === 200;
  } catch {
    return false;
  }
};*/


/**
  * Set document cookie
  *
  * @param {string} name - cookie name
  * @param {number|string} value - cookie value
  * @param {Object} [options] - cookie options
  */
const setCookie = ( name, value, options = {'expires': year} ) => {
  let expires = options.expires;

  if (typeof expires === 'number' && expires) {
    const d = new Date();
    d.setTime(d.getTime() + expires * 1000);
    expires = options.expires = d;
  }

  if (expires && expires.toUTCString) {
    options.expires = expires.toUTCString();
  }

  value = encodeURIComponent(value);

  let updatedCookie = `${name}=${value}`;

  for (const propName in options) {
    const propValue = options[propName];
    updatedCookie += `; ${propName}`;
    if (propValue !== true) {
      updatedCookie += `=${propValue}`;
    }
  }

  document.cookie = updatedCookie;
};


/**
  * Delete document cookie by set expires: -1
  *
  * @param {(undefined|?string)} name - cookie name
  * @see setCookie
  */
const deleteCookie = name => {
  setCookie( name, '', {'expires': -1} );
};


const settings = {
  cookie: {
    year,
    set: setCookie,
    delete: deleteCookie
  },
  tools: {
    selectTxt,
    isUrlValid
  }
};

export default settings;
