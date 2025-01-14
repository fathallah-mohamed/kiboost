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
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Tu es un chef cuisinier expert qui génère UNIQUEMENT des tableaux JSON de recettes selon le format demandé. Réponds UNIQUEMENT avec un tableau JSON valide, sans texte additionnel ni formatage markdown. Assure-toi que chaque recette a tous les champs requis et que le JSON est valide.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data: OpenAIResponse = await response.json();
    console.log('Raw OpenAI response:', data);
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid OpenAI response structure');
    }

    let content = data.choices[0].message.content.trim();
    console.log('Processing content:', content);

    // Remove any markdown code block syntax if present
    content = content.replace(/```json\n?/, '').replace(/```\n?$/, '');
    console.log('Content after markdown removal:', content);

    try {
      // Validate JSON structure
      const parsed = JSON.parse(content);
      console.log('Successfully parsed JSON:', parsed);
      
      if (!Array.isArray(parsed)) {
        console.error('Response is not an array:', parsed);
        throw new Error('Response must be an array of recipes');
      }

      if (parsed.length !== 3) {
        console.error('Wrong number of recipes:', parsed.length);
        throw new Error('Must generate exactly 3 recipes');
      }
      
      // Validate each recipe
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
          console.error(`Recipe ${index + 1} missing fields:`, missingFields);
          throw new Error(`Recipe ${index + 1} missing required fields: ${missingFields.join(', ')}`);
        }

        // Validate ingredients structure
        if (!Array.isArray(recipe.ingredients)) {
          console.error(`Recipe ${index + 1} invalid ingredients:`, recipe.ingredients);
          throw new Error(`Recipe ${index + 1} must have an array of ingredients`);
        }

        recipe.ingredients.forEach((ingredient: any, i: number) => {
          if (!ingredient.item || !ingredient.quantity || !ingredient.unit) {
            console.error(`Recipe ${index + 1} ingredient ${i + 1} invalid:`, ingredient);
            throw new Error(`Recipe ${index + 1}, ingredient ${i + 1} must have item, quantity, and unit`);
          }
        });

        // Validate nutritional_info structure
        const requiredNutritionalFields = ['calories', 'protein', 'carbs', 'fat'];
        const missingNutritionalFields = requiredNutritionalFields.filter(
          field => typeof recipe.nutritional_info[field] !== 'number'
        );
        if (missingNutritionalFields.length > 0) {
          console.error(`Recipe ${index + 1} invalid nutritional info:`, recipe.nutritional_info);
          throw new Error(`Recipe ${index + 1} has invalid nutritional information`);
        }

        // Validate instructions array
        if (!Array.isArray(recipe.instructions)) {
          console.error(`Recipe ${index + 1} invalid instructions:`, recipe.instructions);
          throw new Error(`Recipe ${index + 1} must have an array of instructions`);
        }

        // Validate health_benefits array
        if (!Array.isArray(recipe.health_benefits)) {
          console.error(`Recipe ${index + 1} invalid health_benefits:`, recipe.health_benefits);
          throw new Error(`Recipe ${index + 1} must have an array of health benefits`);
        }

        recipe.health_benefits.forEach((benefit: any, i: number) => {
          if (!benefit.category || !benefit.description || !benefit.icon) {
            console.error(`Recipe ${index + 1} health benefit ${i + 1} invalid:`, benefit);
            throw new Error(`Recipe ${index + 1}, health benefit ${i + 1} must have category, description, and icon`);
          }
        });
      });
      
      return content;
    } catch (parseError) {
      console.error('Error parsing or validating JSON:', parseError);
      console.error('Content that failed to parse:', content);
      throw new Error(`Failed to parse or validate JSON: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Error in generateRecipesWithOpenAI:', error);
    throw error;
  }
}