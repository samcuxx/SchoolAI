export const formatAIResponse = (text: string): string => {
  let formattedText = text
    // Remove all markdown formatting
    .replace(/\*\*?[^*]+\*\*?/g, (match) => match.replace(/\*/g, ""))
    .replace(/__?[^_]+__?/g, (match) => match.replace(/_/g, ""))
    .replace(/`[^`]+`/g, (match) => match.replace(/`/g, ""))
    .replace(/#+\s+/g, "")
    // Convert all list items to numbered format
    .replace(/^[-*]\s+/gm, "1. ")
    .replace(/^\s+[-*]\s+/gm, "   1. ")
    // Ensure proper spacing
    .replace(/\.(?=\S)/g, ". ")
    .replace(/\s+/g, " ")
    // Process the text line by line
    .split("\n")
    .map((line) => {
      // Trim each line
      line = line.trim();
      // Skip empty lines
      if (!line) return "";
      // Ensure proper list item formatting
      if (line.match(/^\d+\./)) {
        return line;
      }
      return line;
    })
    .filter((line) => line !== "")
    // Add proper spacing between sections
    .join("\n\n")
    .trim()
    // Clean up any remaining multiple newlines
    .replace(/\n{3,}/g, "\n\n");

  return formattedText;
};
