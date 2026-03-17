import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/api";

const BUCKET = "videos";

/**
 * Upload a completed video to Supabase Storage.
 * Downloads from the external API, then uploads as {jobId}.mp4.
 * Returns the public URL on success, null on failure.
 */
export async function persistVideoToStorage(jobId: string): Promise<string | null> {
  try {
    // Check if already stored
    const { data: existing } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(`${jobId}.mp4`, 10);
    if (existing?.signedUrl) {
      // Already exists
      return getVideoPublicUrl(jobId);
    }
  } catch {
    // doesn't exist yet, continue
  }

  try {
    const blob = await api.previewVideoBlob(jobId);
    // previewVideoBlob returns an object URL, we need the actual blob
    const response = await fetch(blob);
    const videoBlob = await response.blob();
    URL.revokeObjectURL(blob);

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(`${jobId}.mp4`, videoBlob, {
        contentType: "video/mp4",
        upsert: true,
      });

    if (error) {
      console.error("[videoStorage] upload error:", error);
      return null;
    }

    return getVideoPublicUrl(jobId);
  } catch (e) {
    console.error("[videoStorage] persist error:", e);
    return null;
  }
}

/**
 * Get the public URL for a stored video.
 */
export function getVideoPublicUrl(jobId: string): string {
  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(`${jobId}.mp4`);
  return data.publicUrl;
}

/**
 * Try to get video from storage first, fallback to API.
 * Returns an object URL (blob) or a public storage URL.
 */
export async function getVideoUrl(jobId: string): Promise<string | null> {
  // Try storage first (just check with a HEAD-like request)
  try {
    const publicUrl = getVideoPublicUrl(jobId);
    const res = await fetch(publicUrl, { method: "HEAD" });
    if (res.ok) return publicUrl;
  } catch {
    // not in storage
  }

  // Fallback to API
  try {
    const blobUrl = await api.previewVideoBlob(jobId);
    return blobUrl;
  } catch {
    return null;
  }
}
