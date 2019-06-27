'use strict';

import ripplet       from 'ripplet.js';
import cookie        from './cookie';
import notifications from './notifications';
import promotion     from './promotion';
import winner        from './winner';


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
    this.paused = false;
    this.timeStart = new Date();
  }

  /**
   * Start timer
   *
   */
  start() {
    const startedTimes = Number(cookie.get('startedTimes'));
    const isSupport = cookie.get('isSupport');

    if (!this.paused && this.started) return;

    if (!this.paused && !this.m) {
      winner.show();
    } else {
      startBtn.style.display = 'none';
      pauseBtn.style.display = 'initial';

      if (!this.paused) {
        this.timeStart = new Date();
        this.m--;
        this.started = true;
        window.started = true;
        // () => ...() to resolve scope problems
        requestAnimationFrame(() => this.updateTimer());

        cookie.set('startedTimes', startedTimes + 1);
        if (0 < startedTimes && !( startedTimes % 15 )) cookie.del('isSupport');
        if (0 < startedTimes && !isSupport && !( startedTimes % 5 )) {
          setTimeout(promotion.show, 2000);
        }
      } else {
        this.paused = false;
        this.timeStart = new Date();
        requestAnimationFrame(() => this.updateTimer());
      }
    }
  }

  /**
   * Freeze timer until play (or stop) btn pressed
   *
   */
  pause() {
    if (!this.started) return;
    this.time = new Date(this.m * 60000 + this.s * 1000 + this.ms);
    this.paused = true;
    startBtn.style.display = 'initial';
    pauseBtn.style.display = 'none';
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

    this.paused = false;
    this.started = false;
    window.started = false;

    startBtn.style.display = 'initial';
    pauseBtn.style.display = 'none';
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
      this.m = 0 > this.m ? 0 : this.m;
      this.time = new Date(this.m * 60000 + this.s * 1000 + this.ms);
      this.elem.innerHTML = `${10 > this.m ? `0${this.m}` : this.m}:00:00`;
    }
  }

  /**
   * Add one minute to timer
   *
   */
  plusOne() {
    if (this.started) {
      if (59 !== this.m) {
        this.timeStart.setMinutes(this.timeStart.getMinutes() + 1);
        this.m++;
      }
    } else {
      this.m++;
      this.m = 59 < this.m ? 59 : this.m;
      this.time = new Date(this.m * 60000 + this.s * 1000 + this.ms);
      this.elem.innerHTML = `${10 > this.m ? `0${this.m}` : this.m}:00:00`;
    }
  }

  /**
   * Add two minutes to timer
   *
   */
  plusTwo() {
    if (this.started) {
      if (58 === this.m) {
        this.timeStart.setMinutes(this.timeStart.getMinutes() + 1);
        this.m++;
      } else if (58 > this.m) {
        this.timeStart.setMinutes(this.timeStart.getMinutes() + 2);
        this.m += 2;
      }
    } else {
      this.m += 2;
      this.m = 59 < this.m ? 59 : this.m;
      this.time = new Date(this.m * 60000 + this.s * 1000 + this.ms);
      this.elem.innerHTML = `${10 > this.m ? `0${this.m}` : this.m}:00:00`;
    }
  }

  /**
   * Update timer animation (every 10ms)
   *
   */
  updateTimer() {
    const current = new Date();
    const delta = new Date(current - this.timeStart);
    const result = new Date(this.time - delta);
    const title = document.title;
    let rm = result.getMinutes();  // result minutes
    let rs = result.getSeconds();  // result seconds
    let rms = result.getMilliseconds();  // result milliseconds
    let winnerResult = winner.return();
    let compiled;

    if (this.paused) return;

    this.m = rm;
    this.s = rs;
    this.ms = rms;

    if (!rm && 31 > rs && !this.elem.classList.contains('danger')) {
      this.elem.classList.add('danger');
    } else if (this.elem.classList.contains('danger') && ( rm || 31 < rs )) {
      this.elem.classList.remove('danger');
    }

    if (winnerResult) {
      compiled = `${winner.decorate(winnerResult)} лидирует!`;
      if (title !== compiled || 'Аукцион' === title) document.title = compiled;
    } else if ('Аукцион' !== title) document.title = 'Аукцион';

    // minimal rms can't be 0, and it's totally random
    if (( !rm && !rs && 300 > rms ) || this.time < delta) {
      this.stop();
    } else {
      rm = 10 > rm ? `0${rm}` : rm;
      rs = 10 > rs ? `0${rs}` : rs;
      rms = 10 > rms ? `0${rms}` : rms;
      rms = String(rms).substr(0, 2);

      this.elem.innerHTML = `${rm}:${rs}:${rms}`;

      // () => ...() to resolve scope problems
      requestAnimationFrame(() => this.updateTimer());
    }
  };
}


const minsCookie = cookie.get('previousMinutes');
const timerElement = document.getElementById('timer');
if (minsCookie) timerElement.innerHTML = `${minsCookie}:00:00`;
const timer = new Timer(timerElement);

const timerBtns = Array.from(document.getElementById('timer-btns').children);
const startBtn = timerBtns[0];
const pauseBtn = timerBtns[1];
const stopBtn = timerBtns[2];
const minusBtn = timerBtns[3];
const plusBtn = timerBtns[4];
const plusTwoBtn = timerBtns[5];

timerBtns.forEach(btn => btn.addEventListener('click', ripplet));

pauseBtn.style.display = 'none';

startBtn.onclick = () => {
  const mins = timerElement.innerHTML.split(':')[0];
  if (mins && !window.started) cookie.set('previousMinutes', mins);
  timer.start();
};
pauseBtn.onclick = () => timer.pause();
stopBtn.onclick = () => {
  if (timer.started) {
    timer.timeStart = new Date(new Date - timer.time + 300);
    notifications.clear();
    timer.stop();
  } else {
    timer.reset();
  }
  winner.show();
};
minusBtn.onclick = () => timer.minusOne();
plusBtn.onclick = () => timer.plusOne();
plusTwoBtn.onclick = () => timer.plusTwo();
