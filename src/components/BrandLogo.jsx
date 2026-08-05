const LOGO_SRC = "/images/logo/dgl-logo.jpg";

/**
 * Official DGL brand mark. Eager-loaded for navbar/header LCP.
 * @param {object} props
 * @param {string} [props.className]
 * @param {string} [props.alt]
 */
export default function BrandLogo({ className = "", alt = "Daddy Gaming Lobby" }) {
  return (
    <img
      src={LOGO_SRC}
      alt={alt}
      className={className}
      width={48}
      height={48}
      loading="eager"
      decoding="async"
      fetchPriority="high"
    />
  );
}
