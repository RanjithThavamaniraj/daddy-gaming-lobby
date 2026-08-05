import { useId, useState } from "react";

/**
 * Info tooltip for Reserve Players headings.
 * Hover (desktop) / tap (mobile).
 */
export default function ReserveInfoTooltip() {
  const tipId = useId();
  const [open, setOpen] = useState(false);

  return (
    <span className="reserve-info">
      <button
        type="button"
        className="reserve-info-btn"
        aria-label="About reserve players"
        aria-expanded={open}
        aria-controls={tipId}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        ℹ️
      </button>
      {open ? (
        <span
          id={tipId}
          role="tooltip"
          className="reserve-info-popover"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <strong className="reserve-info-title">Reserve Players</strong>
          <span className="reserve-info-body">
            Reserve players are invited if a confirmed player withdraws before
            the tournament begins.
          </span>
          <span className="reserve-info-body">
            Reserve positions are assigned in registration order.
          </span>
        </span>
      ) : null}
    </span>
  );
}
