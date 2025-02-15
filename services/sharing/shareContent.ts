import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

type ShareOptions = {
  title: string;
  message: string;
  filename?: string;
};

export async function shareContent(content: string, options: ShareOptions) {
  try {
    if (!(await Sharing.isAvailableAsync())) {
      throw new Error('Sharing is not available on this platform');
    }

    const filename = options.filename || 'assignment.txt';
    const filePath = `${FileSystem.cacheDirectory}${filename}`;
    
    // Format content with title and message
    const formattedContent = `${options.title}\n\n${options.message}\n\n${content}`;

    // Write content to file
    await FileSystem.writeAsStringAsync(filePath, formattedContent);

    // Share the file
    await Sharing.shareAsync(filePath, {
      mimeType: 'text/plain',
      dialogTitle: options.title,
    });

    // Clean up
    await FileSystem.deleteAsync(filePath, { idempotent: true });
  } catch (error) {
    console.error('Error sharing content:', error);
    throw error;
  }
} 