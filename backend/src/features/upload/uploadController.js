import { logger } from '../../utils/logger.js';
import { uploadService } from './uploadService.js';
import { supabaseServer } from '../../config/db.js';

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
    const { data: publicUrlData } = supabaseServer.storage.from(bucket).getPublicUrl(filePath);
    res.json({
      uploadUrl: data.signedUrl || data.signedUploadUrl,
      publicUrl: publicUrlData?.publicUrl || '',
      token: data.token
    });
  } catch (err) { logger.error('Error in uploadController.js:', err); 
    res.status(500).json({
      error: err.message
    });
  }
};

export const uploadController = {
  getUrl
};