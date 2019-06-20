'use strict';

const style = document.createElement('style');
const getCookie = name => {
  let matches = document.cookie.match(new RegExp(
    `(?:^|; )${name.replace(/([.$?*|{}()\[\]\\\/+^])/g, '\\$1')}=([^;]*)`
  ));
  return !matches ? undefined : decodeURIComponent( matches[1] );
};
let accent = getCookie('accent');

accent = accent ? accent : '#f39727';
style.innerText = `.🤚{--skin-color:${accent}!important}`;
document.head.appendChild(style);
window.onload = () => document.getElementById('preloader').classList.add('hidden');
