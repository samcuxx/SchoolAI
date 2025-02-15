import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text,
  Surface,
  Button,
  TextInput,
  HelperText,
} from "react-native-paper";
import { useAuth } from "../../../../contexts/AuthContext";
import { supabase } from "../../../../services/auth/supabase";
import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useAIResponses } from "../../../../hooks/useAIResponses";
import { MarkdownPreview } from "../../../../components/MarkdownPreview";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";

type Assignment = {
  id: string;
  title: string;
  subject: string;
  instructions: string;
};

export default function GenerateContent() {
  const { id } = useLocalSearchParams();
  const { session, profile } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const { generateResponse } = useAIResponses(id as string);

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
      setAssignment(data);
    } catch (error) {
      console.error("Error fetching assignment:", error);
      alert("Error loading assignment");
      router.back();
    } finally {
      setLoading(false);
    }
  }

  const generatePrompt = () => {
    if (!assignment || !profile) return "";

    return `Create a formal academic assignment solution with the following structure:

${assignment.instructions}

Please write and solve this assignment in a formal academic manner, ensuring:
1. Clear and professional formatting
2. Detailed explanations and solutions
3. Step-by-step problem-solving where applicable
4. Proper academic language and terminology
5. Relevant examples or illustrations if needed
6. Citations and references if required
7. Use the following format:{
text size: 12pt
line height: 1.5
font: Times New Roman
}

Format the response in markdown, maintaining the header structure as shown above.
Include a conclusion or summary at the end if appropriate.

Additional Requirements:
${
  additionalPrompt
    ? additionalPrompt
    : "Standard academic formatting and professional presentation."
}`;
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const prompt = generatePrompt();
      await generateResponse(prompt);
      router.push(`/assignments/${id}`);
    } catch (error) {
      console.error("Error generating content:", error);
      alert("Error generating content");
    } finally {
      setGenerating(false);
    }
  };

  if (loading || !assignment) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="robot" size={40} color="#1a237e" />
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
                name="robot"
                size={40}
                color="#1a237e"
                style={styles.headerIcon}
              />
              <Text variant="headlineMedium" style={styles.title}>
                Generate Solution
              </Text>
              <Text variant="bodyLarge" style={styles.subtitle}>
                AI-powered assignment solver
              </Text>
            </View>

            <Surface style={styles.contentSection}>
              <View style={styles.inputGroup}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons
                    name="book-open-page-variant"
                    size={24}
                    color="#1a237e"
                  />
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Assignment Details
                  </Text>
                </View>
                <Surface style={styles.detailsCard}>
                  <Text variant="bodyLarge" style={styles.assignmentText}>
                    {assignment.instructions}
                  </Text>
                </Surface>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons
                    name="cog"
                    size={24}
                    color="#1a237e"
                  />
                  <Text variant="titleMedium" style={styles.sectionTitle}>
                    Additional Requirements
                  </Text>
                </View>
                <TextInput
                  value={additionalPrompt}
                  onChangeText={setAdditionalPrompt}
                  multiline
                  numberOfLines={4}
                  style={styles.input}
                  mode="outlined"
                  theme={{ roundness: 10 }}
                  placeholder="Add any specific requirements or preferences..."
                />
                <HelperText type="info" style={styles.helperText}>
                  Optional: Specify any additional requirements for the solution
                </HelperText>
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={handleGenerate}
                  loading={generating}
                  style={styles.generateButton}
                  contentStyle={styles.buttonContent}
                  theme={{ roundness: 10 }}
                  icon="robot"
                >
                  {generating ? "Generating Solution..." : "Generate Solution"}
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
  contentSection: {
    backgroundColor: "transparent",
    elevation: 0,
  },
  inputGroup: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    marginLeft: 8,
    color: "#1a237e",
    fontWeight: "bold",
  },
  detailsCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
  },
  assignmentText: {
    color: "#444",
    lineHeight: 24,
  },
  input: {
    backgroundColor: "transparent",
  },
  helperText: {
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 32,
    gap: 12,
  },
  generateButton: {
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  cancelButton: {
    borderColor: "#1a237e",
  },
});
