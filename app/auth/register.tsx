import { View, StyleSheet, ScrollView } from "react-native";
import { TextInput, Button, Text, Surface } from "react-native-paper";
import { useState } from "react";
import { supabase } from "../../services/auth/supabase";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    schoolName: "",
    studentNumber: "",
  });

  async function signUpWithEmail() {
    setLoading(true);
    try {
      // Validate form data
      if (
        !formData.email ||
        !formData.password ||
        !formData.fullName ||
        !formData.schoolName
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            school_name: formData.schoolName,
            student_number: formData.studentNumber,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user?.id) throw new Error("No user ID returned");

      alert(
        "Registration successful! Please check your email for verification."
      );
      router.replace("/auth/login");
    } catch (error: any) {
      console.error("Error:", error.message);
      alert(error.message || "Error signing up");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#4c669f", "#3b5998", "#192f6a"]}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Surface style={styles.card}>
            <Text variant="headlineMedium" style={styles.title}>
              Create Account
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Join SchoolAI and start your journey
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
            />
            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              autoCapitalize="none"
              style={styles.input}
              mode="outlined"
              theme={{ roundness: 10 }}
            />
            <TextInput
              label="Password"
              value={formData.password}
              onChangeText={(text) =>
                setFormData({ ...formData, password: text })
              }
              secureTextEntry
              style={styles.input}
              mode="outlined"
              theme={{ roundness: 10 }}
            />
            <TextInput
              label="School Name"
              value={formData.schoolName}
              onChangeText={(text) =>
                setFormData({ ...formData, schoolName: text })
              }
              style={styles.input}
              mode="outlined"
              theme={{ roundness: 10 }}
            />
            <TextInput
              label="Student Number (Optional)"
              value={formData.studentNumber}
              onChangeText={(text) =>
                setFormData({ ...formData, studentNumber: text })
              }
              style={styles.input}
              mode="outlined"
              theme={{ roundness: 10 }}
            />

            <Button
              mode="contained"
              onPress={signUpWithEmail}
              loading={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              Create Account
            </Button>

            <Button
              mode="text"
              onPress={() => router.push("/auth/login")}
              style={styles.linkButton}
            >
              Already have an account? Sign in
            </Button>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    padding: 24,
    borderRadius: 20,
    elevation: 4,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "bold",
    color: "#1a237e",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
    color: "#666",
  },
  input: {
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 10,
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  linkButton: {
    marginTop: 8,
  },
});
