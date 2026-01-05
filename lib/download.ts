import JSZip from "jszip";
import { Slide } from "./types";

export function downloadSlide(slide: Slide, topic: string): void {
  if (!slide.imageBase64) return;

  const link = document.createElement("a");
  link.href = `data:image/png;base64,${slide.imageBase64}`;
  link.download = `${sanitizeFilename(topic)}-slide-${slide.slideNumber}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function downloadAllSlides(slides: Slide[], topic: string): Promise<void> {
  const slidesWithImages = slides.filter((s) => s.imageBase64);

  if (slidesWithImages.length === 0) return;

  const zip = new JSZip();
  const folder = zip.folder(sanitizeFilename(topic));

  if (!folder) return;

  slidesWithImages.forEach((slide) => {
    if (slide.imageBase64) {
      folder.file(
        `slide-${slide.slideNumber}.png`,
        slide.imageBase64,
        { base64: true }
      );
    }
  });

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
  const slidesWithImages = slides.filter((s) => s.imageBase64);

  if (slidesWithImages.length === 0) return;

  const jsPDF = (await import("jspdf")).default;
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [1920, 1080],
  });

  slidesWithImages.forEach((slide, index) => {
    if (index > 0) pdf.addPage();
    pdf.addImage(
      `data:image/png;base64,${slide.imageBase64}`,
      "PNG",
      0,
      0,
      1920,
      1080
    );
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
