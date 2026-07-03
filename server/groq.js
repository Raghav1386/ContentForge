import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export const generateContent = async (prompt) => {
    try {
        const response =
            await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",

                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],

                response_format: {
                    type: "json_object",
                },

                temperature: 0.7,
                max_tokens: 8192,
            });

        return response.choices[0].message.content;

    } catch (error) {
        console.error("Groq Error:", error);
        throw new Error("Groq generation failed");
    }
};