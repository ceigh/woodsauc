import {returnWinner, showWinner} from './positions';

class Timer {
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

  start() {
    if (this.started) return;
    if (this.m) {
      this.timeStart = new Date();
      this.started = true;

      // () => this.updateTimer() to resolve scope problems
      requestAnimationFrame(() => this.updateTimer());
    } else {
      showWinner();
    }
  }

  // It's work when timer didnt started
  reset() {
    this.elem.innerHTML = '00:00:00';
    this.m = 0;
    this.time = new Date(0);
  }

  // This work when timer is running
  stop() {
    this.elem.innerHTML = '00:00:00';
    this.m = 0;
    this.time = new Date(0);
    this.started = false;
    cancelAnimationFrame(this.updateTimer);
  }

  minusOne() {
    if (this.m === 1) return;
    this.m--;
    if (this.started) {
      this.timeStart.setMinutes(this.timeStart.getMinutes() - 1);
    } else {
      this.m = this.m < 0 ? 0 : this.m;
      this.time = new Date(this.m * 60000 + this.s * 1000 + this.ms);
      timer.innerHTML = `${this.m < 10 ? `0${this.m}` : this.m}:00:00`;
    }
  }

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
      timer.innerHTML = `${this.m < 10 ? `0${this.m}` : this.m}:00:00`;
    }
  }

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
      timer.innerHTML = `${this.m < 10 ? `0${this.m}` : this.m}:00:00`;
    }
  }

  updateTimer() {
    const current = new Date();
    const delta = new Date(current - this.timeStart);
    const result = new Date(this.time - delta);
    let rm = result.getMinutes();  // result minutes
    let rs = result.getSeconds();  // result seconds
    let rms = result.getMilliseconds();  // result milliseconds
    let winner = returnWinner();

    if ( !rm && rs < 30 && !this.elem.classList.contains('danger') ) {
      this.elem.classList.add('danger');
    } else if ( this.elem.classList.contains('danger') && (rm || rs > 30) ) {
      this.elem.classList.remove('danger')
    }

    if (winner !== 'Никто не ') {
      winner = winner.length > 30 ? `${winner.substr(0, 30)}..."` : winner;
      document.title = `${winner} - Аукцион β`;
    } else {
      document.title = 'Аукцион β';
    }

    // minimal rms can't be 0, and it's totally random
    if ( (!rm && !rs && rms < 300) || this.time < delta ) {
      this.stop();
      showWinner();
    } else {
      rm = rm < 10 ? `0${rm}` : rm;
      rs = rs < 10 ? `0${rs}` : rs;
      rms = rms < 10 ? `0${rms}` : rms;
      rms = String(rms).substr(0, 2);

      this.elem.innerHTML = `${rm}:${rs}:${rms}`;

      // () => this.updateTimer() to resolve scope problems
      requestAnimationFrame(() => this.updateTimer());
    }
  };
}

export default Timer;
