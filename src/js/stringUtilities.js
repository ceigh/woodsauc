'use strict';

export {toTitle, oneSpace};


/**
  * Make String Title Cased
  *
  * @param {string} s - string to change
  */
const toTitle = s => s.replace(/(^|\s)\S/g, t => t.toUpperCase());


/**
  * Make one space between words
  *
  * @param {string} s - string to change
  */
const oneSpace = s => s.replace(/\s+/g, ' ');
