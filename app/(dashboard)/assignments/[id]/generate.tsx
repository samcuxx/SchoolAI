import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, TextInput, SegmentedButtons, Portal, Dialog, Switch } from 'react-native-paper';
import { useAuth } from '../../../../contexts/AuthContext';
import { supabase } from '../../../../services/auth/supabase';
import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useAIResponses } from '../../../../hooks/useAIResponses';

type Assignment = {
  id: string;
  title: string;
  subject: string;
  instructions: string;
};

type GenerationType = 'answer' | 'outline' | 'research';

export default function GenerateContent() {
  const { id } = useLocalSearchParams();
  const { session } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generationType, setGenerationType] = useState<GenerationType>('answer');
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const { generateResponse, generateWithGemini, generateWithOpenAI } = useAIResponses(id as string);
  const [forceGemini, setForceGemini] = useState(false);

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  async function fetchAssignment() {
    try {
      if (!session?.user || !id) return;

      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setAssignment(data);
    } catch (error) {
      console.error('Error fetching assignment:', error);
      alert('Error loading assignment');
      router.back();
    } finally {
      setLoading(false);
    }
  }

  const generatePrompt = () => {
    if (!assignment) return '';

    let basePrompt = '';
    switch (generationType) {
      case 'answer':
        basePrompt = `Please provide detailed answers to the following assignment questions:\n\n${assignment.instructions}\n\nRequirements:\n- Provide comprehensive answers\n- Include relevant examples\n- Cite sources where applicable`;
        break;
      case 'outline':
        basePrompt = `Please create a detailed outline for answering the following assignment:\n\n${assignment.instructions}\n\nRequirements:\n- Create a structured outline\n- Include main points and sub-points\n- Suggest relevant sources or references`;
        break;
      case 'research':
        basePrompt = `Please provide research materials and sources for the following assignment:\n\n${assignment.instructions}\n\nRequirements:\n- List relevant academic sources\n- Include key concepts to research\n- Suggest research methodologies`;
        break;
    }

    if (additionalPrompt) {
      basePrompt += `\n\nAdditional requirements:\n${additionalPrompt}`;
    }

    return basePrompt;
  };

  const handleGenerate = async () => {
    try {
      const prompt = generatePrompt();
      setGeneratedPrompt(prompt);
      setShowPreviewDialog(true);
    } catch (error) {
      console.error('Error generating prompt:', error);
      alert('Error generating prompt');
    }
  };

  const handleConfirmGenerate = async () => {
    setShowPreviewDialog(false);
    setGenerating(true);
    try {
      if (forceGemini) {
        // Use Gemini directly
        await generateWithGemini(generatedPrompt);
      } else {
        // Try OpenAI with Gemini fallback
        await generateResponse(generatedPrompt);
      }
      router.push(`/assignments/${id}`);
    } catch (error: any) {
      console.error('Error generating content:', error);
      alert(error.message || 'Error generating content');
    } finally {
      setGenerating(false);
    }
  };

  if (loading || !assignment) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Generate Content
          </Text>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Assignment
          </Text>
          <Text variant="bodyMedium" style={styles.assignmentText}>
            {assignment.instructions}
          </Text>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Generation Type
          </Text>
          <SegmentedButtons
            value={generationType}
            onValueChange={(value) => setGenerationType(value as GenerationType)}
            buttons={[
              { value: 'answer', label: 'Answer' },
              { value: 'outline', label: 'Outline' },
              { value: 'research', label: 'Research' },
            ]}
            style={styles.segmentedButtons}
          />

          <View style={styles.providerSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              AI Provider
            </Text>
            <View style={styles.providerSwitch}>
              <Text>Use Gemini AI</Text>
              <Switch
                value={forceGemini}
                onValueChange={setForceGemini}
              />
            </View>
          </View>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Additional Requirements (Optional)
          </Text>
          <TextInput
            value={additionalPrompt}
            onChangeText={setAdditionalPrompt}
            multiline
            numberOfLines={4}
            style={styles.input}
            placeholder="Add any specific requirements or preferences..."
          />

          <Button
            mode="contained"
            onPress={handleGenerate}
            loading={generating}
            style={styles.generateButton}
          >
            Generate Content
          </Button>
        </Card.Content>
      </Card>

      <Portal>
        <Dialog
          visible={showPreviewDialog}
          onDismiss={() => setShowPreviewDialog(false)}
        >
          <Dialog.Title>Review Prompt</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.promptPreview}>
              {generatedPrompt}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowPreviewDialog(false)}>Cancel</Button>
            <Button onPress={handleConfirmGenerate}>Generate</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  assignmentText: {
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  generateButton: {
    marginTop: 8,
  },
  promptPreview: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
  },
  providerSection: {
    marginTop: 16,
  },
  providerSwitch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 4,
  },
}); 