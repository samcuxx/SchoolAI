import { View, StyleSheet, ImageBackground } from "react-native";
import { TextInput, Button, Text, Surface } from "react-native-paper";
import { useState } from "react";
import { supabase } from "../../services/auth/supabase";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    try {
      if (!email || !password) {
        throw new Error("Please enter both email and password");
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .single();

      if (profileError) throw profileError;

      router.replace("/dashboard");
    } catch (error: any) {
      console.error("Error:", error.message);
      alert(error.message || "Error signing in");
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
        <Surface style={styles.card}>
          <Text variant="headlineMedium" style={styles.title}>
            Welcome Back
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Sign in to continue to SchoolAI
          </Text>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            style={styles.input}
            mode="outlined"
            theme={{ roundness: 10 }}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            mode="outlined"
            theme={{ roundness: 10 }}
          />

          <Button
            mode="contained"
            onPress={signInWithEmail}
            loading={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Sign In
          </Button>

          <Button
            mode="text"
            onPress={() => router.push("/auth/register")}
            style={styles.linkButton}
          >
            Don't have an account? Sign up
          </Button>
        </Surface>
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
