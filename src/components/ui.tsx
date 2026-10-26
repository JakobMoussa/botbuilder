"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Loader2, Sparkles, ArrowUpRight } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  type ButtonHTMLAttributes,
  type ReactNode,
  type ReactElement,
} from "react";
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
export function Button({
  children,
  variant = "primary",
  busy,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  busy?: boolean;
}) {
  return (
    <button
      {...props}
      disabled={busy || props.disabled}
      className={cn("button", variant, className)}
    >
      {busy && <Loader2 size={16} className="spin" />}
      {children}
    </button>
  );
}
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal-content">
          <div className="modal-heading">
            <div>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.Description>
                {description ||
                  "Passe die Einstellungen für deinen Workspace an."}
              </Dialog.Description>
            </div>
            <Dialog.Close className="icon-button" aria-label="Schließen">
              <X size={20} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  const id = useId();
  function associate(nodes: ReactNode): ReactNode {
    return Children.map(nodes, (node) => {
      if (!isValidElement(node)) return node;
      const element = node as ReactElement<Record<string, unknown>>;
      if (["input", "textarea", "select"].includes(String(element.type)))
        return cloneElement(element, {
          "aria-labelledby": id,
          "aria-describedby": hint ? id + "-hint" : undefined,
        });
      return element.props.children
        ? cloneElement(
            element,
            {},
            associate(element.props.children as ReactNode),
          )
        : element;
    });
  }
  return (
    <label className="field">
      <span id={id}>{label}</span>
      {associate(children)}
      {hint && <small id={id + "-hint"}>{hint}</small>}
    </label>
  );
}
export function Badge({
  active,
  children,
}: {
  active?: boolean;
  children?: ReactNode;
}) {
  return (
    <span className={cn("badge", active ? "green" : "neutral")}>
      <i />
      {children || (active ? "Aktiv" : "Entwurf")}
    </span>
  );
}
export function Empty({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Sparkles size={25} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function Skeleton() {
  return (
    <div className="skeleton-group">
      <div className="skeleton title-skeleton" />
      <div className="stat-grid">
        {[1, 2, 3, 4].map((n) => (
          <div className="skeleton stat-skeleton" key={n} />
        ))}
      </div>
      <div className="skeleton panel-skeleton" />
    </div>
  );
}
export function Stat({
  label,
  value,
  icon,
  note,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  note?: string;
}) {
  return (
    <div className="stat">
      <div className="stat-top">
        <span>{label}</span>
        {icon}
      </div>
      <strong>{value}</strong>
      <small>
        {note || "In diesem Zeitraum"}
        <ArrowUpRight size={13} />
      </small>
    </div>
  );
}
