import type { ReactNode } from "react";

/**
 * Defines the available visual variants for the status card.
 * 'info': Standard informational status.
 * 'success': Positive confirmation status.
 * 'error': Negative or alert status.
 */
type StatusVariant = "info" | "success" | "error";

interface StatusCardProps {
  /** The icon component to display at the top of the card. */
  icon: ReactNode;
  /** Visual variant theme for the icon container. Defaults to 'info'. */
  variant?: StatusVariant;
  /** The primary heading/title of the status message. */
  title: string;
  /** Detailed explanatory text below the title. */
  description: string;
  /** Optional content (e.g., forms, action buttons) to render below the description. */
  children?: ReactNode;
  /** Optional footer link or call-to-action text. */
  footerLink?: ReactNode;
}

/**
 * Maps the StatusVariant to specific Tailwind CSS classes.
 * This ensures visual consistency across different status types.
 */
const variantStyles: Record<StatusVariant, string> = {
  info: "bg-blue-100 text-[#0047AB]",
  success: "bg-blue-100 text-[#0047AB]",
  error: "bg-red-100 text-red-600",
};

/**
 * StatusCard Component
 * 
 * A reusable layout component used to display feedback messages, 
 * such as success notifications, error states, or general information.
 */
function StatusCard({
  icon,
  variant = "info",
  title,
  description,
  children,
  footerLink,
}: StatusCardProps) {
  return (
    <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
      <div className="flex flex-col items-center text-center">
        {/* Icon Container: Styles are applied dynamically based on the variant prop */}
        <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${variantStyles[variant]}`}>
          {icon}
        </div>
        
        {/* Title and Description Section */}
        <h1 className="text-xl font-bold text-[#1A1A1A]">{title}</h1>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      </div>

      {/* Optional Content: Conditionally render additional elements like buttons or forms */}
      {children && <div className="mt-6">{children}</div>}

      {/* Optional Footer: Conditionally render links at the bottom of the card */}
      {footerLink && <div className="mt-4 text-center text-sm">{footerLink}</div>}
    </div>
  );
}

export default StatusCard;