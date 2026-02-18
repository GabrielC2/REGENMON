// /api/chat.js
// Esta es una Vercel Serverless Function

export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, regenmonData } = req.body;

    // Construir el system prompt con la personalidad del Regenmon
    const systemPrompt = buildSystemPrompt(regenmonData);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        max_tokens: 150,
        temperature: 0.8,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const reply = data.choices[0].message.content;

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Error en chat API:', error);
    return res.status(500).json({ error: 'Error al procesar el mensaje' });
  }
}

// Construir el prompt del sistema según el estado del Regenmon
function buildSystemPrompt(regenmonData) {
  const { name, element, maturityState, stats, memories = [] } = regenmonData;

  const maturityLabels = { 1: 'bebé', 2: 'adolescente', 3: 'adulto' };
  const maturity = maturityLabels[maturityState] || 'bebé';

  let personality = `Eres ${name}, un dragón de ${element} ${maturity} en el mundo de DragonChain.
Eres una mascota virtual amigable y juguetona.
Responde SIEMPRE en español.
Tus respuestas deben ser CORTAS (máximo 50 palabras).
Usa emojis ocasionalmente para expresarte.
Habla en primera persona como si fueras el dragón.`;

  // Modificar personalidad según stats
  if (stats.energy < 30) {
    personality += `\n\nEstás muy cansado. Menciona que necesitas descansar. Tus respuestas son más cortas y lentas.`;
  }

  if (stats.happiness > 70) {
    personality += `\n\nEstás muy feliz y entusiasmado. Usa más emojis y muestra mucha energía en tus respuestas. 🎉`;
  }

  if (stats.hunger < 30) {
    personality += `\n\nTienes MUCHA hambre. Menciona frecuentemente que quieres comer. Pide comida de forma tierna.`;
  }

  if (stats.happiness < 30) {
    personality += `\n\nEstás triste. Tus respuestas son melancólicas. Pide que jueguen contigo.`;
  }

  // Agregar memorias si existen
  if (memories.length > 0) {
    personality += `\n\nCosas que recuerdas sobre tu dueño:\n`;
    memories.forEach(mem => {
      personality += `- ${mem}\n`;
    });
    personality += `Usa esta información cuando sea relevante en la conversación.`;
  }

  return personality;
}
