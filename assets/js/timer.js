import winner from './winner';

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
      this.m--;

      // () => ...() to resolve scope problems
      requestAnimationFrame(() => this.updateTimer());
    } else {
      winner.show(false);
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
    if (!this.m) return;
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
    // console.log(`${this.m}:${this.s}`);
    const current = new Date();
    const delta = new Date(current - this.timeStart);
    const result = new Date(this.time - delta);
    let rm = result.getMinutes();  // result minutes
    let rs = result.getSeconds();  // result seconds
    let rms = result.getMilliseconds();  // result milliseconds
    let winnerResult = winner.return();

    this.m = rm;
    this.s = rs;
    this.ms = rms;

    if ( !rm && rs < 31 && !this.elem.classList.contains('danger') ) {
      this.elem.classList.add('danger');
    } else if ( this.elem.classList.contains('danger') && (rm || rs > 31) ) {
      this.elem.classList.remove('danger')
    }

    document.title = !winnerResult ? 'WoodsAuc' :
                     `${winner.decorate(winnerResult)} - WoodsAuc`;

    // minimal rms can't be 0, and it's totally random
    if ( (!rm && !rs && rms < 300) || this.time < delta ) {
      this.stop();
      winner.show(false, winner.compile(winnerResult));
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

export default Timer;
