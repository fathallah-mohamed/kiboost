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
            content: `Tu es un chef cuisinier français créatif qui génère des recettes adaptées aux enfants.
            IMPORTANT: Réponds UNIQUEMENT avec un tableau JSON de 3 recettes, sans AUCUN texte supplémentaire.
            Format attendu: [{"name": "Nom de la recette", "ingredients": [{"item": "ingrédient", "quantity": "quantité", "unit": "unité"}], "instructions": ["étape 1", "étape 2"], "nutritional_info": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0}, "meal_type": "breakfast|lunch|dinner|snack", "preparation_time": 30, "difficulty": "easy|medium|hard", "servings": 4}]`
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
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
    content = content.replace(/```json\n?/, '').replace(/```\n?$/, '');
    console.log('Content after markdown removal:', content);

    try {
      // First, validate that the content is valid JSON
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
          'servings'
        ];
        
        const missingFields = requiredFields.filter(field => !recipe[field]);
        if (missingFields.length > 0) {
          throw new Error(`La recette ${index + 1} manque les champs requis: ${missingFields.join(', ')}`);
        }

        // Validate ingredients structure
        if (!Array.isArray(recipe.ingredients)) {
          throw new Error(`La recette ${index + 1} doit avoir un tableau d'ingrédients`);
        }

        recipe.ingredients.forEach((ingredient: any, i: number) => {
          if (!ingredient.item || !ingredient.quantity || !ingredient.unit) {
            throw new Error(`Ingrédient ${i + 1} de la recette ${index + 1} invalide`);
          }
        });
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