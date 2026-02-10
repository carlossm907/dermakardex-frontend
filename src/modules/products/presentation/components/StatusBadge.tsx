interface StatusBadgeProps {
  isActive: boolean;
  activeText?: string;
  inactiveText?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  isActive,
  activeText = "Activo",
  inactiveText = "Inactivo",
  className = "",
}) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive
          ? "bg-green-100 text-green-800"
          : "bg-neutral-100 text-neutral-800"
      } ${className}`}
    >
      {isActive ? activeText : inactiveText}
    </span>
  );
};
