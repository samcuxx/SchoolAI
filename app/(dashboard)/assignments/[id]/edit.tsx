import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { supabase } from '../../../../services/auth/supabase';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../../contexts/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';

type AssignmentForm = {
  title: string;
  subject: string;
  instructions: string;
  dueDate: Date;
};

export default function EditAssignment() {
  const { id } = useLocalSearchParams();
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState<AssignmentForm>({
    title: '',
    subject: '',
    instructions: '',
    dueDate: new Date(),
  });

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
      
      setFormData({
        title: data.title,
        subject: data.subject,
        instructions: data.instructions || '',
        dueDate: new Date(data.due_date),
      });
    } catch (error) {
      console.error('Error fetching assignment:', error);
      alert('Error loading assignment');
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!session?.user || !id) return;
    
    setSaving(true);
    try {
      // Validate form
      if (!formData.title || !formData.subject) {
        throw new Error('Please fill in all required fields');
      }

      // Update assignment
      const { error } = await supabase
        .from('assignments')
        .update({
          title: formData.title,
          subject: formData.subject,
          instructions: formData.instructions,
          due_date: formData.dueDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      router.back();
    } catch (error: any) {
      console.error('Error:', error.message);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Edit Assignment
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
      <TextInput
        value={formData.instructions}
        onChangeText={(text) => setFormData({ ...formData, instructions: text })}
        multiline
        numberOfLines={10}
        style={styles.questionInput}
        placeholder="Enter your questions here..."
        textAlignVertical="top"
      />
      <HelperText type="info">
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
          loading={saving}
          style={styles.submitButton}
        >
          Save Changes
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
  questionLabel: {
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  questionInput: {
    backgroundColor: '#fff',
    fontSize: 16,
    lineHeight: 24,
    padding: 12,
    minHeight: 200,
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
}); 