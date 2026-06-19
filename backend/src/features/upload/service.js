import { supabase } from '../../lib/supabase.js'

const getSignedUrl = async (bucket, filePath) => {
    const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(filePath, 60)
    if (error) throw new Error(error.message)
    return { uploadUrl: data.signedUploadUrl, publicPath: data.filePath }
}

export { getSignedUrl };
