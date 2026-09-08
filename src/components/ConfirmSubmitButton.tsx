"use client";

export function ConfirmSubmitButton({
  confirmMessage,
  className,
  disabled,
  children,
}: {
  confirmMessage: string;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      disabled={disabled}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
