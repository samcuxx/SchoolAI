import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Dialog, Portal, Text, Button, SegmentedButtons, TextInput } from 'react-native-paper';

export type PDFFormat = {
  font: 'Times New Roman' | 'Arial' | 'Calibri';
  fontSize: number;
  lineHeight: number;
};

type PDFFormatDialogProps = {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: (format: PDFFormat) => void;
};

const defaultFormat: PDFFormat = {
  font: 'Times New Roman',
  fontSize: 12,
  lineHeight: 1.5,
};

export function PDFFormatDialog({ visible, onDismiss, onConfirm }: PDFFormatDialogProps) {
  const [format, setFormat] = useState<PDFFormat>(defaultFormat);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Document Format</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={styles.label}>Font Family</Text>
          <SegmentedButtons
            value={format.font}
            onValueChange={(value) => setFormat({ ...format, font: value as PDFFormat['font'] })}
            buttons={[
              { value: 'Times New Roman', label: 'Times' },
              { value: 'Arial', label: 'Arial' },
              { value: 'Calibri', label: 'Calibri' },
            ]}
            style={styles.segmentedButtons}
          />

          <Text variant="bodyMedium" style={styles.label}>Font Size (pt)</Text>
          <SegmentedButtons
            value={format.fontSize.toString()}
            onValueChange={(value) => setFormat({ ...format, fontSize: parseInt(value) })}
            buttons={[
              { value: '11', label: '11pt' },
              { value: '12', label: '12pt' },
              { value: '14', label: '14pt' },
            ]}
            style={styles.segmentedButtons}
          />

          <Text variant="bodyMedium" style={styles.label}>Line Height</Text>
          <SegmentedButtons
            value={format.lineHeight.toString()}
            onValueChange={(value) => setFormat({ ...format, lineHeight: parseFloat(value) })}
            buttons={[
              { value: '1.5', label: '1.5' },
              { value: '2.0', label: '2.0' },
              { value: '2.5', label: '2.5' },
            ]}
            style={styles.segmentedButtons}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button onPress={() => onConfirm(format)}>Export PDF</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  label: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  segmentedButtons: {
    marginBottom: 8,
  },
}); 