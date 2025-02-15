import { View, StyleSheet, ScrollView } from "react-native";
import {
  TextInput,
  Button,
  Text,
  HelperText,
  Surface,
  IconButton,
} from "react-native-paper";
import { useState, useEffect } from "react";
import { supabase } from "../../../../services/auth/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../../../contexts/AuthContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";

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
    title: "",
    subject: "",
    instructions: "",
    dueDate: new Date(),
  });

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  async function fetchAssignment() {
    try {
      if (!session?.user || !id) return;

      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setFormData({
        title: data.title,
        subject: data.subject,
        instructions: data.instructions || "",
        dueDate: new Date(data.due_date),
      });
    } catch (error) {
      console.error("Error fetching assignment:", error);
      alert("Error loading assignment");
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
        throw new Error("Please fill in all required fields");
      }

      // Update assignment
      const { error } = await supabase
        .from("assignments")
        .update({
          title: formData.title,
          subject: formData.subject,
          instructions: formData.instructions,
          due_date: formData.dueDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      router.back();
    } catch (error: any) {
      console.error("Error:", error.message);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="book-edit" size={40} color="#1a237e" />
        <Text style={styles.loadingText}>Loading assignment...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#4c669f", "#3b5998", "#192f6a"]}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView}>
          <Surface style={styles.formCard}>
            <View style={styles.headerSection}>
              <MaterialCommunityIcons
                name="book-edit"
                size={40}
                color="#1a237e"
                style={styles.headerIcon}
              />
              <Text variant="headlineMedium" style={styles.title}>
                Edit Assignment
              </Text>
              <Text variant="bodyLarge" style={styles.subtitle}>
                Update assignment details
              </Text>
            </View>

            <Surface style={styles.inputSection}>
              <View style={styles.inputGroup}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Basic Information
                </Text>
                <TextInput
                  label="Assignment Title"
                  value={formData.title}
                  onChangeText={(text) =>
                    setFormData({ ...formData, title: text })
                  }
                  style={styles.input}
                  mode="outlined"
                  theme={{ roundness: 10 }}
                  left={<TextInput.Icon icon="format-title" />}
                  placeholder="e.g., Midterm Essay, Final Project"
                />
                <HelperText type="info" style={styles.helperText}>
                  Give your assignment a clear title
                </HelperText>

                <TextInput
                  label="Course/Subject"
                  value={formData.subject}
                  onChangeText={(text) =>
                    setFormData({ ...formData, subject: text })
                  }
                  style={styles.input}
                  mode="outlined"
                  theme={{ roundness: 10 }}
                  left={<TextInput.Icon icon="book-open-variant" />}
                  placeholder="e.g., Mathematics, History, Physics"
                />
                <HelperText type="info" style={styles.helperText}>
                  Enter the course or subject name
                </HelperText>
              </View>

              <View style={styles.inputGroup}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Assignment Questions
                </Text>
                <Surface style={styles.questionCard}>
                  <TextInput
                    value={formData.instructions}
                    onChangeText={(text) =>
                      setFormData({ ...formData, instructions: text })
                    }
                    multiline
                    numberOfLines={10}
                    style={styles.questionInput}
                    mode="outlined"
                    theme={{ roundness: 10 }}
                    placeholder="Enter your questions here... 

Example format:
1. What is the main theme of Shakespeare's Macbeth?

2. Analyze the character development of Lady Macbeth throughout the play.

3. Compare and contrast the themes of ambition and guilt in the play."
                    textAlignVertical="top"
                  />
                </Surface>
                <HelperText type="info" style={styles.helperText}>
                  Enter each question on a new line. Number your questions for
                  clarity.
                </HelperText>
              </View>

              <View style={styles.inputGroup}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Due Date
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateButton}
                  icon="calendar"
                  theme={{ roundness: 10 }}
                >
                  {formData.dueDate.toLocaleDateString()}
                </Button>
                <HelperText type="info" style={styles.helperText}>
                  When is this assignment due?
                </HelperText>
              </View>

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
                  contentStyle={styles.buttonContent}
                  theme={{ roundness: 10 }}
                >
                  Save Changes
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => router.back()}
                  style={styles.cancelButton}
                  theme={{ roundness: 10 }}
                >
                  Cancel
                </Button>
              </View>
            </Surface>
          </Surface>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    color: "#1a237e",
    fontSize: 16,
  },
  formCard: {
    margin: 16,
    marginTop: 24,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    elevation: 4,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  headerIcon: {
    marginBottom: 16,
  },
  title: {
    color: "#1a237e",
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    color: "#666",
    marginTop: 8,
  },
  inputSection: {
    backgroundColor: "transparent",
    elevation: 0,
  },
  inputGroup: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#1a237e",
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "transparent",
  },
  helperText: {
    marginBottom: 8,
  },
  questionCard: {
    backgroundColor: "transparent",
    elevation: 0,
  },
  questionInput: {
    backgroundColor: "transparent",
    fontSize: 16,
    lineHeight: 24,
    minHeight: 200,
  },
  dateButton: {
    marginVertical: 8,
    borderColor: "#1a237e",
  },
  buttonContainer: {
    marginTop: 32,
    gap: 12,
  },
  submitButton: {
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  cancelButton: {
    borderColor: "#1a237e",
  },
});
