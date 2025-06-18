// Function to generate an example middle part for the vanity address display
export const getExampleMiddle = (prefix: string, suffix: string) => {
  const baseExample = "7RoboMcRobotFace1234567890abcdefghijkLMNOP";
  
  // Calculate how much space the placeholders take
  const prefixPlaceholder = prefix.length > 0 ? 0 : 8; // "[prefix]" is 8 chars
  const suffixPlaceholder = suffix.length > 0 ? 0 : 8; // "[suffix]" is 8 chars
  
  // Calculate remaining length for the middle part
  const actualLength = prefix.length + suffix.length;
  const placeholderLength = prefixPlaceholder + suffixPlaceholder;
  
  // Ensure the total visible length is 44 characters
  const remainingLength = Math.max(0, 44 - actualLength - placeholderLength);
  return baseExample.substring(0, remainingLength);
};

// Calculate difficulty based on prefix and suffix
export const calculateDifficulty = (prefix: string, suffix: string): string => {
  if (prefix.length > 0 || suffix.length > 0) {
    // Calculate difficulty based on Base58 character set
    const totalPatternLength = prefix.length + suffix.length;
    const baseDifficulty = Math.pow(58, totalPatternLength);
    return baseDifficulty.toExponential(4);
  }
  return '0';
}; 