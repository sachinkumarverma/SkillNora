import { uploadService } from './uploadService.js';

const getUrl = async (req, res) => {
  try {
    const {
      bucket = 'course-thumbnails',
      filePath
    } = req.body;
    if (!filePath) return res.status(400).json({
      error: 'filePath required'
    });
    const data = await uploadService.getUploadUrl(bucket, filePath);
    // Get public URL using backend supabase server instance
    const { data: publicUrlData } = await import('../../config/db.js').then(m => m.supabaseServer.storage.from(bucket).getPublicUrl(filePath));
    res.json({
      uploadUrl: data.signedUrl || data.signedUploadUrl,
      publicUrl: publicUrlData?.publicUrl || '',
      token: data.token
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};

export const uploadController = {
  getUrl
};