import { View, StyleSheet, ScrollView } from "react-native";
import {
  TextInput,
  Button,
  Text,
  HelperText,
  Surface,
  Avatar,
} from "react-native-paper";
import { useState, useEffect } from "react";
import { supabase } from "../../../services/auth/supabase";
import { router } from "expo-router";
import { useAuth } from "../../../contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LoadingScreen from "../../../components/LoadingScreen";

type ProfileForm = {
  fullName: string;
  schoolName: string;
  studentNumber: string;
  contactNumber: string;
  program: string;
  department: string;
};

export default function EditProfile() {
  const { session, profile: currentProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileForm>({
    fullName: "",
    schoolName: "",
    studentNumber: "",
    contactNumber: "",
    program: "",
    department: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      if (!session?.user) return;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;

      setFormData({
        fullName: data.full_name || "",
        schoolName: data.school_name || "",
        studentNumber: data.student_number || "",
        contactNumber: data.contact_number || "",
        program: data.program || "",
        department: data.department || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      alert("Error loading profile");
      router.back();
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!session?.user) return;

    setSaving(true);
    try {
      // Update profile
      const { error } = await supabase
        .from("users")
        .update({
          full_name: formData.fullName,
          school_name: formData.schoolName,
          student_number: formData.studentNumber,
          contact_number: formData.contactNumber,
          program: formData.program,
          department: formData.department,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.user.id);

      if (error) throw error;

      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          school_name: formData.schoolName,
          student_number: formData.studentNumber,
        },
      });

      if (authError) throw authError;

      router.back();
    } catch (error: any) {
      console.error("Error:", error.message);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingScreen message="Loading profile..." />;
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
              <Avatar.Text
                size={80}
                label={(
                  formData.fullName?.substring(0, 2) || "U"
                ).toUpperCase()}
                style={styles.avatar}
              />
              <Text variant="headlineMedium" style={styles.title}>
                Edit Profile
              </Text>
              <Text variant="bodyLarge" style={styles.subtitle}>
                Update your personal information
              </Text>
            </View>

            <Surface style={styles.inputSection}>
              {/* Personal Information */}
              <View style={styles.inputGroup}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Personal Information
                </Text>
                <TextInput
                  label="Full Name"
                  value={formData.fullName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, fullName: text })
                  }
                  style={styles.input}
                  mode="outlined"
                  theme={{ roundness: 10 }}
                  left={<TextInput.Icon icon="account" />}
                />
                <HelperText type="info" style={styles.helperText}>
                  Enter your full name as it appears on official documents
                </HelperText>

                <TextInput
                  label="Contact Number"
                  value={formData.contactNumber}
                  onChangeText={(text) =>
                    setFormData({ ...formData, contactNumber: text })
                  }
                  style={styles.input}
                  mode="outlined"
                  theme={{ roundness: 10 }}
                  keyboardType="phone-pad"
                  left={<TextInput.Icon icon="phone" />}
                />
              </View>

              {/* Academic Information */}
              <View style={styles.inputGroup}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Academic Information
                </Text>
                <TextInput
                  label="School Name"
                  value={formData.schoolName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, schoolName: text })
                  }
                  style={styles.input}
                  mode="outlined"
                  theme={{ roundness: 10 }}
                  left={<TextInput.Icon icon="school" />}
                />

                <TextInput
                  label="Student Number"
                  value={formData.studentNumber}
                  onChangeText={(text) =>
                    setFormData({ ...formData, studentNumber: text })
                  }
                  style={styles.input}
                  mode="outlined"
                  theme={{ roundness: 10 }}
                  left={<TextInput.Icon icon="card-account-details" />}
                />

                <TextInput
                  label="Program"
                  value={formData.program}
                  onChangeText={(text) =>
                    setFormData({ ...formData, program: text })
                  }
                  style={styles.input}
                  mode="outlined"
                  theme={{ roundness: 10 }}
                  placeholder="e.g., Bachelor of Science"
                  left={<TextInput.Icon icon="book-education" />}
                />

                <TextInput
                  label="Department"
                  value={formData.department}
                  onChangeText={(text) =>
                    setFormData({ ...formData, department: text })
                  }
                  style={styles.input}
                  mode="outlined"
                  theme={{ roundness: 10 }}
                  placeholder="e.g., Computer Science"
                  left={<TextInput.Icon icon="domain" />}
                />
              </View>

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
  scrollView: {
    flex: 1,
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
  avatar: {
    marginBottom: 16,
    elevation: 4,
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
    marginBottom: 4,
    backgroundColor: "transparent",
  },
  helperText: {
    marginBottom: 12,
  },
  buttonContainer: {
    marginTop: 32,
  },
  submitButton: {
    marginBottom: 12,
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  cancelButton: {
    borderColor: "#1a237e",
  },
});
