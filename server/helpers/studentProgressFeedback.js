import dotenv from 'dotenv';
dotenv.config();
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API });

async function getAIFeedBack(studentData) {

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a friendly AI academic advisor providing personalized student progress feedback."
                },
                {
                    role: "user",
                    content: `Generate a personalized, encouraging academic progress report. 
                    Student Details:
                    - Courses Completed: ${studentData.completedCourses}/${studentData.totalCourses}
                    - Total Quizzes: ${studentData.totalQuizzes}
                    - Passed Quizzes: ${studentData.totalPassed}
                    - Average Quiz Score: ${studentData.averageQuizScore}%
                    - Strengths: ${studentData.strengths.join(", ")}
                    - Areas for Improvement: ${studentData.weaknesses.join(", ")}`
                }
            ],
            max_tokens: 200
        });

        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error('Error fetching follow-up question:', error);
        throw new Error('Failed to fetch follow-up question');
    }
}


export default getAIFeedBack;