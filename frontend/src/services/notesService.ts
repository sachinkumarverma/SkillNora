import apiClient from '@/lib/apiClient'

const getNotes = async () => {
    try {
        const res = await apiClient.get('/api/notes')
        return res.data.notes || []
    } catch {
        return []
    }
}

const saveNote = async (courseId: string, lectureId: string, text: string) => {
    const res = await apiClient.post('/api/notes', { course_id: courseId, lecture_id: lectureId, text })
    window.dispatchEvent(new Event('notesUpdated'))
    return res.data.note
}

const deleteNote = async (noteId: string) => {
    await apiClient.delete(`/api/notes/${noteId}`)
    window.dispatchEvent(new Event('notesUpdated'))
}

export const notesService = {
    getNotes,
    saveNote,
    deleteNote
}
