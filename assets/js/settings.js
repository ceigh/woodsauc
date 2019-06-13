'use strict';

const year = 31622400; // sec


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
const cookie = {year, set: setCookie, delete: deleteCookie};

export default cookie;
