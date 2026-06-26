import { query } from './config/db.js';

async function test() {
    try {
        await query(`INSERT INTO notes (user_id, course_id, lecture_id, text) VALUES ('559359a3-ef80-49a4-9419-a4492e8f1292', '123', '1b774f07-d39b-4377-b027-71e7cba53807', 'test');`);
        console.log("Insert 1 OK");
        await query(`INSERT INTO notes (user_id, course_id, lecture_id, text) VALUES ('559359a3-ef80-49a4-9419-a4492e8f1292', '123', '1b774f07-d39b-4377-b027-71e7cba53807', 'test2');`);
        console.log("Insert 2 OK");
    } catch(e) {
        console.error(e.message);
    }
    process.exit(0);
}
test();
