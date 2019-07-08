// Variables
const year = 31622400; // sec


// Functions
/**
 * Get document cookie
 *
 * @param {string} name - cookie name
 * @return - cookie value
 */
const get = (name) => {
  const matches = document.cookie.match(new RegExp(
    `(?:^|; )${name.replace(/([.$?*|{}()[]\/+^])/g, '\\$1')}=([^;]*)`,
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
};

/**
 * Set document cookie
 *
 * @param {string} name - cookie name
 * @param {number|string} value - cookie value
 * @param {Object} [options] - cookie options
 */
const set = (name, value, options = { expires: year }) => {
  const d = new Date();
  let updatedCookie = `${name}=${encodeURIComponent(value)}`;
  let { expires } = options;

  if (typeof expires === 'number' && expires) {
    d.setTime(d.getTime() + expires * 1000);
    options.expires = d;
    expires = d;
  }

  if (expires && expires.toUTCString) {
    options.expires = expires.toUTCString();
  }

  Object.keys(options)
    .map((k) => {
      const v = options[k];
      updatedCookie += `; ${k}`;
      if (v !== true) updatedCookie += `=${v}`;
      return updatedCookie;
    });

  document.cookie = updatedCookie;
};

/**
 * Delete document cookie by set expires: -1
 *
 * @param {(undefined|?string)} name - cookie name
 * @see setCookie
 */
const del = (name) => {
  set(name, '', { expires: -1 });
};


// Exports
const cookie = {
  get,
  set,
  del,
};
export default cookie;
