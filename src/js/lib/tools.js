// Imports
import ripplet from 'ripplet.js';


// Functions
/**
 * Add onclick ripplet effect to array of elements
 *
 * @private
 * @param {Array} elements - elements to add event
 */
const addRipplet = (elements) => {
  elements.forEach(el => el.addEventListener('click', ripplet));
};


// Exports
export default addRipplet;
