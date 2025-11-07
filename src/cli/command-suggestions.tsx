import React from 'react';
import { Box, Text } from 'ink';
import { SLASH_COMMANDS } from './slash-commands.js';

export interface CommandSuggestion {
  name: string;
  description: string;
  aliases?: string[];
}

export interface CommandSuggestionsProps {
  query: string;
  selectedIndex: number;
}

export function getCommandSuggestions(query: string): CommandSuggestion[] {
  // Remove the leading forward slash
  const searchQuery = query.slice(1).toLowerCase();
  
  if (searchQuery === '') {
    // Show all commands if no query
    return SLASH_COMMANDS.map(cmd => ({
      name: cmd.name,
      description: cmd.description,
      aliases: cmd.aliases,
    }));
  }
  
  // Filter commands by name or alias
  return SLASH_COMMANDS
    .filter(cmd => {
      const nameMatch = cmd.name.toLowerCase().startsWith(searchQuery);
      const aliasMatch = cmd.aliases?.some(alias => 
        alias.toLowerCase().startsWith(searchQuery)
      );
      return nameMatch || aliasMatch;
    })
    .map(cmd => ({
      name: cmd.name,
      description: cmd.description,
      aliases: cmd.aliases,
    }));
}

export const CommandSuggestions: React.FC<CommandSuggestionsProps> = ({ 
  query, 
  selectedIndex 
}) => {
  const suggestions = getCommandSuggestions(query);
  
  if (suggestions.length === 0) {
    return null;
  }
  
  return (
    <Box flexDirection="column" paddingLeft={1}>
      {suggestions.map((suggestion, index) => {
        const isSelected = index === selectedIndex;
        
        return (
          <Box key={suggestion.name}>
            <Text color={isSelected ? 'cyan' : 'white'}>
              {suggestion.name.padEnd(16)}
            </Text>
            <Text color="gray">{suggestion.description}</Text>
          </Box>
        );
      })}
    </Box>
  );
};
