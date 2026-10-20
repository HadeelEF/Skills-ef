import { useEffect, useRef, type RefObject } from 'react';
import { useBlocker } from 'react-router';
import { requestMessages } from '../messages';

const m = requestMessages.form;

/**
 * Blocks in-app navigation while a draft is dirty. `bypass` is set by the caller in the event
 * handler right before navigating after a successful save: reading a ref at navigation time avoids
 * blocking our own redirect with a `when` value captured before the save re-rendered.
 * beforeunload (tab close/reload) is a separate, best-effort concern and unreliable on mobile.
 */
export function UnsavedChangesGuard({ when, bypass }: { when: boolean; bypass: RefObject<boolean> }) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      when && !bypass.current && currentLocation.pathname !== nextLocation.pathname,
  );
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (blocker.state === 'blocked' && !dialog.open) dialog.showModal(); // native modal: focus trap + Esc
    if (blocker.state !== 'blocked' && dialog.open) dialog.close();
  }, [blocker.state]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="unsaved-title"
      aria-describedby="unsaved-body"
      onCancel={() => blocker.reset?.()}
    >
      <h2 id="unsaved-title">{m.unsavedTitle}</h2>
      <p id="unsaved-body">{m.unsavedBody}</p>
      <button type="button" autoFocus onClick={() => blocker.reset?.()}>
        {m.stay}
      </button>
      <button type="button" onClick={() => blocker.proceed?.()}>
        {m.leave}
      </button>
    </dialog>
  );
}
