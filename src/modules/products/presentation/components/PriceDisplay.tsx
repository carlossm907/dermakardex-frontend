interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  currency?: string;
  showDiscount?: boolean;
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  originalPrice,
  currency = "PEN",
  showDiscount = false,
  className = "",
}) => {
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: currency,
    }).format(value);
  };

  const hasDiscount = showDiscount && originalPrice && originalPrice > price;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {hasDiscount && (
        <span className="text-sm text-neutral-400 line-through">
          {formatPrice(originalPrice)}
        </span>
      )}
      <span
        className={`font-semibold ${
          hasDiscount ? "text-green-600" : "text-neutral-900"
        }`}
      >
        {formatPrice(price)}
      </span>
    </div>
  );
};
