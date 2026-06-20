import axios from 'axios';
async function run() {
  try {
     const res = await axios.post('http://localhost:4000/api/enroll', { course_id: '62c0805a-d234-4476-8b6c-d776400ac4b9' }); // Without token
     console.log(res.data);
  } catch(e) {
     console.log(e.response?.status, e.response?.data);
  }
}
run();
