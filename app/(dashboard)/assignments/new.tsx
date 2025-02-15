import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText, Card } from 'react-native-paper';
import { useState } from 'react';
import { supabase } from '../../../services/auth/supabase';
import { router } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';

type AssignmentForm = {
  title: string;
  subject: string;
  instructions: string;
  dueDate: Date;
};

export default function NewAssignment() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState<AssignmentForm>({
    title: '',
    subject: '',
    instructions: '',
    dueDate: new Date(),
  });

  async function handleSubmit() {
    if (!session?.user) return;
    
    setLoading(true);
    try {
      // Validate form
      if (!formData.title || !formData.subject) {
        throw new Error('Please fill in all required fields');
      }

      // Create assignment
      const { error } = await supabase
        .from('assignments')
        .insert({
          user_id: session.user.id,
          title: formData.title,
          subject: formData.subject,
          instructions: formData.instructions,
          due_date: formData.dueDate.toISOString(),
          status: 'draft'
        });

      if (error) throw error;

      router.push('/(dashboard)/assignments');
    } catch (error: any) {
      console.error('Error:', error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        New Assignment
      </Text>

      <TextInput
        label="Assignment Title"
        value={formData.title}
        onChangeText={(text) => setFormData({ ...formData, title: text })}
        style={styles.input}
        placeholder="e.g., Midterm Essay, Final Project"
      />
      <HelperText type="info">Give your assignment a clear title</HelperText>

      <TextInput
        label="Course/Subject"
        value={formData.subject}
        onChangeText={(text) => setFormData({ ...formData, subject: text })}
        style={styles.input}
        placeholder="e.g., Mathematics, History, Physics"
      />
      <HelperText type="info">Enter the course or subject name</HelperText>

      <Text variant="titleMedium" style={styles.questionLabel}>
        Assignment Questions
      </Text>
      <Card style={styles.questionCard}>
        <Card.Content>
          <TextInput
            value={formData.instructions}
            onChangeText={(text) => setFormData({ ...formData, instructions: text })}
            multiline
            numberOfLines={10}
            style={styles.questionInput}
            placeholder="Enter your questions here... 

Example format:
1. What is the main theme of Shakespeare's Macbeth?

2. Analyze the character development of Lady Macbeth throughout the play.

3. Compare and contrast the themes of ambition and guilt in the play."
            textAlignVertical="top"
            autoCapitalize="sentences"
          />
        </Card.Content>
      </Card>
      <HelperText type="info" style={styles.helperText}>
        Enter each question on a new line. Number your questions for clarity.
      </HelperText>

      <Button
        mode="outlined"
        onPress={() => setShowDatePicker(true)}
        style={styles.input}
      >
        Due Date: {formData.dueDate.toLocaleDateString()}
      </Button>
      <HelperText type="info">When is this assignment due?</HelperText>

      {showDatePicker && (
        <DateTimePicker
          value={formData.dueDate}
          mode="date"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) {
              setFormData({ ...formData, dueDate: date });
            }
          }}
        />
      )}

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        >
          Create Assignment
        </Button>
        <Button
          mode="outlined"
          onPress={() => router.back()}
          style={styles.cancelButton}
        >
          Cancel
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 4,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    marginTop: 20,
  },
  submitButton: {
    marginBottom: 12,
  },
  cancelButton: {
    marginBottom: 20,
  },
  questionLabel: {
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  questionCard: {
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  questionInput: {
    backgroundColor: '#fff',
    fontSize: 16,
    lineHeight: 24,
    padding: 0,
    minHeight: 200,
  },
  helperText: {
    marginBottom: 16,
  },
}); 