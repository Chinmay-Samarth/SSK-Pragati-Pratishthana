type BrandLogoProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_CLASS = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-20 w-20",
};

export function BrandLogo({ size = "md", className = "" }: BrandLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/ssk-logo.jpg"
      alt="SSK Pragati Pratishthana logo"
      className={`${SIZE_CLASS[size]} shrink-0 rounded-full object-cover ${className}`}
    />
  );
}
