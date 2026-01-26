import { createClient } from "./client";

export async function uploadSlideImage(
  userId: string,
  presentationId: string,
  slideId: string,
  base64Data: string
): Promise<string> {
  const supabase = createClient();

  // Convert base64 to blob
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "image/png" });

  // Upload with path: userId/presentationId/slideId.png
  const filePath = `${userId}/${presentationId}/${slideId}.png`;

  const { data, error } = await supabase.storage
    .from("slide-images")
    .upload(filePath, blob, {
      contentType: "image/png",
      cacheControl: "31536000", // 1 year cache
      upsert: true,
    });

  if (error) throw error;

  // Get signed URL (works with private buckets)
  // 1 year expiry (max allowed)
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from("slide-images")
    .createSignedUrl(data.path, 60 * 60 * 24 * 365);

  if (signedUrlError || !signedUrlData) {
    throw signedUrlError || new Error("Failed to create signed URL");
  }

  return signedUrlData.signedUrl;
}

export async function deleteSlideImage(
  userId: string,
  presentationId: string,
  slideId: string
): Promise<void> {
  const supabase = createClient();
  const filePath = `${userId}/${presentationId}/${slideId}.png`;

  const { error } = await supabase.storage
    .from("slide-images")
    .remove([filePath]);

  if (error) throw error;
}

export async function deletePresentationImages(
  userId: string,
  presentationId: string
): Promise<void> {
  const supabase = createClient();

  // List all files in the presentation folder
  const { data: files, error: listError } = await supabase.storage
    .from("slide-images")
    .list(`${userId}/${presentationId}`);

  if (listError) throw listError;

  if (files && files.length > 0) {
    const filePaths = files.map(
      (f) => `${userId}/${presentationId}/${f.name}`
    );
    const { error: deleteError } = await supabase.storage
      .from("slide-images")
      .remove(filePaths);

    if (deleteError) throw deleteError;
  }
}
