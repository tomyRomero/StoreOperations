"use client";

import * as React from "react";

// Radix dialogs give focus back only to their own Trigger. One opened some other way (a plain button,
// a form's submit) has none, so on close focus would fall to the top of the page and a keyboard user
// would lose their place. This remembers what had focus when the dialog opened and goes
// back to it. A caller's own onCloseAutoFocus runs first and wins if it calls preventDefault.
export function useReturnFocus(onCloseAutoFocus?: (event: Event) => void) {
  const opener = React.useRef<HTMLElement | null>(null);

  // Passed as the dialog content's ref: runs as it mounts, before Radix moves focus into it
  const noteOpener = React.useCallback((node: HTMLElement | null) => {
    const focused = document.activeElement;
    if (node && focused instanceof HTMLElement && focused !== document.body) opener.current = focused;
  }, []);

  const handleCloseAutoFocus = (event: Event) => {
    onCloseAutoFocus?.(event);
    const target = opener.current;
    opener.current = null;
    if (event.defaultPrevented || !target?.isConnected) return;
    event.preventDefault();
    target.focus({ preventScroll: true });
  };

  return { noteOpener, handleCloseAutoFocus };
}
