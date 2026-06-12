const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

export async function uploadFileToSignedUrl(uploadUrl: string, file: File | Blob) {
    const res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': (file as any).type || 'application/octet-stream'
        },
        body: file
    })
    if (!res.ok) throw new Error('Upload failed')
    return res
}

export async function getSignedUploadUrl(bucket: string, filePath: string) {
    const url = API_BASE ? `${API_BASE}/api/upload-url` : '/api/upload-url'
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bucket, filePath }) })
    const json = await res.json()
    if (json.error) throw new Error(json.error)
    return json
}

export default { uploadFileToSignedUrl, getSignedUploadUrl }
