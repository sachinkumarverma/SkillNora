import { uploadRepository } from "./uploadRepository.js";

const getUploadUrl = async (bucket, filePath) => {
  return await uploadRepository.createSignedUrl(bucket, filePath);
};

export const uploadService = {
  getUploadUrl,
};
