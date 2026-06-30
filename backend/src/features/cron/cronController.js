import { logger } from "../../utils/logger.js";
import { query } from "../../config/db.js";
import { sendEmail, buildEmailHtml } from "../../utils/email.js";

const sendDailyRecommendations = async (req, res) => {
  try {
    // 1. Verify Secret
    const secret = req.headers["x-cron-secret"];
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
      logger.warn("Unauthorized cron attempt");
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 2. Query students (random subset to differ student to student)
    // Picking 3 random users as per requirements
    const usersResult = await query(`
            SELECT id, email, full_name 
            FROM users 
            WHERE role = 'student'
            ORDER BY RANDOM() 
            LIMIT 3
        `);
    const users = usersResult.rows;

    let sentCount = 0;

    for (const user of users) {
      // 3. For each user, get personalized recommendations
      // We want courses they are NOT enrolled in
      const recsResult = await query(
        `
                SELECT c.id, c.title, c.slug, c.price, c.thumbnail_url
                FROM courses c
                WHERE c.is_published = true 
                  AND c.id NOT IN (
                      SELECT course_id FROM enrollments WHERE user_id = $1
                  )
                ORDER BY RANDOM()
                LIMIT 3
            `,
        [user.id],
      );

      const recommendedCourses = recsResult.rows;

      if (recommendedCourses.length === 0) continue;

      // 4. Build email HTML
      let coursesHtml = recommendedCourses
        .map(
          (course) => `
                <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h3 style="margin: 0 0 10px 0; color: #1e293b; font-size: 18px;">${course.title}</h3>
                    <p style="margin: 0 0 15px 0; color: #64748b; font-weight: bold;">${Number(course.price) > 0 ? "₹" + course.price : "Free Course"}</p>
                    <a href="${process.env.FRONTEND_URL || "https://skillnora.vercel.app"}/courses/${course.slug}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">View Course</a>
                </div>
            `,
        )
        .join("");

      const emailHtml = buildEmailHtml(
        `
                <h2 style="color: #0f172a; margin-top: 0; font-size: 22px;">Hello ${user.full_name || "Learner"},</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.6;">Based on your activity, we've handpicked some courses we think you'll love. Ready to learn something new today?</p>
                <div style="margin-top: 30px;">
                    ${coursesHtml}
                </div>
                <p style="color: #475569; font-size: 16px; margin-top: 30px;">Happy Learning!<br>The Skillnora Team</p>
            `,
        "Your Daily Recommendations",
        "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      );

      // 5. Send via Brevo
      await sendEmail({
        to: user.email,
        subject: "Personalized Course Recommendations from Skillnora 🌟",
        html: emailHtml,
      });

      sentCount++;
    }

    res.json({ success: true, emailsSent: sentCount });
  } catch (error) {
    logger.error("Error in sendDailyRecommendations:", error);
    res.status(500).json({ error: error.message });
  }
};

export const cronController = {
  sendDailyRecommendations,
};
