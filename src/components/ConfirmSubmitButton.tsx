"use client";

export function ConfirmSubmitButton({
  confirmMessage,
  className,
  disabled,
  title,
  children,
}: {
  confirmMessage: string;
  className?: string;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      disabled={disabled}
      title={title}
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
