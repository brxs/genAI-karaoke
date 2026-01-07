// Random style generator - uses a template approach similar to random topics

const STYLE_TEMPLATES = [
  "{medium} with {quality} and {elements}",
  "{era} {medium} featuring {elements}",
  "{medium} in {era} style with {quality}",
  "{culture} {medium} with {elements}",
  "{medium} inspired by {culture} aesthetics",
  "{era} {culture} {medium}",
  "{quality} {medium} with {elements}",
  "Hyper-detailed {medium} featuring {quality}",
  "{culture}-inspired {era} {medium}",
  "{medium} mixing {era} and {culture} influences",
];

const MEDIUMS = [
  "oil painting",
  "watercolor",
  "digital illustration",
  "pencil sketch",
  "woodcut print",
  "collage",
  "photograph",
  "pastel drawing",
  "ink wash",
  "mosaic",
  "fresco",
  "screen print",
  "charcoal drawing",
  "gouache painting",
  "linocut",
  "engraving",
  "pixel art",
  "vector art",
  "3D render",
  "clay sculpture",
];

const QUALITIES = [
  "soft pastels",
  "bold contrasts",
  "muted tones",
  "vibrant saturation",
  "dreamy blur",
  "crisp detail",
  "grainy texture",
  "smooth gradients",
  "rough brushstrokes",
  "geometric precision",
  "organic flow",
  "chromatic aberration",
  "film grain",
  "iridescent shimmer",
  "metallic sheen",
  "neon glow",
  "sepia tones",
  "monochrome palette",
  "rainbow spectrum",
  "earth tones",
];

const ELEMENTS = [
  "floating geometric shapes",
  "swirling patterns",
  "nature motifs",
  "mechanical components",
  "celestial bodies",
  "abstract faces",
  "intricate borders",
  "scattered typography",
  "light rays",
  "rippling water",
  "fractured glass",
  "growing vines",
  "dancing flames",
  "drifting clouds",
  "crystalline structures",
  "melting forms",
  "tessellated patterns",
  "particle effects",
  "lens flares",
  "halftone dots",
];

const ERAS = [
  "1920s Art Deco",
  "1950s retro",
  "1960s psychedelic",
  "1970s disco",
  "1980s synthwave",
  "1990s grunge",
  "2000s Y2K",
  "Victorian",
  "Medieval",
  "Renaissance",
  "Baroque",
  "Art Nouveau",
  "Bauhaus",
  "Memphis Design",
  "Brutalist",
  "Minimalist",
  "Maximalist",
  "Futuristic",
  "Retro-futuristic",
  "Cyberpunk",
];

const CULTURES = [
  "Japanese",
  "Scandinavian",
  "Mexican",
  "Egyptian",
  "Greek",
  "Chinese",
  "Indian",
  "Celtic",
  "African",
  "Native American",
  "Persian",
  "Moroccan",
  "Thai",
  "Russian",
  "Brazilian",
  "Polynesian",
  "Korean",
  "Italian",
  "Dutch",
  "Aztec",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateRandomStyle(): string {
  const template = pickRandom(STYLE_TEMPLATES);
  return template
    .replace("{medium}", pickRandom(MEDIUMS))
    .replace("{quality}", pickRandom(QUALITIES))
    .replace("{elements}", pickRandom(ELEMENTS))
    .replace("{era}", pickRandom(ERAS))
    .replace("{culture}", pickRandom(CULTURES));
}
