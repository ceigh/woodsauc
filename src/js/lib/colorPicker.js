// Imports
import Picker from 'vanilla-picker';
import cookie from './cookie';
import { changeAccent } from './background';
import notification from './notifications';


// Variables
const settings = document.querySelector('#settings');
const parent = document.querySelector('#accent');
const parentText = parent.querySelector('span');
const notifications = document.querySelector('#notifications-area');
const accent = cookie.get('accent') || '#f39727';
const picker = new Picker({
  parent,
  popup: 'bottom',
  alpha: false,
  color: accent,
  editor: true,
});


// Functions
const openPicker = () => {
  const okBtn = document.querySelector('.picker_done button');
  okBtn.innerText = 'Ок';
  okBtn.classList.add('btn');
  settings.style.height = '36vw';
  notifications.style.display = 'none';
};
const closePicker = () => {
  settings.removeAttribute('style');
  notifications.removeAttribute('style');
};


// Exec
parent.style.background = accent;
parentText.style.color = accent;

picker.onOpen = openPicker;
picker.onClose = closePicker;
picker.onChange = (color) => {
  const hex = color.hex.substr(0, 7);

  parent.style.background = hex;
  parentText.style.color = hex;
  parentText.innerText = hex;

  changeAccent(hex);
};
picker.onDone = (color) => {
  notification.sendInside('Цвет установлен');
  cookie.set('accent', color.hex.substr(0, 7));
};
