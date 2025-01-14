interface RecipeInstructionsProps {
  instructions: string[];
}

export const RecipeInstructions = ({ instructions }: RecipeInstructionsProps) => {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold">Instructions magiques</h4>
      <ol className="space-y-2">
        {instructions.map((step, index) => (
          <li key={index} className="flex gap-2 text-sm">
            <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs shrink-0">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
};