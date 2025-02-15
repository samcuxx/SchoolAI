import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Card, Avatar, Divider } from 'react-native-paper';
import { supabase } from '../../services/auth/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';

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
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      alert('Error loading profile');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Error signing out');
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
      <Card style={styles.profileCard}>
        <Card.Title
          title={profile?.full_name || 'User'}
          subtitle={profile?.email}
          left={(props) => (
            <Avatar.Text 
              {...props} 
              label={(profile?.full_name?.substring(0, 2) || 'U').toUpperCase()} 
            />
          )}
        />
        <Card.Content>
          <Text variant="bodyLarge">School: {profile?.school_name}</Text>
          <Text variant="bodyMedium">Student ID: {profile?.student_number}</Text>
        </Card.Content>
      </Card>

      <View style={styles.menuSection}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Quick Actions
        </Text>
        <Divider style={styles.divider} />
        
        <Button
          mode="contained"
          icon="plus"
          style={styles.menuButton}
          onPress={() => router.push('/(dashboard)/assignments/new')}
        >
          New Assignment
        </Button>

        <Button
          mode="contained"
          icon="history"
          style={styles.menuButton}
          onPress={() => router.push('/(dashboard)/assignments')}
        >
          Assignment History
        </Button>

        <Button
          mode="contained"
          icon="account"
          style={styles.menuButton}
          onPress={() => router.push('/(dashboard)/profile/edit')}
        >
          Edit Profile
        </Button>
      </View>

      <Button
        mode="outlined"
        icon="logout"
        style={styles.signOutButton}
        onPress={handleSignOut}
      >
        Sign Out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileCard: {
    margin: 16,
    elevation: 4,
  },
  menuSection: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  menuButton: {
    marginBottom: 12,
  },
  signOutButton: {
    margin: 16,
  },
}); 