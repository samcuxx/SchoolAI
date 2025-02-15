import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
import {
  Text,
  Surface,
  Button,
  Chip,
  FAB,
  useTheme,
  Divider,
  Searchbar,
  IconButton,
} from "react-native-paper";
import { useAuth } from "../../../contexts/AuthContext";
import { supabase } from "../../../services/auth/supabase";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Assignment = {
  id: string;
  title: string;
  subject: string;
  due_date: string;
  status: string;
  created_at: string;
  instructions: string;
};

export default function Assignments() {
  const { session } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const theme = useTheme();

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [searchQuery, assignments]);

  async function fetchAssignments() {
    try {
      if (!session?.user) return;

      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("user_id", session.user.id)
        .order("due_date", { ascending: true });

      if (error) throw error;
      setAssignments(data || []);
      setFilteredAssignments(data || []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      alert("Error loading assignments");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const filterAssignments = () => {
    const filtered = assignments.filter(
      (assignment) =>
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredAssignments(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAssignments();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#4CAF50"; // Green
      case "in_progress":
        return "#2196F3"; // Blue
      case "draft":
      default:
        return "#FFA000"; // Amber
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "check-circle";
      case "in_progress":
        return "progress-clock";
      case "draft":
      default:
        return "pencil-outline";
    }
  };

  const groupAssignmentsByStatus = () => {
    const groups = {
      in_progress: filteredAssignments.filter(
        (a) => a.status === "in_progress"
      ),
      draft: filteredAssignments.filter((a) => a.status === "draft"),
      completed: filteredAssignments.filter((a) => a.status === "completed"),
    };
    return groups;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="book-clock" size={40} color="#1a237e" />
        <Text style={styles.loadingText}>Loading assignments...</Text>
      </View>
    );
  }

  const groups = groupAssignmentsByStatus();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#4c669f", "#3b5998", "#192f6a"]}
        style={styles.gradient}
      >
        <Surface style={styles.header}>
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search assignments..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              theme={{ roundness: 10 }}
              icon="magnify"
            />
          </View>
        </Surface>

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredAssignments.length === 0 ? (
            <Surface style={styles.emptyCard}>
              <MaterialCommunityIcons
                name="book-plus"
                size={50}
                color="#1a237e"
                style={styles.emptyIcon}
              />
              <Text variant="headlineSmall" style={styles.emptyTitle}>
                No Assignments Yet
              </Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Create your first assignment to get started
              </Text>
              <Button
                mode="contained"
                onPress={() => router.push("/dashboard/assignments/new")}
                style={styles.createButton}
                icon="plus"
                theme={{ roundness: 10 }}
              >
                Create Assignment
              </Button>
            </Surface>
          ) : (
            <>
              {/* In Progress Assignments */}
              {groups.in_progress.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons
                      name="progress-clock"
                      size={24}
                      color="#1a237e"
                    />
                    <Text variant="titleLarge" style={styles.sectionTitle}>
                      In Progress
                    </Text>
                  </View>
                  {groups.in_progress.map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      statusColor={getStatusColor(assignment.status)}
                      statusIcon={getStatusIcon(assignment.status)}
                    />
                  ))}
                </View>
              )}

              {/* Draft Assignments */}
              {groups.draft.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons
                      name="pencil-outline"
                      size={24}
                      color="#1a237e"
                    />
                    <Text variant="titleLarge" style={styles.sectionTitle}>
                      Drafts
                    </Text>
                  </View>
                  {groups.draft.map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      statusColor={getStatusColor(assignment.status)}
                      statusIcon={getStatusIcon(assignment.status)}
                    />
                  ))}
                </View>
              )}

              {/* Completed Assignments */}
              {groups.completed.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={24}
                      color="#1a237e"
                    />
                    <Text variant="titleLarge" style={styles.sectionTitle}>
                      Completed
                    </Text>
                  </View>
                  {groups.completed.map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      statusColor={getStatusColor(assignment.status)}
                      statusIcon={getStatusIcon(assignment.status)}
                    />
                  ))}
                </View>
              )}
            </>
          )}
          <View style={styles.bottomPadding} />
        </ScrollView>

        <FAB
          icon="plus"
          label="New Assignment"
          style={styles.fab}
          onPress={() => router.push("/dashboard/assignments/new")}
          theme={{ roundness: 20 }}
        />
      </LinearGradient>
    </View>
  );
}

