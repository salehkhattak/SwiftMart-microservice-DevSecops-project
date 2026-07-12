const paletteByCategory = {
  Laptops: ["#eaf3ff", "#b8d9ff", "#1167b1"],
  Accessories: ["#fff7de", "#ffe09b", "#b77900"],
  Storage: ["#edf8f3", "#bfe8d3", "#168a50"],
  Networking: ["#eef4ff", "#c8d8ff", "#3949ab"],
  Audio: ["#fff0f0", "#ffc9c9", "#cf3f3f"],
};

const normalize = (value = "") => value.toLowerCase();

const productShape = (product) => {
  const name = normalize(product.name);
  const category = normalize(product.category);

  if (name.includes("headphone") || category.includes("audio")) {
    return `
      <path d="M180 166a76 76 0 0 1 152 0" fill="none" stroke="#172033" stroke-width="18" stroke-linecap="round"/>
      <rect x="126" y="164" width="58" height="92" rx="24" fill="#172033"/>
      <rect x="328" y="164" width="58" height="92" rx="24" fill="#172033"/>
      <rect x="144" y="180" width="24" height="58" rx="12" fill="#ffffff" opacity=".22"/>
      <rect x="344" y="180" width="24" height="58" rx="12" fill="#ffffff" opacity=".22"/>
    `;
  }

  if (name.includes("router") || category.includes("network")) {
    return `
      <rect x="132" y="182" width="248" height="86" rx="24" fill="#172033"/>
      <rect x="164" y="210" width="78" height="12" rx="6" fill="#ffffff" opacity=".24"/>
      <circle cx="294" cy="216" r="8" fill="#f7b731"/>
      <circle cx="326" cy="216" r="8" fill="#35c77a"/>
      <circle cx="358" cy="216" r="8" fill="#6aa9ff"/>
      <path d="M168 172l-28-72" stroke="#172033" stroke-width="12" stroke-linecap="round"/>
      <path d="M344 172l28-72" stroke="#172033" stroke-width="12" stroke-linecap="round"/>
    `;
  }

  if (name.includes("ssd") || category.includes("storage")) {
    return `
      <rect x="176" y="92" width="160" height="232" rx="34" fill="#172033"/>
      <rect x="202" y="122" width="108" height="70" rx="18" fill="#ffffff" opacity=".16"/>
      <rect x="214" y="220" width="84" height="12" rx="6" fill="#ffffff" opacity=".28"/>
      <rect x="226" y="248" width="60" height="12" rx="6" fill="#ffffff" opacity=".18"/>
    `;
  }

  if (name.includes("mouse") || category.includes("accessor")) {
    return `
      <rect x="198" y="80" width="116" height="230" rx="58" fill="#172033"/>
      <path d="M256 88v74" stroke="#ffffff" stroke-width="8" stroke-linecap="round" opacity=".28"/>
      <rect x="244" y="118" width="24" height="44" rx="12" fill="#f7b731"/>
      <ellipse cx="256" cy="310" rx="76" ry="18" fill="#172033" opacity=".16"/>
    `;
  }

  return `
    <path d="M126 132h260a20 20 0 0 1 20 20v132H106V152a20 20 0 0 1 20-20z" fill="#172033"/>
    <rect x="132" y="158" width="248" height="104" rx="10" fill="#ffffff" opacity=".16"/>
    <path d="M86 284h340l-32 54H118z" fill="#26344f"/>
    <path d="M206 304h100l16 18H190z" fill="#ffffff" opacity=".18"/>
  `;
};

export const getProductImage = (product) => {
  const [bg, glow, accent] =
    paletteByCategory[product.category] || ["#eef4ff", "#c8d8ff", "#1167b1"];

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="512" height="384" viewBox="0 0 512 384" role="img" aria-label="${product.name}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${bg}"/>
          <stop offset="1" stop-color="${glow}"/>
        </linearGradient>
        <radialGradient id="halo" cx="50%" cy="42%" r="58%">
          <stop offset="0" stop-color="#ffffff" stop-opacity=".95"/>
          <stop offset=".58" stop-color="${bg}" stop-opacity=".68"/>
          <stop offset="1" stop-color="${glow}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="512" height="384" rx="36" fill="url(#bg)"/>
      <circle cx="256" cy="174" r="148" fill="url(#halo)"/>
      <path d="M86 318c88 30 252 30 340 0" fill="none" stroke="${accent}" stroke-width="20" stroke-linecap="round" opacity=".28"/>
      ${productShape(product)}
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};
