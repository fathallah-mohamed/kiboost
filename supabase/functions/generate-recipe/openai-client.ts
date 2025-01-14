import { OpenAIResponse } from './types.ts';

export async function generateRecipesWithOpenAI(prompt: string, apiKey: string): Promise<string> {
  console.log('Sending request to OpenAI with prompt:', prompt);
  
  try {
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
            content: 'Tu es un chef cuisinier français créatif, passionné et reconnu pour tes compétences en pédiatrie nutritionnelle et en alimentation multi-âges. Tu es particulièrement attentif aux allergies alimentaires et aux besoins nutritionnels spécifiques des enfants. Réponds UNIQUEMENT avec un tableau JSON de recettes, sans aucun texte supplémentaire. Chaque recette doit avoir tous les champs requis. Format attendu: [{"name": "...", "ingredients": [...], "instructions": [...], ...}]'
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
    console.log('Raw OpenAI response:', data);
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Structure de réponse OpenAI invalide');
    }

    let content = data.choices[0].message.content.trim();
    console.log('Trimmed content:', content);
    
    // Remove any markdown code block syntax if present
    if (content.startsWith('```')) {
      content = content.replace(/```json\n?/, '').replace(/```\n?$/, '');
      console.log('Content after markdown removal:', content);
    }

    // Validate JSON structure
    try {
      const parsed = JSON.parse(content);
      console.log('Successfully parsed JSON:', parsed);
      
      if (!Array.isArray(parsed)) {
        throw new Error('La réponse doit être un tableau de recettes');
      }
      
      // Validate each recipe has the required fields
      parsed.forEach((recipe, index) => {
        const requiredFields = [
          'name',
          'ingredients',
          'instructions',
          'nutritional_info',
          'meal_type',
          'preparation_time',
          'difficulty',
          'servings',
          'health_benefits'
        ];
        
        const missingFields = requiredFields.filter(field => !recipe[field]);
        if (missingFields.length > 0) {
          throw new Error(`La recette ${index + 1} manque les champs requis: ${missingFields.join(', ')}`);
        }
      });
      
      return content;
    } catch (error) {
      console.error('Error parsing or validating OpenAI response:', error);
      throw new Error(`Erreur de validation: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in generateRecipesWithOpenAI:', error);
    throw error;
  }
}