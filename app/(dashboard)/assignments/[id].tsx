import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, Button, Chip, Portal, Dialog } from "react-native-paper";
import { useAuth } from "../../../contexts/AuthContext";
import { supabase } from "../../../services/auth/supabase";
import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useAIResponses } from "../../../hooks/useAIResponses";
import { Clipboard } from "react-native";
import { MarkdownPreview } from "../../../components/MarkdownPreview";

type Assignment = {
  id: string;
  title: string;
  subject: string;
  instructions: string;
  due_date: string;
  status: string;
  content: string;
  created_at: string;
};

export default function AssignmentDetail() {
  const { id } = useLocalSearchParams();
  const { session, profile, loading: profileLoading } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const {
    responses,
    loading: loadingResponses,
    deleteResponse,
  } = useAIResponses(id as string);
  const [showDeleteResponseDialog, setShowDeleteResponseDialog] =
    useState(false);
  const [responseToDelete, setResponseToDelete] = useState<AIResponse | null>(
    null
  );

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

  async function handleDelete() {
    try {
      if (!session?.user || !id) return;

      const { error } = await supabase
        .from("assignments")
        .delete()
        .eq("id", id);

      if (error) throw error;

      router.replace("/(dashboard)/assignments");
    } catch (error) {
      console.error("Error deleting assignment:", error);
      alert("Error deleting assignment");
    }
  }

  async function handleStatusChange(newStatus: string) {
    try {
      if (!session?.user || !id) return;

      const { error } = await supabase
        .from("assignments")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setAssignment((prev) => (prev ? { ...prev, status: newStatus } : null));
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status");
    }
  }

  async function handleDeleteResponse(response: AIResponse) {
    try {
      await deleteResponse(response.id);
      setShowDeleteResponseDialog(false);
      setResponseToDelete(null);
    } catch (error) {
      console.error("Error deleting response:", error);
      alert("Error deleting response");
    }
  }

  if (loading || !assignment || profileLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineMedium">{assignment.title}</Text>
            <Text variant="titleMedium" style={styles.subject}>
              Subject: {assignment.subject}
            </Text>

            <View style={styles.statusContainer}>
              <Text variant="bodyLarge">Status: </Text>
              <Chip
                mode="flat"
                onPress={() => {
                  const newStatus =
                    assignment.status === "draft"
                      ? "in_progress"
                      : assignment.status === "in_progress"
                      ? "completed"
                      : "draft";
                  handleStatusChange(newStatus);
                }}
                style={styles.statusChip}
              >
                {assignment.status.replace("_", " ").toUpperCase()}
              </Chip>
            </View>

            <Text variant="bodyLarge" style={styles.sectionTitle}>
              Due Date
            </Text>
            <Text variant="bodyMedium" style={styles.sectionContent}>
              {new Date(assignment.due_date).toLocaleDateString()}
            </Text>

            <Text variant="bodyLarge" style={styles.sectionTitle}>
              Instructions
            </Text>
            <Text variant="bodyMedium" style={styles.sectionContent}>
              {assignment.instructions || "No instructions provided"}
            </Text>

            {assignment.content && (
              <>
                <Text variant="bodyLarge" style={styles.sectionTitle}>
                  Content
                </Text>
                <Text variant="bodyMedium" style={styles.sectionContent}>
                  {assignment.content}
                </Text>
              </>
            )}
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            icon="pencil"
            onPress={() => router.push(`/assignments/${id}/edit`)}
            style={styles.button}
          >
            Edit Assignment
          </Button>
          <Button
            mode="contained"
            icon="robot"
            onPress={() => router.push(`/assignments/${id}/generate`)}
            style={styles.button}
          >
            Generate Solution
          </Button>
          <Button
            mode="outlined"
            icon="delete"
            onPress={() => setShowDeleteDialog(true)}
            style={styles.button}
            textColor="red"
          >
            Delete Assignment
          </Button>
        </View>

        {responses.length > 0 && (
          <View style={styles.section}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Generated Content
            </Text>
            {responses.map((response) => (
              <Card key={response.id} style={styles.responseCard}>
                <Card.Content>
                  <View style={styles.responseHeader}>
                    <Chip
                      mode="outlined"
                      style={styles.providerChip}
                      textStyle={{
                        color:
                          response.provider === "openai"
                            ? "#10a37f"
                            : "#1a73e8",
                      }}
                    >
                      {response.provider === "openai" ? "ChatGPT" : "Gemini AI"}
                    </Chip>
                    <Text variant="bodySmall" style={styles.timestamp}>
                      {new Date(response.created_at).toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.markdownContainer}>
                    <MarkdownPreview content={response.response} />
                  </View>

                  <View style={styles.responseActions}>
                    <Button
                      mode="text"
                      icon="content-copy"
                      onPress={() => {
                        Clipboard.setString(response.response);
                        alert("Copied to clipboard!");
                      }}
                      style={styles.actionButton}
                    >
                      Copy
                    </Button>
                    <Button
                      mode="text"
                      icon="delete"
                      onPress={() => {
                        setResponseToDelete(response);
                        setShowDeleteResponseDialog(true);
                      }}
                      style={styles.actionButton}
                      textColor="red"
                    >
                      Delete
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      <Portal>
        <Dialog
          visible={showDeleteDialog}
          onDismiss={() => setShowDeleteDialog(false)}
        >
          <Dialog.Title>Delete Assignment</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete this assignment? This action
              cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button onPress={handleDelete} textColor="red">
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={showDeleteResponseDialog}
          onDismiss={() => {
            setShowDeleteResponseDialog(false);
            setResponseToDelete(null);
          }}
        >
          <Dialog.Title>Delete Response</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to delete this AI-generated response? This
              action cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setShowDeleteResponseDialog(false);
                setResponseToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onPress={() =>
                responseToDelete && handleDeleteResponse(responseToDelete)
              }
              textColor="red"
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
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
  subject: {
    marginTop: 8,
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusChip: {
    marginLeft: 8,
  },
  sectionTitle: {
    marginTop: 16,
    fontWeight: "bold",
  },
  sectionContent: {
    marginTop: 8,
  },
  buttonContainer: {
    padding: 16,
  },
  button: {
    marginBottom: 12,
  },
  responseCard: {
    marginTop: 12,
    overflow: "hidden",
  },
  responseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  providerChip: {
    height: 28,
  },
  responseActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  actionButton: {
    marginLeft: 8,
  },
  timestamp: {
    opacity: 0.7,
  },
  markdownContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginVertical: 12,
  },
});