function AssignmentCard({
  assignment,
  statusColor,
  statusIcon,
}: {
  assignment: Assignment;
  statusColor: string;
  statusIcon: string;
}) {
  const firstQuestion =
    assignment.instructions?.split("\n")[0] || "No questions added";
  const questionCount =
    assignment.instructions?.split("\n").filter((line) => line.trim()).length ||
    0;
  const dueDate = new Date(assignment.due_date);
  const isOverdue = dueDate < new Date() && assignment.status !== "completed";

  return (
    <Surface
      style={[styles.card, isOverdue && styles.overdueCard]}
      elevation={2}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text
              variant="titleMedium"
              style={styles.cardTitle}
              numberOfLines={1}
            >
              {assignment.title}
            </Text>
            <Text variant="bodyMedium" style={styles.subjectText}>
              {assignment.subject}
            </Text>
          </View>
          <Chip
            mode="flat"
            textStyle={{ color: "white" }}
            style={[styles.statusChip, { backgroundColor: statusColor }]}
            icon={() => (
              <MaterialCommunityIcons
                name={statusIcon}
                size={16}
                color="white"
              />
            )}
          >
            {assignment.status.replace("_", " ").toUpperCase()}
          </Chip>
        </View>

        <Divider style={styles.divider} />

        <Text
          variant="bodyMedium"
          numberOfLines={2}
          style={styles.questionPreview}
        >
          {firstQuestion}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.footerInfo}>
            <MaterialCommunityIcons
              name={isOverdue ? "alert-circle" : "calendar"}
              size={16}
              color={isOverdue ? "#f44336" : "#666"}
              style={styles.footerIcon}
            />
            <Text
              variant="bodySmall"
              style={[styles.footerText, isOverdue && styles.overdueText]}
            >
              {isOverdue ? "Overdue: " : "Due: "}
              {dueDate.toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.footerInfo}>
            <MaterialCommunityIcons
              name="format-list-numbered"
              size={16}
              color="#666"
              style={styles.footerIcon}
            />
            <Text variant="bodySmall" style={styles.footerText}>
              {questionCount} {questionCount === 1 ? "Question" : "Questions"}
            </Text>
          </View>
        </View>

        <IconButton
          icon="chevron-right"
          size={24}
          style={styles.cardAction}
          onPress={() => router.push(`/dashboard/assignments/${assignment.id}`)}
        />
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
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
  header: {
    backgroundColor: "transparent",
    elevation: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    marginBottom: 8,
  },
  searchBar: {
    elevation: 2,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  scrollView: {
    flex: 1,
  },
  emptyCard: {
    margin: 16,
    padding: 24,
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    elevation: 4,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    color: "#1a237e",
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyText: {
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  createButton: {
    elevation: 2,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    marginLeft: 8,
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    marginBottom: 12,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    overflow: "hidden",
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#f44336",
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    color: "#1a237e",
    fontWeight: "bold",
  },
  subjectText: {
    color: "#666",
    marginTop: 2,
  },
  statusChip: {
    borderRadius: 20,
  },
  divider: {
    marginVertical: 12,
  },
  questionPreview: {
    color: "#444",
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerIcon: {
    marginRight: 4,
  },
  footerText: {
    color: "#666",
  },
  overdueText: {
    color: "#f44336",
  },
  cardAction: {
    position: "absolute",
    right: 4,
    top: "50%",
    marginTop: -20,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#1a237e",
    borderRadius: 28,
  },
  bottomPadding: {
    height: 80,
  },
});
