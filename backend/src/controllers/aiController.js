const chatWithAI = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        message: "Please enter a message",
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        message: "Groq API key is not configured on the server",
      });
    }

    const messages = [
      {
        role: "system",
        content: `You are TripNest AI, a friendly, knowledgeable, and practical travel assistant.
Help users discover destinations, plan trips, suggest activities, estimate budgets, and create day-wise itineraries.
Ask follow-up questions when important details such as destination, dates, budget, or interests are missing.
Keep answers clear, well-structured, organized, and useful.
Do not invent live flight prices, live opening hours, or confirmed booking availabilities.`,
      },
      ...history.slice(-10),
      {
        role: "user",
        content: message.trim(),
      },
    ];

    const model = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_completion_tokens: 1024,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", data);

      return res.status(response.status).json({
        message:
          data.error?.message ||
          data.message ||
          "TripNest AI could not generate a response",
      });
    }

    const reply =
      data.choices?.[0]?.message?.content ||
      data.choices?.[0]?.message?.reasoning ||
      "";

    if (!reply) {
      return res.status(500).json({
        message: "TripNest AI returned an empty response. Please try again.",
      });
    }

    return res.status(200).json({
      reply,
    });
  } catch (error) {
    console.error("AI controller error:", error);

    return res.status(500).json({
      message: error.message || "Something went wrong with TripNest AI",
    });
  }
};

module.exports = { chatWithAI };
