import { ScrollView, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useTheme } from 'react-native-paper';

type MarkdownPreviewProps = {
  content: string;
};

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const theme = useTheme();

  const markdownStyles = {
    body: {
      color: theme.colors.onBackground,
      fontSize: 16,
      lineHeight: 24,
    },
    heading1: {
      color: theme.colors.primary,
      fontSize: 24,
      fontWeight: 'bold',
      marginVertical: 12,
    },
    heading2: {
      color: theme.colors.primary,
      fontSize: 20,
      fontWeight: 'bold',
      marginVertical: 10,
    },
    heading3: {
      color: theme.colors.primary,
      fontSize: 18,
      fontWeight: 'bold',
      marginVertical: 8,
    },
    strong: {
      fontWeight: 'bold',
    },
    em: {
      fontStyle: 'italic',
    },
    link: {
      color: theme.colors.primary,
    },
    blockquote: {
      backgroundColor: theme.colors.surfaceVariant,
      borderLeftColor: theme.colors.primary,
      borderLeftWidth: 4,
      padding: 8,
      marginVertical: 8,
    },
    code_inline: {
      fontFamily: 'monospace',
      backgroundColor: theme.colors.surfaceVariant,
      padding: 4,
      borderRadius: 4,
    },
    code_block: {
      fontFamily: 'monospace',
      backgroundColor: theme.colors.surfaceVariant,
      padding: 16,
      borderRadius: 8,
      marginVertical: 8,
    },
    fence: {
      fontFamily: 'monospace',
      backgroundColor: theme.colors.surfaceVariant,
      padding: 16,
      borderRadius: 8,
      marginVertical: 8,
    },
    list_item: {
      marginVertical: 4,
    },
    bullet_list: {
      marginVertical: 8,
    },
    ordered_list: {
      marginVertical: 8,
    },
  };

  return (
    <ScrollView style={styles.container}>
      <Markdown style={markdownStyles}>
        {content}
      </Markdown>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
}); 