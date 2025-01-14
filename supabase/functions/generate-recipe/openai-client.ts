import { OpenAIResponse } from './types.ts';

export async function generateRecipesWithOpenAI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Tu es un chef cuisinier français créatif, passionné et reconnu pour tes compétences en pédiatrie nutritionnelle et en alimentation multi-âges. Tu es particulièrement attentif aux allergies alimentaires et aux besoins nutritionnels spécifiques des enfants. Réponds UNIQUEMENT avec le JSON demandé, sans aucun texte supplémentaire.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.9,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('OpenAI API error:', error);
    throw new Error(`Erreur API OpenAI : ${error.error?.message || response.statusText}`);
  }

  const data: OpenAIResponse = await response.json();
  console.log('OpenAI response received:', data);
  
  if (!data.choices?.[0]?.message?.content) {
    throw new Error('Structure de réponse OpenAI invalide');
  }

  let content = data.choices[0].message.content.trim();
  if (content.startsWith('```')) {
    content = content.replace(/```json\n?/, '').replace(/```\n?$/, '');
  }

  return content;
}