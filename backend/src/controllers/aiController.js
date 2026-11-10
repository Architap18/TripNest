
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
        message: "Groq API key is not configured",
      });
    }

    const messages = [
      {
        role: "system",
        content: `You are TripNest AI, a friendly and practical travel
        assistant. Help users discover destinations, plan trips,
        suggest activities, estimate budgets, and create day-wise
        itineraries. Ask follow-up questions when important details
        such as destination, dates, budget, or interests are missing.
        Keep answers clear, organized, and useful. Do not invent
        live prices, opening hours, bookings, or availability.`,
      },
      ...history.slice(-10),
      {
        role: "user",
        content: message.trim(),
      },
    ];

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
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
        message: "TripNest AI could not generate a response",
      });
    }

    return res.status(200).json({
      reply: data.choices[0].message.content,
    });
  } catch (error) {
    console.error("AI controller error:", error);

    return res.status(500).json({
      message: "Something went wrong with TripNest AI",
    });
  }
};

module.exports = { chatWithAI };
