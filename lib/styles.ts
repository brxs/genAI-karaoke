export type SlideStyle =
  | "retro"
  | "comic"
  | "chalkboard"
  | "scifi"
  | "vaporwave"
  | "pixel"
  | "corporate"
  | "vintage"
  | "minimalist"
  | "nature"
  | "newspaper"
  | "noir"
  | "kawaii"
  | "cyberpunk"
  | "watercolor"
  | "medieval"
  | "horror"
  | "custom";

export interface StyleConfig {
  id: SlideStyle;
  name: string;
  description: string;
  prompt: string;
  gradient: string;
  icon: string;
}

export const STYLES: Record<SlideStyle, StyleConfig> = {
  retro: {
    id: "retro",
    name: "Retro 80s",
    description: "Neon synthwave aesthetic",
    prompt: "Retro 80s synthwave style with neon pink and cyan colors, black background, glowing grid lines, sunset gradient accents, bold geometric shapes, VHS aesthetic, 16:9 aspect ratio, high quality text rendering",
    gradient: "from-rose-500 via-fuchsia-500 to-cyan-500",
    icon: "sunset",
  },
  comic: {
    id: "comic",
    name: "Comic",
    description: "Pop art superhero style",
    prompt: "Comic book pop art style with bold black outlines, halftone dot patterns, bright primary colors, action-style text effects, speech bubble aesthetic, Ben-Day dots, 16:9 aspect ratio, high quality text rendering",
    gradient: "from-yellow-400 via-red-500 to-blue-600",
    icon: "zap",
  },
  chalkboard: {
    id: "chalkboard",
    name: "Chalk",
    description: "Hand-drawn classroom look",
    prompt: "Chalkboard style with dark green or black background, white and colored chalk text effect, hand-drawn sketchy illustrations, chalk dust texture, educational classroom aesthetic, 16:9 aspect ratio, high quality text rendering",
    gradient: "from-emerald-800 to-zinc-900",
    icon: "pencil",
  },
  scifi: {
    id: "scifi",
    name: "Sci-Fi",
    description: "Futuristic space theme",
    prompt: "Futuristic sci-fi style with dark space background, holographic blue and cyan glowing elements, circuit board patterns, high-tech interface design, sleek metallic accents, 16:9 aspect ratio, high quality text rendering",
    gradient: "from-zinc-800 via-sky-900 to-cyan-900",
    icon: "rocket",
  },
  vaporwave: {
    id: "vaporwave",
    name: "Vaporwave",
    description: "Aesthetic internet vibes",
    prompt: "Vaporwave aesthetic with pink and teal gradients, Greek statue elements, palm trees, retro computer graphics, glitch effects, Japanese text accents, dreamy pastel colors, 16:9 aspect ratio, high quality text rendering",
    gradient: "from-pink-400 via-purple-400 to-cyan-400",
    icon: "cloud",
  },
  pixel: {
    id: "pixel",
    name: "Pixel Art",
    description: "8-bit video game style",
    prompt: "Pixel art 8-bit video game style with chunky pixels, limited color palette, retro gaming aesthetic, blocky characters and icons, nostalgic arcade vibes, 16:9 aspect ratio, high quality text rendering",
    gradient: "from-green-500 via-lime-400 to-emerald-600",
    icon: "gamepad",
  },
  corporate: {
    id: "corporate",
    name: "Corporate",
    description: "Professional boardroom vibes",
    prompt: "Corporate presentation style with blue gradient background, clean professional layout, modern sans-serif typography, subtle geometric patterns, business-appropriate imagery, 16:9 aspect ratio, high quality text rendering",
    gradient: "from-slate-600 to-slate-800",
    icon: "briefcase",
  },
  vintage: {
    id: "vintage",
    name: "Vintage",
    description: "Old-school academic",
    prompt: "Vintage academic style with aged paper texture, sepia and cream tones, classic serif typography, antique illustrations, old book aesthetic, subtle worn edges, 16:9 aspect ratio, high quality text rendering",
    gradient: "from-amber-600 to-orange-800",
    icon: "scroll",
  },
  minimalist: {
    id: "minimalist",
    name: "Minimal",
    description: "Clean and simple",
    prompt: "Minimalist design with lots of white space, simple geometric shapes, monochromatic color scheme with one accent color, clean sans-serif typography, elegant simplicity, 16:9 aspect ratio, high quality text rendering",
    gradient: "from-zinc-100 to-zinc-300",
    icon: "minus",
  },
  nature: {
    id: "nature",
    name: "Nature",
    description: "Organic earthy vibes",
    prompt: "Nature-inspired design with organic shapes, earth tones, botanical illustrations, leaf and plant motifs, watercolor textures, forest greens and warm browns, 16:9 aspect ratio, high quality text rendering",
    gradient: "from-green-600 via-emerald-500 to-teal-600",
    icon: "leaf",
  },
  newspaper: {
    id: "newspaper",
    name: "Tabloid",
    description: "Breaking news headlines",
    prompt: "Sensational tabloid newspaper style with bold headlines, black and white with red accents, dramatic typography, newspaper column layout, vintage print texture, shocking headline aesthetic, 16:9 aspect ratio, high quality text rendering",
    gradient: "from-zinc-800 via-red-700 to-zinc-900",
    icon: "newspaper",
  },
  noir: {
    id: "noir",
    name: "Film Noir",
    description: "Detective mystery vibes",
    prompt: "Classic film noir style with high contrast black and white, dramatic shadows, venetian blind lighting, 1940s detective aesthetic, cigarette smoke wisps, fedora silhouettes, moody atmospheric lighting, 16:9 aspect ratio, high quality text rendering",
    gradient: "from-zinc-900 via-slate-800 to-zinc-950",
    icon: "eye",
  },
  kawaii: {
    id: "kawaii",
    name: "Kawaii",
    description: "Cute pastel Japanese",
    prompt: "Kawaii Japanese cute style with soft pastel colors, adorable cartoon characters, sparkles and stars, rounded shapes, pink and mint color palette, chibi aesthetic, happy faces on everything, 16:9 aspect ratio, high quality text rendering",
    gradient: "from-pink-300 via-purple-300 to-cyan-300",
    icon: "heart",
  },
  cyberpunk: {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Neon dystopian future",
    prompt: "Cyberpunk dystopian style with neon pink and electric blue, rain-soaked city reflections, holographic glitches, Japanese neon signs, dark urban atmosphere, chrome accents, digital corruption effects, 16:9 aspect ratio, high quality text rendering",
    gradient: "from-fuchsia-600 via-violet-600 to-cyan-500",
    icon: "cpu",
  },
  watercolor: {
    id: "watercolor",
    name: "Watercolor",
    description: "Soft artistic painting",
    prompt: "Watercolor painting style with soft bleeding colors, paper texture, artistic brush strokes, gentle color washes, impressionistic feel, organic flowing shapes, muted pastel palette, 16:9 aspect ratio, high quality text rendering",
    gradient: "from-sky-400 via-rose-300 to-amber-300",
    icon: "droplet",
  },
  medieval: {
    id: "medieval",
    name: "Medieval",
    description: "Illuminated manuscript",
    prompt: "Medieval illuminated manuscript style with ornate gold leaf borders, intricate Celtic patterns, aged parchment texture, gothic calligraphy, heraldic symbols, monastery scribe aesthetic, rich burgundy and gold colors, 16:9 aspect ratio, high quality text rendering",
    gradient: "from-amber-700 via-red-800 to-amber-900",
    icon: "crown",
  },
  horror: {
    id: "horror",
    name: "Horror",
    description: "Spooky dark vibes",
    prompt: "Horror style with dark eerie atmosphere, blood red accents, creepy fog effects, gothic fonts, haunted house aesthetic, scratchy distressed textures, ominous shadows, Halloween spooky vibes, 16:9 aspect ratio, high quality text rendering",
    gradient: "from-red-900 via-zinc-900 to-black",
    icon: "skull",
  },
  custom: {
    id: "custom",
    name: "Custom",
    description: "Define your own style",
    prompt: "",
    gradient: "from-zinc-600 to-zinc-800",
    icon: "sparkles",
  },
};

export const STYLE_LIST = Object.values(STYLES);
export const DEFAULT_STYLE: SlideStyle = "retro";
