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
            content: 'You are a chef expert that ONLY generates valid JSON arrays of recipes. You must ALWAYS return a valid JSON array containing exactly 3 recipes, following the exact format provided in the user prompt. Each recipe must include all required fields with proper types. Never include any text outside the JSON array.'
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

    // Validate JSON structure
    try {
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