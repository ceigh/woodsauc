// Imports
import cookie from './cookie';


// Variables
const style = document.createElement('style');
const preloader = document.getElementById('preloader');


// Functions
const hidePreloader = () => preloader.classList.add('hidden');


// Exec
const accent = cookie.get('accent') || '#f39727';

window.onload = hidePreloader;

style.innerText = `.hand {--skin-color: ${accent} !important}`;
document.head.appendChild(style);
