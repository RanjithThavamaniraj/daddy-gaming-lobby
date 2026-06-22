const LOGO_SRC = "/logo.png";

export default function BrandLogo({ className = "", alt = "Daddy Gaming Lobby" }) {
  return <img src={LOGO_SRC} alt={alt} className={className} />;
}
