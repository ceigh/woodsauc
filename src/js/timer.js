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
   * Show timer debug info in console
   *
   * @private
   */
  debug() {
    setInterval(() => console.log(
      'Timer:\n',
      `   start: ${[this.timeStart.getMinutes(), this.timeStart.getSeconds(),
                    this.timeStart.getMilliseconds()]}\n\n`,
      ` started: ${this.started}\n`,
      `  paused: ${this.paused}\n\n`,
      `m, s, ms: ${[this.m, this.s, this.ms]}\n`,
      `    time: ${[this.time.getMinutes(), this.time.getSeconds(),
                    this.time.getMilliseconds()]}\n`),
      1000);
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

    this.paused = true;

    this.time = new Date(this.m * 60000 + this.s * 1000 + this.ms);

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
    this.s = 0;
    this.ms = 0;
    this.time = new Date(0);
  }

  /**
   * This work when timer is running, stop timer and reset time
   *
   */
  stop() {
    this.reset();

    if (this.paused) winner.show();

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
    let m = --this.m, s = this.s, ms = this.ms;

    this.m = 0 > m ? 0 : m;

    if (0 > m) return;

    this.time.setMinutes(this.time.getMinutes() - 1);

    if (!this.paused) {
      if (!this.started) {
        m = numToStr(m);
        this.elem.innerHTML = `${m}:00:00`;
        return;
      }
      return;
    }

    toggleDanger(this.elem, m, s);
    m = numToStr(m);
    s = numToStr(s);
    ms = numToStr(ms);
    ms = String(ms).substr(0, 2);
    this.elem.innerHTML = `${m}:${s}:${ms}`;
  }

  /**
   * Add one minute to timer
   *
   */
  plusOne() {
    let m = ++this.m, s = this.s, ms = this.ms;

    this.m = 59 < m ? 59 : m;

    if (59 < m) return;

    this.time.setMinutes(this.time.getMinutes() + 1);

    if (!this.paused) {
      if (!this.started) {
        m = numToStr(m);
        this.elem.innerHTML = `${m}:00:00`;
        return;
      }
      return;
    }

    toggleDanger(this.elem, m, s);
    m = numToStr(m);
    s = numToStr(s);
    ms = numToStr(ms);
    ms = String(ms).substr(0, 2);
    this.elem.innerHTML = `${m}:${s}:${ms}`;
  }

  /**
   * Add two minutes to timer
   *
   */
  plusTwo() {
    let m = this.m, s = this.s, ms = this.ms;

    if (59 === m) return;

    this.time.setMinutes(this.time.getMinutes() + ( 58 === m ? 1 : 2 ));
    m = 59 < m + 2 ? 59 : m + 2;
    this.m = m;

    if (!this.paused) {
      if (!this.started) {
        m = numToStr(m);
        this.elem.innerHTML = `${m}:00:00`;
        return;
      }
      return;
    }

    toggleDanger(this.elem, m, s);
    m = numToStr(m);
    s = numToStr(s);
    ms = numToStr(ms);
    ms = String(ms).substr(0, 2);
    this.elem.innerHTML = `${m}:${s}:${ms}`;
  }

  /**
   * Update timer animation (every 10ms)
   *
   */
  updateTimer() {
    const current = new Date();
    const delta = new Date(current - this.timeStart);
    const result = new Date(this.time - delta);
    let m  = result.getMinutes(),
        s  = result.getSeconds(),
        ms = result.getMilliseconds();

    if (this.paused) return;

    this.m = m;
    this.s = s;
    this.ms = ms;

    toggleDanger(this.elem, m, s);
    toggleTitle();

    // minimal ms can't be 0, and it's totally random
    if (( !m && !s && 300 > ms ) || this.time < delta) {
      winner.show();
      this.stop();
      return;
    }

    m = numToStr(m);
    s = numToStr(s);
    ms = numToStr(ms);
    ms = String(ms).substr(0, 2);
    this.elem.innerHTML = `${m}:${s}:${ms}`;

    // () => ...() to resolve scope problems
    requestAnimationFrame(() => this.updateTimer());
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
  if (!timer.started) {
    timer.reset();
  } else {
    timer.timeStart = new Date(new Date - timer.time + 300);
    notifications.clear();
    timer.stop();
  }
};
minusBtn.onclick = () => timer.minusOne();
plusBtn.onclick = () => timer.plusOne();
plusTwoBtn.onclick = () => timer.plusTwo();

// timer.debug();

/**
 * Convert to '0%d' or %d
 *
 * @private
 * @param {Number} n - number to convert
 * @return {String} - timer like number string
 */
const numToStr = n => 10 > n ? `0${n}` : n;

/**
 * Toggle timer color on < 30 sec and 0 min
 *
 * @private
 *
 * @param {Object} e - link on timer element
 * @param {Number} m - minutes
 * @param {Number} s - seconds
 */
const toggleDanger = (e, m, s) => {
  if (!e.classList.contains('danger') && 30 > s && !m) {
    e.classList.add('danger');
  } else if (e.classList.contains('danger') && ( m || 30 <= s )) {
    e.classList.remove('danger');
  }
};

/**
 * Put winner name to document title
 *
 * @private
 */
const toggleTitle = () => {
  const title = document.title;
  const percent = returnRansomPercent();
  const titleStart = percent ? 99 < percent ? '' : `${percent}%` : '';
  const titleEnd = percent ? 99 < percent ? 'сейчас выкупят...' : '' : 'лидирует!';
  let winnerResult = winner.return();
  let compiled;

  if (winnerResult) {
    compiled = `${titleStart} ${winner.decorate(winnerResult)} ${titleEnd}`;
    if (title !== compiled || 'Аукцион' === title) document.title = compiled;
  } else if ('Аукцион' !== title) document.title = 'Аукцион';
};

const returnRansomPercent = () => {
  const ransom = cookie.get('buyCost');
  let costs, maxCost;

  if (!ransom) return;

  costs = Array.from(document.getElementsByClassName('cost'))
    .map(cost => Number(cost.value));
  maxCost = Math.max.apply(null, costs);

  return Math.round(100 * maxCost / ransom);
};
