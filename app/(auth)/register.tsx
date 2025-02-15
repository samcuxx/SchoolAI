import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useState } from 'react';
import { supabase } from '../../services/auth/supabase';
import { router } from 'expo-router';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    schoolName: '',
    studentNumber: '',
  });

  async function signUpWithEmail() {
    setLoading(true);
    try {
      // Validate form data
      if (!formData.email || !formData.password || !formData.fullName || !formData.schoolName) {
        throw new Error('Please fill in all required fields');
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            school_name: formData.schoolName,
            student_number: formData.studentNumber
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user?.id) throw new Error('No user ID returned');

      // No need to wait or update profile separately as the trigger will handle it
      alert('Registration successful! Please check your email for verification.');
      router.replace('/(auth)/login');
    } catch (error: any) {
      console.error('Error:', error.message);
      alert(error.message || 'Error signing up');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Create Account
      </Text>
      <TextInput
        label="Full Name"
        value={formData.fullName}
        onChangeText={(text) => setFormData({ ...formData, fullName: text })}
        style={styles.input}
      />
      <TextInput
        label="Email"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        label="Password"
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        label="School Name"
        value={formData.schoolName}
        onChangeText={(text) => setFormData({ ...formData, schoolName: text })}
        style={styles.input}
      />
      <TextInput
        label="Student Number"
        value={formData.studentNumber}
        onChangeText={(text) => setFormData({ ...formData, studentNumber: text })}
        style={styles.input}
      />
      <Button
        mode="contained"
        onPress={signUpWithEmail}
        loading={loading}
        style={styles.button}
      >
        Sign Up
      </Button>
      <Button
        mode="text"
        onPress={() => router.push('/(auth)/login')}
      >
        Already have an account? Sign in
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
}); 