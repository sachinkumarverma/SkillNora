import { enrollmentsService } from './backend/src/features/enrollments/enrollmentsService.js';
import { supabaseServer } from './backend/src/config/db.js';

async function test() {
  try {
     // I need a valid user and course id
     // Let's just try to call enroll with fake UUIDs to see if it syntax errors
     await enrollmentsService.forceEnroll('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000');
     console.log("Success");
  } catch (err) {
     console.error(err);
  }
  process.exit(0);
}
test();
