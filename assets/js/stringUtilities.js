export {toTitle, trim, oneSpace};

// Make String Title Cased
const toTitle = s => s.replace(/(^|\s)\S/g, t => t.toUpperCase());

// Make one space between words
const oneSpace = s => trim(s).replace(/\s+/g, ' ');

// Remove spaces on the start and end of string
const trim = s => s.replace(/\s+$|^\s+/g, '');
