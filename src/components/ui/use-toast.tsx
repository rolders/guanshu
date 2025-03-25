import * as React from "react";

const TOAST_LIMIT = 5;
export const TOAST_REMOVE_DELAY = 3000;

type ToastType = "default" | "destructive" | "success";

export type ToastProps = {
  id: string;
  title?: string;
  description?: string;
  type?: ToastType;
  duration?: number;
};

type ToasterToast = ToastProps & {
  dismiss: () => void;
};

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const TOAST_STORE: ToasterToast[] = [];

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    TOAST_STORE.splice(
      TOAST_STORE.findIndex((toast) => toast.id === toastId),
      1
    );
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export function toast(props: Omit<ToastProps, "id">) {
  const id = genId();

  const update = (props: ToastProps) =>
    TOAST_STORE.find((toast) => toast.id === id);

  const dismiss = () => {
    TOAST_STORE.splice(
      TOAST_STORE.findIndex((toast) => toast.id === id),
      1
    );
  };

  const newToast = {
    ...props,
    id,
    dismiss,
  };

  TOAST_STORE.push(newToast);

  if (TOAST_STORE.length > TOAST_LIMIT) {
    TOAST_STORE.shift();
  }

  addToRemoveQueue(id);

  return {
    id,
    dismiss,
    update,
  };
} 