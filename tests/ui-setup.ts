import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom has no native dialog methods, top layer or browser Escape handling.
// These shims cover open/close events and focus return, not a real focus trap.
// Keyboard containment and background scrolling still need browser checks.
const previousFocus = new WeakMap<HTMLDialogElement, HTMLElement>();

// jsdom does not calculate viewport media queries. UI unit tests stay mobile;
// resizing across the actual breakpoint is checked in a browser separately.
if (typeof window.matchMedia !== 'function') {
  window.matchMedia = (media: string) => {
    const events = new EventTarget();
    return Object.assign(events, {
      media,
      matches: false,
      onchange: null,
      addListener(listener: ((event: MediaQueryListEvent) => void) | null) {
        if (listener) events.addEventListener('change', listener as EventListener);
      },
      removeListener(listener: ((event: MediaQueryListEvent) => void) | null) {
        if (listener) events.removeEventListener('change', listener as EventListener);
      },
    }) as MediaQueryList;
  };
}

if (typeof HTMLDialogElement.prototype.showModal !== 'function') {
  HTMLDialogElement.prototype.showModal = function showModal() {
    if (this.open) return;
    if (document.activeElement instanceof HTMLElement) {
      previousFocus.set(this, document.activeElement);
    }
    this.open = true;
    this.querySelector<HTMLElement>('[autofocus], button:not(:disabled), a[href], input:not(:disabled)')?.focus();
  };

  HTMLDialogElement.prototype.close = function close(returnValue?: string) {
    if (!this.open) return;
    if (returnValue !== undefined) this.returnValue = returnValue;
    this.open = false;
    previousFocus.get(this)?.focus();
    previousFocus.delete(this);
    this.dispatchEvent(new Event('close'));
  };

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const dialog = document.querySelector<HTMLDialogElement>('dialog[open]');
    if (!dialog) return;
    const cancel = new Event('cancel', { cancelable: true });
    if (dialog.dispatchEvent(cancel)) dialog.close();
  });
}

afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
  document.documentElement.style.overflow = '';
});
