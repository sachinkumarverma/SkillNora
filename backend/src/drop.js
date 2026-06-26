import { query } from './config/db.js';

async function drop() {
    try {
        await query('ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_user_id_lecture_id_key');
        console.log('Constraint dropped');
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
}
drop();
