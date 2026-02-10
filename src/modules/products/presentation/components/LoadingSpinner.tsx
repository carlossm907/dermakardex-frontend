interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Cargando...",
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`text-center py-12 ${className}`}>
      <div
        className={`inline-block ${sizeClasses[size]} border-4 border-primary-600 border-t-transparent rounded-full animate-spin`}
      />
      {message && <p className="mt-4 text-neutral-600">{message}</p>}
    </div>
  );
};
