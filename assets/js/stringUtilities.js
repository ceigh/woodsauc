'use strict';

export {toTitle, trim, oneSpace};


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


/**
  * Remove spaces on the start and end of string
  *
  * @param {string} s - string to change
  */
const trim = s => s.replace(/\s+$|^\s+/g, '');
