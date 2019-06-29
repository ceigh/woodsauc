import {createBlock} from './candidates';
import cookie        from './cookie';

/**
 * Save all candidates in cookie if timer started
 *
 */
const backupCandidates = () => {
  const names = Array.from(document.getElementsByClassName('name'));
  const costs = Array.from(document.getElementsByClassName('cost'));
  const data = names.map((e, i) => [e.value, costs[i].value]);
  if (window.started) cookie.set('candidates', JSON.stringify(data));
};

/**
 * Restore candidates from cookie on load
 *
 */
const restoreCandidates = () => {
  let data = cookie.get('candidates');
  if (!data) return;
  data = JSON.parse(data);
  data.forEach(e => e.some(Boolean) ? createBlock(...e) : null);
  cookie.del('candidates');
};

/**
 * focus() on last (empty) name input when restore
 *
 */
const focusLastName = () => {
  const names = Array.from(document.getElementsByClassName('name'));
  const [lastName] = names.slice(-1);
  lastName.focus();
};

window.onbeforeunload = () => {
  backupCandidates();
  if (window.started) return 'Таймер будет сброшен. Позиции останутся.';
};

restoreCandidates();
focusLastName();
