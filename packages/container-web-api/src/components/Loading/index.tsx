import React, { PureComponent, createRef } from 'react';
import './index.less';

const OPTIONS = {
  duration: 1400,
  delay: 0,
  classes: 'working rest robot',
};

function bindCtx<T extends Record<string, any>, Key extends keyof T>(names: Key[], target: T, env?: Record<Key | string, any>) {
  if (!env) {
    /* eslint-disable-next-line no-param-reassign */
    env = target;
  }
  names.forEach(name => {
    /* eslint-disable-next-line no-param-reassign */
    (env as any)[name] = target[name].bind(env);
  });
}

type LoadingProps = {};

export default class Loading extends PureComponent<LoadingProps> {
  callback: ((...args: any[]) => void) | null = null;

  interval: NodeJS.Timeout | null;

  iteration = 0;

  processing = false;

  enough = false;

  status = 'loading';

  wrapRef = createRef<HTMLDivElement>();

  constructor(props: LoadingProps) {
    super(props);
    bindCtx(['work', 'stop', 'rest', 'reset'], this);
  }

  componentDidMount() {
    this.work();
  }

  componentWillUnmount() {
    this.rest();
  }

  removeClass = (className: string, el?: Element) => {
    className.split(' ').forEach(cl => {
      (el || this.wrapRef.current)?.classList.remove(cl);
    });
  };

  addClass = (className: string, el?: Element) => {
    className.split(' ').forEach(cl => {
      (el || this.wrapRef.current)?.classList.add(cl);
    });
  };

  work() {
    if (this.status !== 'loading') this.status = 'working';
    this.wait(() => {
      this.removeClass('hidden');
      this.addClass('working');
    });
  }

  robot() {
    this.status = 'robot';
    this.wait(() => {
      this.addClass('robot');
    });
  }

  wait(call?: (...args: any[]) => void) {
    if (this.processing !== true) {
      this.abort();
      this.processing = true;

      setTimeout(() => {
        if (typeof call === 'function' && call) call();
        this.waiting();
        this.interval = setInterval(this.waiting, OPTIONS.duration);
      }, OPTIONS.delay);
    }
  }

  rest() {
    this.abort();
    this.status = 'rest';
    setTimeout(() => {
      this.abort();
      this.addClass('rest');
      this.addClass('hidden');
    }, OPTIONS.delay);
  }

  waiting() {
    if (this.enough !== true) {
      // eslint-disable-next-line no-plusplus
      ++this.iteration;
      return;
    }

    this.stopping();
  }

  stop(callback: () => void) {
    setTimeout(() => {
      if (this.processing === true) {
        this.enough = true;
        this.callback = callback;
        Array.prototype.forEach.call((this.wrapRef.current?.childNodes || []), (child: Element) => {
          child.setAttribute(
            'style',
            `animation-iteration-count: ${this.iteration}; -webkit-animation-iteration-count: ${this.iteration};`
          );
        });
      }
    }, OPTIONS.delay);
  }

  stopping() {
    clearInterval(this.interval as unknown as number);
    this.rest();

    if (typeof this.callback === 'function' && this.callback) this.callback();
    this.reset();
  }

  abort() {
    if (this.status === 'robot') this.removeClass('robot');
    else if (this.status !== 'loading' && this.processing !== true) this.removeClass(`${OPTIONS.classes} loading`);
    else this.removeClass(OPTIONS.classes);
  }

  reset() {
    this.iteration = 0;
    this.processing = false;
    this.enough = false;
    this.interval = null;
    this.callback = null;

    Array.prototype.forEach.call((this.wrapRef.current?.childNodes || []), (child: Element) => {
      child.removeAttribute('style');
    });
    this.removeClass('hidden');
  }

  render() {
    return (
      <div className="loading" id="identity" ref={this.wrapRef}>
        <div />
        <div />
        <div />
        <div />
      </div>
    );
  }
}
