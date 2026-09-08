"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import CheckoutPanel from "./CheckoutPanel";

export default function CheckoutDialog({ price }: { price: number }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (!opened) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [opened]);

  function close() {
    dialog.current?.close();
    setOpened(false);
  }

  return (
    <>
      <button
        className="quiet-buy"
        aria-haspopup="dialog"
        onClick={() => {
          setOpened(true);
          dialog.current?.showModal();
        }}
      >
        Get the bundle <span aria-hidden="true">—</span> ${price}
      </button>
      <dialog
        ref={dialog}
        className="checkout-dialog"
        aria-labelledby={titleId}
        onClose={() => setOpened(false)}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            close();
        }}
      >
        <button
          className="dialog-close"
          aria-label="Close checkout"
          onClick={close}
          autoFocus
        >
          <X size={20} />
        </button>
        <h2 id={titleId} className="sr-only">
          Developer Job Search Playbook checkout
        </h2>
        {opened && <CheckoutPanel />}
      </dialog>
    </>
  );
}
