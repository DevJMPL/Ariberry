// Íconos sencillos en SVG (sin librerías extra para que la página pese poco).
type P = React.SVGProps<SVGSVGElement>;
const base = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export const BagIcon = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </svg>
);
export const SearchIcon = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);
export const CloseIcon = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const BackIcon = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M15 5l-7 7 7 7" />
  </svg>
);
export const PinIcon = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);
export const PlusIcon = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const MinusIcon = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M5 12h14" />
  </svg>
);
export const TrashIcon = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  </svg>
);
export const CheckIcon = (p: P) => (
  <svg {...base} {...p} aria-hidden="true">
    <path d="m5 12 5 5 9-10" />
  </svg>
);
export const WhatsAppIcon = (p: P) => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor" {...p} aria-hidden="true">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.4.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.4-.3Z" />
  </svg>
);
