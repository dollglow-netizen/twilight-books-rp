const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    if (url.pathname === "/api/ai" && request.method === "POST") {
      try {
        const body = await request.json();

        if (!Array.isArray(body.messages)) {
          return json({
            success: false,
            error: "messages must be an array"
          }, 400);
        }

        const result = await env.AI.run(
          "@cf/google/gemma-4-26b-a4b-it",
          {
            messages: body.messages,
            chat_template_kwargs: {
              enable_thinking: false
            }
          }
        );

        return json({
          success: true,
          result
        });

      } catch (error) {
        console.error("AI ERROR:", error);

        return json({
          success: false,
          error: error?.message || String(error)
        }, 500);
      }
    }

    return json({
      success: true,
      worker: "Twilight Books RP",
      status: "online"
    });
  }
};
