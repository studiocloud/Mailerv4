import { parse } from './randomSyntaxParser';

export const replaceVariables = (text: string, variables: Record<string, string>) => {
  // First replace standard variables
  let result = text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    return variables[key] || match;
  });

  // Then handle random syntax - process each block independently
  result = result.replace(/\{\{\s*RANDOM\s*\|(.*?)\}\}/g, (match, options) => {
    const choices = options.split('|').map(s => s.trim());
    return choices[Math.floor(Math.random() * choices.length)];
  });

  return result;
};

export const previewRandomSyntax = (text: string) => {
  return text.replace(/\{\{\s*RANDOM\s*\|(.*?)\}\}/g, (match, options) => {
    const choices = options.split('|').map(s => s.trim());
    return `<span class="bg-blue-50 text-blue-600 px-1 rounded cursor-help" title="Options: ${choices.join(' | ')}">${choices[0]} <span class="text-xs">(${choices.length} options)</span></span>`;
  });
};

export const validateRandomSyntax = (text: string): { isValid: boolean; error?: string } => {
  try {
    const randomBlocks = text.match(/\{\{\s*RANDOM\s*\|(.*?)\}\}/g) || [];
    for (const block of randomBlocks) {
      const options = block.match(/\{\{\s*RANDOM\s*\|(.*?)\}\}/)?.[1];
      if (!options || options.split('|').length < 2) {
        return {
          isValid: false,
          error: 'Random blocks must have at least two options'
        };
      }
    }
    return { isValid: true };
  } catch (err) {
    return {
      isValid: false,
      error: 'Invalid random syntax'
    };
  }
};

// Helper function to generate multiple variations of the template
export const generateVariations = (template: string, variables: Record<string, string>, count: number = 5): string[] => {
  const variations: string[] = [];
  
  for (let i = 0; i < count; i++) {
    variations.push(replaceVariables(template, variables));
  }
  
  return variations;
};