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
            content: 'You are a recipe generator. Generate exactly 3 recipes in a valid JSON array format. Each recipe must include: name (string), ingredients (array of {item, quantity, unit}), instructions (array of strings), nutritional_info (object with calories, protein, carbs, fat as numbers), meal_type (string), preparation_time (number), difficulty (string), servings (number), health_benefits (array of {category, description, icon}).'
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
        if (!Array.isArray(recipe.instructions) || recipe.instructions.length === 0) {
          console.error(`Recipe ${index + 1} invalid instructions:`, recipe.instructions);
          throw new Error(`Recipe ${index + 1} must have valid instructions`);
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
    } catch (error) {
      console.error('Error parsing or validating OpenAI response:', error);
      console.error('Raw content that failed to parse:', content);
      throw new Error(`Validation error: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in generateRecipesWithOpenAI:', error);
    throw error;
  }
}