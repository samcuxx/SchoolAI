import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import {
  Button,
  Text,
  Surface,
  Avatar,
  Divider,
  IconButton,
} from "react-native-paper";
import { supabase } from "../../services/auth/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { useState, useEffect } from "react";
import { router, Redirect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LoadingScreen from "../../components/LoadingScreen";

type UserProfile = {
  full_name: string;
  email: string;
  school_name: string;
  student_number: string;
};

export default function Dashboard() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  async function fetchProfile() {
    try {
      if (!session?.user) return;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      alert("Error loading profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Error signing out");
    }
  }

  if (!session) {
    return <Redirect href="/auth/login" />;
  }

  if (loading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#4c669f", "#3b5998", "#192f6a"]}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView}>
          {/* Header Section */}
          <Surface style={styles.headerCard}>
            <View style={styles.headerContent}>
              <Avatar.Text
                size={80}
                label={(
                  profile?.full_name?.substring(0, 2) || "U"
                ).toUpperCase()}
                style={styles.avatar}
              />
              <View style={styles.headerText}>
                <Text variant="headlineSmall" style={styles.name}>
                  {profile?.full_name || "User"}
                </Text>
                <Text variant="bodyMedium" style={styles.email}>
                  {profile?.email}
                </Text>
                <View style={styles.schoolInfo}>
                  <MaterialCommunityIcons
                    name="school"
                    size={16}
                    color="#666"
                  />
                  <Text variant="bodyMedium" style={styles.schoolText}>
                    {profile?.school_name}
                  </Text>
                </View>
                <View style={styles.studentInfo}>
                  <MaterialCommunityIcons
                    name="card-account-details"
                    size={16}
                    color="#666"
                  />
                  <Text variant="bodyMedium" style={styles.studentText}>
                    ID: {profile?.student_number || "Not set"}
                  </Text>
                </View>
              </View>
            </View>
          </Surface>

          {/* Quick Actions Section */}
          <Surface style={styles.actionsCard}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Quick Actions
            </Text>
            <View style={styles.actionButtons}>
              <Surface style={styles.actionButton}>
                <IconButton
                  icon="plus"
                  size={30}
                  onPress={() => router.push("/dashboard/assignments/new")}
                  style={styles.actionIcon}
                />
                <Text variant="bodyMedium" style={styles.actionText}>
                  New Assignment
                </Text>
              </Surface>

              <Surface style={styles.actionButton}>
                <IconButton
                  icon="history"
                  size={30}
                  onPress={() => router.push("/dashboard/assignments")}
                  style={styles.actionIcon}
                />
                <Text variant="bodyMedium" style={styles.actionText}>
                  History
                </Text>
              </Surface>

              <Surface style={styles.actionButton}>
                <IconButton
                  icon="account"
                  size={30}
                  onPress={() => router.push("/dashboard/profile/edit")}
                  style={styles.actionIcon}
                />
                <Text variant="bodyMedium" style={styles.actionText}>
                  Profile
                </Text>
              </Surface>
            </View>
          </Surface>

          {/* Sign Out Button */}
          <Button
            mode="outlined"
            icon="logout"
            style={styles.signOutButton}
            textColor="#fff"
            onPress={handleSignOut}
          >
            Sign Out
          </Button>
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
  headerCard: {
    margin: 16,
    marginTop: 24,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    elevation: 4,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    marginRight: 16,
    elevation: 4,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontWeight: "bold",
    color: "#1a237e",
    marginBottom: 4,
  },
  email: {
    color: "#666",
    marginBottom: 8,
  },
  schoolInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  schoolText: {
    color: "#666",
    marginLeft: 8,
  },
  studentInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  studentText: {
    color: "#666",
    marginLeft: 8,
  },
  actionsCard: {
    margin: 16,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    elevation: 4,
  },
  sectionTitle: {
    color: "#1a237e",
    fontWeight: "bold",
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
  },
  actionButton: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: "white",
    elevation: 2,
  },
  actionIcon: {
    backgroundColor: "transparent",
  },
  actionText: {
    textAlign: "center",
    color: "#666",
    fontSize: 12,
  },
  signOutButton: {
    margin: 16,
    marginTop: 8,
    borderColor: "#fff",
    borderRadius: 10,
  },
});
