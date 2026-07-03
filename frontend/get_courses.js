const http = require('http');
http.get('http://localhost:4000/api/courses', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            const courses = json.courses || json.data || json;
            console.log('| Title | Category | Skill | Certificate Type | Role | Price |');
            console.log('|---|---|---|---|---|---|');
            courses.forEach(c => {
                console.log(`| ${c.title} | ${c.category} | ${c.primary_skill} | ${c.certificate_type} | ${c.target_role} | ${c.price} |`);
            });
        } catch(e) { console.error(e) }
    });
});
