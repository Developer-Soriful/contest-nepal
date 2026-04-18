import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ContestantCard from "../components/ContestantCard";
import Header from "../components/Header";
import { authApi, getImageUrl } from "../services/api";

interface Contestant {
  id: string;
  image: string;
  title: string;
  description: string;
  avatar: string;
  userName: string;
  votes: number;
}

const AllContestants = () => {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        // Fetch contests (not contestants/submissions) - users vote on contests
        const response = await authApi.getContests(50);
        if (response.success && response.data?.items) {
          // Transform contest data to match ContestantCard props
          const transformedContests = response.data.items.map((contest: any) => {
            const organizer = contest.organizer || contest.organizerId || {};
            const stats = contest.stats || {};
            
            return {
              id: contest._id || contest.id,
              // Use contest cover image
              image: contest.coverImageUrl || getImageUrl(null),
              // Use contest title
              title: contest.title || 'Contest',
              // Use contest description or prize description
              description: contest.description || contest.prizeDescription || 'No description available',
              // Use organizer avatar
              avatar: organizer.avatarUrl || getImageUrl(null),
              // Use organizer display name
              userName: organizer.displayName || 'Contest Organizer',
              // Use contest participant/submission count as votes
              votes: stats.submissionCount || stats.participantCount || 0,
            };
          });
          setContestants(transformedContests);
        } else {
          setError(response.error?.title || 'Failed to fetch contests');
        }
      } catch (err) {
        setError('Network error. Please try again.');
        console.log('Error fetching contests:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContests();
  }, []);

  const handleVote = async (contestId: string, contestTitle: string) => {
    try {
      console.log(`Voting for contest: ${contestTitle} (ID: ${contestId})`);
      
      // Call the voting API endpoint - vote on the contest
      const response = await authApi.voteOnContest(contestId);
      
      if (response.success) {
        // Update the vote count locally
        setContestants(prev => prev.map(c => 
          c.id === contestId ? { ...c, votes: c.votes + 1 } : c
        ));
        Alert.alert(
          '✅ Vote Successful!', 
          `You have successfully voted for "${contestTitle}"!\n\nTotal votes: ${response.data?.voteCount || 'N/A'}`,
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        // Show detailed error message from backend
        const errorTitle = response.error?.title || 'Vote Failed';
        const errorCode = response.error?.code ? `\nError Code: ${response.error.code}` : '';
        const statusInfo = response.error?.status ? `\nStatus: ${response.error.status}` : '';
        
        Alert.alert(
          `❌ ${errorTitle}`, 
          `Unable to submit your vote. Please try again.${errorCode}${statusInfo}`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (err: any) {
      console.log('Error voting:', err);
      // Handle different types of errors
      let errorMessage = 'Network error. Please check your connection and try again.';
      
      if (err?.response?.data?.error?.title) {
        errorMessage = err.response.data.error.title;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      Alert.alert(
        '❌ Vote Error', 
        errorMessage,
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#f0f4ff", "#ffffff"]}
          style={StyleSheet.absoluteFill}
        />
        <Header title="All Contestants" backgroundColor="transparent" />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <ActivityIndicator size="large" color="#990009" style={styles.loader} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#f0f4ff", "#ffffff"]}
          style={StyleSheet.absoluteFill}
        />
        <Header title="All Contestants" backgroundColor="transparent" />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.errorText}>{error}</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#f0f4ff", "#ffffff"]}
        style={StyleSheet.absoluteFill}
      />
      <Header title="All Contestants" backgroundColor="transparent" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {contestants.map((contestant) => (
          <ContestantCard
            key={contestant.id}
            image={contestant.image}
            title={contestant.title}
            description={contestant.description}
            avatar={contestant.avatar}
            userName={contestant.userName}
            votes={contestant.votes}
            onVote={() => handleVote(contestant.id, contestant.title)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
});

export default AllContestants;
