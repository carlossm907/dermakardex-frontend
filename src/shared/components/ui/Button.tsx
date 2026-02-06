interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  isLoading = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const baseClass = variant === "primary" ? "btn-primary" : "btn-secondary";

  return (
    <button
      className={`${baseClass} ${className} relative`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="opacity-0">{children}</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        </>
      ) : (
        children
      )}
    </button>
  );
};
