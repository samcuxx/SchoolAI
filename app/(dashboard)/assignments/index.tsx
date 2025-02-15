import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Chip, FAB, useTheme, Divider, Searchbar } from 'react-native-paper';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../services/auth/supabase';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';

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
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
        .from('assignments')
        .select('*')
        .eq('user_id', session.user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setAssignments(data || []);
      setFilteredAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      alert('Error loading assignments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const filterAssignments = () => {
    const filtered = assignments.filter(assignment => 
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
      case 'completed':
        return theme.colors.primary;
      case 'in_progress':
        return theme.colors.secondary;
      case 'draft':
      default:
        return theme.colors.error;
    }
  };

  const groupAssignmentsByStatus = () => {
    const groups = {
      in_progress: filteredAssignments.filter(a => a.status === 'in_progress'),
      draft: filteredAssignments.filter(a => a.status === 'draft'),
      completed: filteredAssignments.filter(a => a.status === 'completed'),
    };
    return groups;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const groups = groupAssignmentsByStatus();

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search assignments..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredAssignments.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="bodyLarge" style={styles.emptyText}>
                No assignments found
              </Text>
              <Button
                mode="contained"
                onPress={() => router.push('/(dashboard)/assignments/new')}
                style={styles.createButton}
              >
                Create Assignment
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <>
            {/* In Progress Assignments */}
            {groups.in_progress.length > 0 && (
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  In Progress
                </Text>
                {groups.in_progress.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    statusColor={getStatusColor(assignment.status)}
                  />
                ))}
              </View>
            )}

            {/* Draft Assignments */}
            {groups.draft.length > 0 && (
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Drafts
                </Text>
                {groups.draft.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    statusColor={getStatusColor(assignment.status)}
                  />
                ))}
              </View>
            )}

            {/* Completed Assignments */}
            {groups.completed.length > 0 && (
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Completed
                </Text>
                {groups.completed.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    statusColor={getStatusColor(assignment.status)}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push('/(dashboard)/assignments/new')}
      />
    </View>
  );
}

function AssignmentCard({ assignment, statusColor }: { assignment: Assignment, statusColor: string }) {
  const firstQuestion = assignment.instructions?.split('\n')[0] || 'No questions added';
  const questionCount = assignment.instructions?.split('\n').filter(line => line.trim()).length || 0;

  return (
    <Card
      style={styles.card}
      onPress={() => router.push(`/assignments/${assignment.id}`)}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text variant="titleMedium" numberOfLines={1}>{assignment.title}</Text>
            <Text variant="bodyMedium" style={styles.subjectText}>{assignment.subject}</Text>
          </View>
          <Chip
            mode="flat"
            textStyle={{ color: 'white' }}
            style={[styles.statusChip, { backgroundColor: statusColor }]}
          >
            {assignment.status.replace('_', ' ').toUpperCase()}
          </Chip>
        </View>
        
        <Divider style={styles.divider} />
        
        <Text variant="bodyMedium" numberOfLines={2} style={styles.questionPreview}>
          {firstQuestion}
        </Text>
        
        <View style={styles.cardFooter}>
          <Text variant="bodySmall">
            Due: {new Date(assignment.due_date).toLocaleDateString()}
          </Text>
          <Text variant="bodySmall">
            {questionCount} {questionCount === 1 ? 'Question' : 'Questions'}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    margin: 16,
    marginBottom: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginLeft: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  card: {
    margin: 8,
    marginHorizontal: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  subjectText: {
    opacity: 0.7,
    fontSize: 14,
  },
  statusChip: {
    minWidth: 80,
    alignItems: 'center',
  },
  divider: {
    marginVertical: 8,
  },
  questionPreview: {
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyCard: {
    margin: 16,
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  createButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}); 