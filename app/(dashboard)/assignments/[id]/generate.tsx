import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, Button, TextInput } from "react-native-paper";
import { useAuth } from "../../../../contexts/AuthContext";
import { supabase } from "../../../../services/auth/supabase";
import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useAIResponses } from "../../../../hooks/useAIResponses";
import { MarkdownPreview } from "../../../../components/MarkdownPreview";

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
            Solve Assignment
          </Text>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            Assignment Details
          </Text>
          <Text variant="bodyMedium" style={styles.assignmentText}>
            {assignment.instructions}
          </Text>

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
            {generating ? "Generating Solution..." : "Generate Solution"}
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  card: {
    margin: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: "center",
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "bold",
  },
  assignmentText: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  generateButton: {
    marginTop: 8,
  },
});
