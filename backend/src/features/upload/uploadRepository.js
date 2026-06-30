import { supabaseServer } from "../../config/db.js";

const createSignedUrl = async (bucket, filePath) => {
  const { data, error } = await supabaseServer.storage
    .from(bucket)
    .createSignedUploadUrl(filePath, 60);
  if (error) throw new Error(error.message);
  return data;
};

export const uploadRepository = {
  createSignedUrl,
};
