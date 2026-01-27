import JSZip from "jszip";
import { Slide } from "./types";

// SSR safety check
function isClient(): boolean {
  return typeof document !== "undefined";
}

// Helper to get image data as base64
async function getImageBase64(slide: Slide): Promise<string | null> {
  if (slide.imageBase64) return slide.imageBase64;
  if (!slide.imageUrl) return null;

  try {
    const response = await fetch(slide.imageUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix to get just the base64
        const base64Data = base64.split(",")[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Failed to fetch image:", error);
    return null;
  }
}

// Helper to check if slide has any image
function hasImage(slide: Slide): boolean {
  return !!(slide.imageBase64 || slide.imageUrl);
}

export async function downloadSlide(slide: Slide, topic: string): Promise<void> {
  if (!isClient()) return;

  const base64 = await getImageBase64(slide);
  if (!base64) return;

  const link = document.createElement("a");
  link.href = `data:image/png;base64,${base64}`;
  link.download = `${sanitizeFilename(topic)}-slide-${slide.slideNumber}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function downloadAllSlides(slides: Slide[], topic: string): Promise<void> {
  if (!isClient()) return;

  const slidesWithImages = slides.filter(hasImage);

  if (slidesWithImages.length === 0) return;

  const zip = new JSZip();
  const folder = zip.folder(sanitizeFilename(topic));

  if (!folder) return;

  // Fetch all images in parallel
  await Promise.all(
    slidesWithImages.map(async (slide) => {
      const base64 = await getImageBase64(slide);
      if (base64) {
        folder.file(`slide-${slide.slideNumber}.png`, base64, { base64: true });
      }
    })
  );

  const blob = await zip.generateAsync({ type: "blob" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${sanitizeFilename(topic)}-slides.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export async function downloadAsPDF(slides: Slide[], topic: string): Promise<void> {
  if (!isClient()) return;

  const slidesWithImages = slides.filter(hasImage);

  if (slidesWithImages.length === 0) return;

  const jsPDF = (await import("jspdf")).default;
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [1920, 1080],
  });

  // Fetch all images first
  const imagesData = await Promise.all(
    slidesWithImages.map(async (slide) => ({
      slide,
      base64: await getImageBase64(slide),
    }))
  );

  imagesData.forEach(({ base64 }, index) => {
    if (!base64) return;
    if (index > 0) pdf.addPage();
    pdf.addImage(`data:image/png;base64,${base64}`, "PNG", 0, 0, 1920, 1080);
  });

  pdf.save(`${sanitizeFilename(topic)}-slides.pdf`);
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}
