// Imports
import * as Vibrant from 'node-vibrant';
import { defaultOptions } from 'ripplet.js';
import cookie from './cookie';
import notifications from './notifications';
import addRipplet from './tools';
// eslint-disable-next-line import/no-cycle
import { isUrlValid, selectTxt } from './settings';


// Variables
const ff = navigator.userAgent.toLowerCase()
  .includes('firefox');
const body = document.querySelector('body');

const bgURL = cookie.get('bg-url');
const bgURLInput = document.getElementById('bg-url');
const saveBGURLBtn = document.getElementById('save-bg-url-btn');
const clearBGURLBtn = document.getElementById('clear-bg-url-btn');

const colorExtractor = document.getElementById('color-extractor');
const colorCookie = cookie.get('accent');
const style = document.createElement('style');


// Functions
/**
 * Add background image to body
 *
 * @param {Object} img - picture to add
 */
function applyBg(img) {
  body.style.backgroundImage = `url('${img.src}')`;
}

/**
 * Change page background
 *
 * @param {string} url - picture URL
 */
function changeBG(url) {
  const bgImg = new Image();
  if (url) {
    bgImg.src = url;
    bgImg.onload = () => applyBg(bgImg);
    return;
  }
  body.style.backgroundImage = `url('img/bg/tree.${ff ? 'jpg' : 'webp'}')`;
}

/**
 * Convert HEX color to RGB
 *
 * @private
 * @param {string} hex - color in hex (#XXXXXX)
 * @return {Object} - (r: XXX, g: XXX, b: XXX) Object or css string
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return result ? {
    rgb: {
      r,
      g,
      b,
    },
    str: `rgb(${r}, ${g}, ${b}`,
  } : null;
}

/**
 * Convert HEX color to RGB
 *
 * @private
 * @param {string|Object} color - HEX string or RGB Object
 * @param {Number} alpha - alpha parameter in % (0-100) or float 0-1
 * @return {Object} - (r: XXX, g: XXX, b: XXX, a: XXX) Object or css string
 * @see hexToRgb
 */
function toRgba(color, alpha) {
  const a = alpha <= 1 ? alpha : alpha / 100;
  const { r, g, b } = typeof color === 'string' ? hexToRgb(color).rgb : color.rgb;

  return color ? {
    rgba: {
      r,
      g,
      b,
      a,
    },
    str: `rgba(${r}, ${g}, ${b}, ${a})`,
  } : null;
}


// Exec
bgURLInput.value = bgURL || '';
changeBG(bgURL);

const rippleColor = colorCookie ? toRgba(colorCookie, 60).str : 'rgba(243, 151, 39, .6)';
defaultOptions.color = rippleColor;
defaultOptions.clearingDuration = '.3s';
defaultOptions.spreadingDuration = '.3s';

if (colorCookie) {
  const accentShadow = toRgba(hexToRgb(colorCookie), 70).str;
  style.innerText = '';
  style.innerText += `#bg-url {color: ${colorCookie}}`;
  style.innerText += `#da-url {color: ${colorCookie}}`;
  style.innerText += `.danger {color: ${colorCookie} !important}`;
  style.innerText += `.name {color: ${colorCookie}}`;
  style.innerText += `.cost {color: ${colorCookie}}`;
  style.innerText += `.cost-buy {color: ${colorCookie}}`;

  style.innerText
    += `input:focus {--accent: ${colorCookie} !important; --shadow: ${accentShadow}}`;

  style.innerText += `::selection {background: ${accentShadow}}`;
  style.innerText += `::-moz-selection {background: ${accentShadow}}`;

  document.head.appendChild(style);
} else {
  style.innerText = '';
  style.innerText += '#bg-url {color: #f39727}';
  style.innerText += '#da-url {color: #f39727}';
  style.innerText += '.danger {color: #f39727} !important';
  style.innerText += '.name {color: #f39727}';
  style.innerText += '.cost {color: #f39727}';
  style.innerText += '.cost-buy {color: #f39727}';

  style.innerText
    += 'input:focus {--accent: #f39727; --shadow: rgba(243, 151, 39, .7)}';

  style.innerText += '::selection {background: rgba(243, 151, 39, .7)}';
  style.innerText += '::-moz-selection {background: rgba(243, 151, 39, .7)}';
}

addRipplet([bgURLInput, clearBGURLBtn, saveBGURLBtn]);

bgURLInput.addEventListener('click', () => selectTxt(bgURLInput));

clearBGURLBtn.onclick = () => {
  if (!bgURLInput.value && !cookie.get('bg-url')) {
    notifications.sendInside('Фон уже сброшен');
  } else {
    changeBG('');
    bgURLInput.value = '';
    defaultOptions.color = 'rgba(243, 151, 39, .6)';

    style.innerText = '';
    style.innerText += '#bg-url {color: #f39727}';
    style.innerText += '#da-url {color: #f39727}';
    style.innerText += '.danger {color: #f39727 !important}';
    style.innerText += '.name {color: #f39727}';
    style.innerText += '.cost {color: #f39727}';
    style.innerText += '.cost-buy {color: #f39727}';

    style.innerText
      += 'input:focus {--accent: #f39727; --shadow: rgba(243, 151, 39, .7)}';

    style.innerText += '::selection {background: rgba(243, 151, 39, .7)}';
    style.innerText += '::-moz-selection {background: rgba(243, 151, 39, .7)}';

    document.head.appendChild(style);

    cookie.del('bg-url');
    cookie.del('accent');

    notifications.sendInside('Фон сброшен');
  }
};
saveBGURLBtn.onclick = () => {
  const url = encodeURI(bgURLInput.value);

  if (!url) {
    notifications.sendInside('Нет URL фона');
    return;
  }

  if (url === cookie.get('bg-url')) {
    notifications.sendInside('Этот фон уже установлен');
    return;
  }

  if (!isUrlValid(url)) {
    notifications.sendInside('Введите корректный URL');
    bgURLInput.value = '';
    return;
  }

  changeBG(url);
  notifications.sendInside('Фон обновлен');

  // Change Accent color
  colorExtractor.setAttribute(
    'src', `https://cors-anywhere.herokuapp.com/${url}`,
  );

  colorExtractor.addEventListener('load', () => {
    Vibrant.from(colorExtractor)
      .getPalette((err, palette) => {
        const dominant = palette.Vibrant.getHex();
        const shadow = toRgba(hexToRgb(dominant), 60).str;

        defaultOptions.color = shadow;

        style.innerText = '';
        style.innerText += `#bg-url {color: ${dominant}}`;
        style.innerText += `#da-url {color: ${dominant}}`;
        style.innerText += `.danger {color: ${dominant} !important}`;
        style.innerText += `.name {color: ${dominant}}`;
        style.innerText += `.cost {color: ${dominant}}`;
        style.innerText += `.cost-buy {color: ${dominant}}`;

        style.innerText
          += `input:focus {--accent: ${dominant}; --shadow: ${shadow}}`;

        style.innerText += `::selection {background: ${dominant}}`;
        style.innerText += `::-moz-selection {background: ${dominant}}`;

        document.head.appendChild(style);

        cookie.set('bg-url', url);
        cookie.set('accent', dominant);
      });
  });
};
