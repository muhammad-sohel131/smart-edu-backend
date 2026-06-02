import cloudinary from "../../config/cloudinary";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import axios from "axios";

interface UploadPayload {
  fileBase64: string;      // Base64 encoded file data
  fileMimetype?: string;   // MIME type from req.file.mimetype
  folder?: string;         // Optional folder name
  filename?: string;       // Optional original name
}

const uploadMedia = async (payload: UploadPayload) => {
  const { fileBase64, fileMimetype, folder = "asia-lms", filename } = payload;

  if (!fileBase64) {
    throw new AppError(httpStatus.BAD_REQUEST, "File data is required");
  }

  // Detect if it's a PDF
  const isPdf =
    fileMimetype === "application/pdf" ||
    fileBase64.includes("application/pdf") ||
    filename?.toLowerCase().endsWith(".pdf");

  // Detect if it's a video
  const isVideo =
    fileMimetype?.startsWith("video/") ||
    /\.(mp4|mov|avi|webm|mkv)$/i.test(filename || "");

  // Determine resource type
  let resourceType: "image" | "video" | "raw" | "auto" = "auto";
  if (isPdf) {
    resourceType = "raw";
  } else if (isVideo) {
    resourceType = "video";
  }

  let currentTimestamp: number | undefined;
  try {
    // Fetch actual time from Google to prevent "Stale request" errors when system clock is out of sync
    const timeRes = await axios.head("https://google.com", { timeout: 3000 });
    currentTimestamp = Math.floor(new Date(timeRes.headers.date).getTime() / 1000);
  } catch (err) {
    // Fallback to local system time + 1 hour (since the clock seems to be 1 hour behind)
    currentTimestamp = Math.floor(Date.now() / 1000) + 3600;
  }

  try {
    const result = await cloudinary.uploader.upload(fileBase64, {
      folder,
      resource_type: resourceType,
      type: "upload",
      use_filename: !!filename,
      filename_override: filename,
      pages: isPdf ? true : undefined, // Extract first page thumbnail for PDFs
      timestamp: currentTimestamp,
    });

    // Optional thumbnail for PDFs (first page as image)
    const thumbnailUrl = isPdf
      ? result.secure_url.replace(
          "/raw/upload/",
          "/image/upload/pg_1,w_600,f_jpg/"
        )
      : null;

    return {
      public_id: result.public_id,
      url: result.secure_url,
      thumbnailUrl,
      bytes: result.bytes,
      resource_type: result.resource_type,
      format: result.format,
    };
  } catch (err: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Cloudinary upload failed: ${err.message || err}`
    );
  }
};

export const UploadServices = { uploadMedia };