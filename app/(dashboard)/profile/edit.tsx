import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { supabase } from '../../../services/auth/supabase';
import { router } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';

type ProfileForm = {
  fullName: string;
  schoolName: string;
  studentNumber: string;
  contactNumber: string;
};

export default function EditProfile() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileForm>({
    fullName: '',
    schoolName: '',
    studentNumber: '',
    contactNumber: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      
      setFormData({
        fullName: data.full_name || '',
        schoolName: data.school_name || '',
        studentNumber: data.student_number || '',
        contactNumber: data.contact_number || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      alert('Error loading profile');
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
        .from('users')
        .update({
          full_name: formData.fullName,
          school_name: formData.schoolName,
          student_number: formData.studentNumber,
          contact_number: formData.contactNumber,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (error) throw error;

      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          school_name: formData.schoolName,
          student_number: formData.studentNumber,
        }
      });

      if (authError) throw authError;

      router.back();
    } catch (error: any) {
      console.error('Error:', error.message);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Edit Profile
      </Text>

      <TextInput
        label="Full Name"
        value={formData.fullName}
        onChangeText={(text) => setFormData({ ...formData, fullName: text })}
        style={styles.input}
      />
      <HelperText type="info">Your full name</HelperText>

      <TextInput
        label="School Name"
        value={formData.schoolName}
        onChangeText={(text) => setFormData({ ...formData, schoolName: text })}
        style={styles.input}
      />
      <HelperText type="info">Your school or institution name</HelperText>

      <TextInput
        label="Student Number"
        value={formData.studentNumber}
        onChangeText={(text) => setFormData({ ...formData, studentNumber: text })}
        style={styles.input}
      />
      <HelperText type="info">Your student ID or number</HelperText>

      <TextInput
        label="Contact Number"
        value={formData.contactNumber}
        onChangeText={(text) => setFormData({ ...formData, contactNumber: text })}
        style={styles.input}
        keyboardType="phone-pad"
      />
      <HelperText type="info">Your contact number (optional)</HelperText>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={saving}
          style={styles.submitButton}
        >
          Save Changes
        </Button>
        <Button
          mode="outlined"
          onPress={() => router.back()}
          style={styles.cancelButton}
        >
          Cancel
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 4,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    marginTop: 20,
  },
  submitButton: {
    marginBottom: 12,
  },
  cancelButton: {
    marginBottom: 20,
  },
}); 