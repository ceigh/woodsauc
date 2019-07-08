// Functions
/**
 * Make String Title Cased
 *
 * @private
 * @param {string} s - string to change
 */
const toTitle = s => s.replace(/(^|\s)\S/g, t => t.toUpperCase());

/**
 * Make one space between words
 *
 * @private
 * @param {string} s - string to change
 */
const oneSpace = s => s.replace(/\s+/g, ' ');


// Exports
export { toTitle, oneSpace };
