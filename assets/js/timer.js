'use strict';

import ripplet from 'ripplet.js';
import notifications from './notifications';
import settings from './settings';
import winner from './winner';


class Timer {
  /**
   * @constructor
   *
   */
  constructor(timerElem) {
    const arr = timerElem.innerHTML.split(':');
    this.elem = timerElem;
    this.m = +arr[0];
    this.s = +arr[1];
    this.ms = +arr[2];
    this.time = new Date(this.m * 60000 + this.s * 1000 + this.ms);
    this.started = false;
    this.timeStart = new Date();
  }

  /**
   * Start timer
   *
   */
  start() {
    if (this.started) return;
    if (!this.m) winner.show(); else {
      this.timeStart = new Date();
      this.m--;
      this.started = true;
      window.started = true;
      // () => ...() to resolve scope problems
      requestAnimationFrame(() => this.updateTimer());
    }
  }

  /**
   * It's work when timer didnt started, reset timer to 00:00:00
   *
   */
  reset() {
    this.elem.innerHTML = '00:00:00';
    this.m = 0;
    this.time = new Date(0);
  }

  /**
   * This work when timer is running, stop timer and reset time
   *
   */
  stop() {
    this.reset();
    this.started = false;
    window.started = false;
    cancelAnimationFrame(this.updateTimer);
  }

  /**
   * Subtract one minute from timer
   *
   */
  minusOne() {
    if (!this.m) return;

    this.m--;

    if (this.started) {
      this.timeStart.setMinutes(this.timeStart.getMinutes() - 1);
    } else {
      this.m = this.m < 0 ? 0 : this.m;
      this.time = new Date(this.m * 60000 + this.s * 1000 + this.ms);
      this.elem.innerHTML = `${this.m < 10 ? `0${this.m}` : this.m}:00:00`;
    }
  }

  /**
   * Add one minute to timer
   *
   */
  plusOne() {
    if (this.started) {
      if (this.m !== 59) {
        this.timeStart.setMinutes(this.timeStart.getMinutes() + 1);
        this.m++;
      }
    } else {
      this.m++;
      this.m = this.m > 59 ? 59 : this.m;
      this.time = new Date(this.m * 60000 + this.s * 1000 + this.ms);
      this.elem.innerHTML = `${this.m < 10 ? `0${this.m}` : this.m}:00:00`;
    }
  }

  /**
   * Add two minutes to timer
   *
   */
  plusTwo() {
    if (this.started) {
      if (this.m === 58) {
        this.timeStart.setMinutes(this.timeStart.getMinutes() + 1);
        this.m++;
      } else if (this.m < 58) {
        this.timeStart.setMinutes(this.timeStart.getMinutes() + 2);
        this.m += 2;
      }
    } else {
      this.m += 2;
      this.m = this.m > 59 ? 59 : this.m;
      this.time = new Date(this.m * 60000 + this.s * 1000 + this.ms);
      this.elem.innerHTML = `${this.m < 10 ? `0${this.m}` : this.m}:00:00`;
    }
  }

  /**
   * Update timer animation (every 10ms)
   *
   */
  updateTimer() {
    // console.log(`${this.m}:${this.s}`);
    const current = new Date();
    const delta = new Date(current - this.timeStart);
    const result = new Date(this.time - delta);
    const title = document.title;
    let rm = result.getMinutes();  // result minutes
    let rs = result.getSeconds();  // result seconds
    let rms = result.getMilliseconds();  // result milliseconds
    let winnerResult = winner.return();
    let compiled;

    this.m = rm;
    this.s = rs;
    this.ms = rms;

    if ( !rm && rs < 31 && !this.elem.classList.contains('danger') ) {
      this.elem.classList.add('danger');
    } else if ( this.elem.classList.contains('danger') && (rm || rs > 31) ) {
      this.elem.classList.remove('danger')
    }

    if (winnerResult) {
      compiled = `${winner.decorate(winnerResult)} лидирует!`;
      if (title !== compiled || title === 'Аукцион') document.title = compiled;
    } else if (title !== 'Аукцион') document.title = 'Аукцион';

    // minimal rms can't be 0, and it's totally random
    if ( (!rm && !rs && rms < 300) || this.time < delta ) {
      this.stop();
      winner.show(winner.compile(winnerResult));
    } else {
      rm = rm < 10 ? `0${rm}` : rm;
      rs = rs < 10 ? `0${rs}` : rs;
      rms = rms < 10 ? `0${rms}` : rms;
      rms = String(rms).substr(0, 2);

      this.elem.innerHTML = `${rm}:${rs}:${rms}`;

      // () => ...() to resolve scope problems
      requestAnimationFrame(() => this.updateTimer());
    }
  };
}


const minsCookie = getCookie('previousMinutes');
const timerElement = document.getElementById('timer');
if (minsCookie) timerElement.innerHTML = `${minsCookie}:00:00`;
const timer = new Timer(timerElement);

const timerBtns = Array.from(document.getElementById('timer-btns').children);
const startBtn = timerBtns[0];
const stopBtn = timerBtns[1];
const minusBtn = timerBtns[2];
const plusBtn = timerBtns[3];
const plusTwoBtn = timerBtns[4];

timerBtns.forEach( btn => btn.addEventListener('click', ripplet) );

startBtn.onclick = () => {
  const mins = timerElement.innerHTML.split(':')[0];
  if (mins && !window.started) settings.cookie.set('previousMinutes', mins);
  timer.start();
};
stopBtn.onclick = () => {
  if (timer.started) {
    timer.timeStart = new Date(new Date - timer.time + 300);
    notifications.clear();
    timer.stop()
  } else {
    timer.reset();
  }
};
minusBtn.onclick = () => timer.minusOne();
plusBtn.onclick = () => timer.plusOne();
plusTwoBtn.onclick = () => timer.plusTwo();
