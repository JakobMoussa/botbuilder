"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionContextValue {
  openItem: string | null;
  toggleItem: (value: string) => void;
}

const AccordionContext = React.createContext<AccordionContextValue>({
  openItem: null,
  toggleItem: () => {},
});

export function Accordion({
  children,
  className,
  defaultValue = null,
}: {
  children: React.ReactNode;
  className?: string;
  defaultValue?: string | null;
}) {
  const [openItem, setOpenItem] = React.useState<string | null>(defaultValue);

  const toggleItem = (value: string) => {
    setOpenItem((prev) => (prev === value ? null : value));
  };

  return (
    <AccordionContext.Provider value={{ openItem, toggleItem }}>
      <div className={cn("divide-y divide-slate-200 dark:divide-slate-800", className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  children,
  value,
  className,
}: {
  children: React.ReactNode;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("py-2", className)} data-state={value}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { value } as unknown as React.Attributes);
        }
        return child;
      })}
    </div>
  );
}

export function AccordionTrigger({
  children,
  value,
  className,
}: {
  children: React.ReactNode;
  value?: string;
  className?: string;
}) {
  const { openItem, toggleItem } = React.useContext(AccordionContext);
  const isOpen = openItem === value;

  return (
    <button
      type="button"
      onClick={() => value && toggleItem(value)}
      className={cn(
        "flex w-full items-center justify-between py-4 text-left font-semibold text-slate-900 transition-all hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400 cursor-pointer",
        className
      )}
      aria-expanded={isOpen}
    >
      <span className="text-base sm:text-lg">{children}</span>
      <ChevronDown
        className={cn(
          "h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200",
          isOpen && "rotate-180 text-indigo-600"
        )}
      />
    </button>
  );
}

export function AccordionContent({
  children,
  value,
  className,
}: {
  children: React.ReactNode;
  value?: string;
  className?: string;
}) {
  const { openItem } = React.useContext(AccordionContext);
  const isOpen = openItem === value;

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "pb-4 pt-1 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed transition-all",
        className
      )}
    >
      {children}
    </div>
  );
}
