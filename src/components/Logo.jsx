import grandparentsPinIconUrl from '../../icons/grandparents.png';

// Source pin art is 427×512 (portrait, not square) — keep its natural aspect ratio.
const ICON_ASPECT_RATIO = 427 / 512;

const Logo = ({ size = 28, gap = 8, className = '', imgClassName = '', children }) => (
  <span className={`inline-flex items-center align-middle ${className}`} style={{ gap }}>
    <img
      src={grandparentsPinIconUrl}
      alt=""
      width={Math.round(size * ICON_ASPECT_RATIO)}
      height={size}
      className={`shrink-0 ${imgClassName}`}
      style={{ display: 'block', width: Math.round(size * ICON_ASPECT_RATIO), height: size }}
    />
    {children || <span className="brand-wordmark">hometown play mats</span>}
  </span>
);

export default Logo;
