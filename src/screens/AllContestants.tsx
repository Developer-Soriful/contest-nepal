import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
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
  hasVoted: boolean;
  isVoting: boolean;
}

const AllContestants = () => {
  const { contestId, title } = useLocalSearchParams<{ contestId?: string; title?: string }>();
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageTitle = title ? `${title} - Entries` : "All Contestants";

  useEffect(() => {
    const fetchContests = async () => {
      try {
        // Fetch contests (not contestants/submissions) - users vote on contests
        const response = await authApi.getContests(50);
        if (response.success && response.data?.items) {
          let contests = response.data.items;

          // If contestId is provided, filter to show only that contest
          if (contestId) {
            contests = contests.filter((c: any) => (c._id || c.id) === contestId);
          }

          // Get contest IDs for fetching vote counts
          const contestIds = contests.map((c: any) => c._id || c.id);

          // Fetch vote counts and the current user's vote statuses together
          const [voteCountsResponse, voteStatusesResponse] = await Promise.all([
            authApi.getVoteCounts(contestIds),
            authApi.getVoteStatuses(contestIds),
          ]);
          const voteCounts = voteCountsResponse.success ? voteCountsResponse.data?.voteCounts || {} : {};
          const voteStatuses = voteStatusesResponse.success ? voteStatusesResponse.data?.voteStatuses || {} : {};

          // Transform contest data to match ContestantCard props
          const transformedContests = contests.map((contest: any) => {
            const organizer = contest.organizer || contest.organizerId || {};
            const id = contest._id || contest.id;

            return {
              id: id,
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
              // Use proper vote count from Vote model (not submissionCount)
              votes: voteCounts[id] || 0,
              hasVoted: Boolean(voteStatuses[id]),
              isVoting: false,
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
  }, [contestId]);

  const handleVote = async (contestId: string, contestTitle: string) => {
    try {
      const selectedContest = contestants.find((contestant) => contestant.id === contestId);
      if (!selectedContest || selectedContest.hasVoted || selectedContest.isVoting) {
        return;
      }

      setContestants((prev) =>
        prev.map((contestant) =>
          contestant.id === contestId ? { ...contestant, isVoting: true } : contestant
        )
      );

      console.log(`Voting for contest: ${contestTitle} (ID: ${contestId})`);
      
      // Call the voting API endpoint - vote on the contest
      const response = await authApi.voteOnContest(contestId);
      
      if (response.success) {
        // Persist the authoritative state from backend response
        setContestants(prev => prev.map(c => 
          c.id === contestId
            ? {
                ...c,
                votes: response.data?.voteCount ?? c.votes,
                hasVoted: response.data?.hasVoted ?? true,
                isVoting: false,
              }
            : c
        ));
        Alert.alert(
          '✅ Vote Successful!', 
          `You have successfully voted for "${contestTitle}"!\n\nTotal votes: ${response.data?.voteCount || 'N/A'}`,
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        setContestants(prev => prev.map(c => 
          c.id === contestId ? { ...c, isVoting: false } : c
        ));
        // Show detailed error message from backend
        const errorTitle = response.error?.title || 'Vote Failed';
        const errorStatus = response.error?.status || '';
        
        Alert.alert(
          `❌ ${errorTitle}`, 
          errorStatus ? `Status: ${errorStatus}` : 'Unable to submit your vote.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (err: any) {
      setContestants(prev => prev.map(c => 
        c.id === contestId ? { ...c, isVoting: false } : c
      ));
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
        <Header title={pageTitle} backgroundColor="transparent" />
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
        <Header title={pageTitle} backgroundColor="transparent" />
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
      <Header title={pageTitle} backgroundColor="transparent" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {contestId && contestants.length === 0 ? (
          <Text style={styles.emptyText}>No entries found for this contest.</Text>
        ) : (
          contestants.map((contestant) => (
            <ContestantCard
              key={contestant.id}
              image={contestant.image}
              title={contestant.title}
              description={contestant.description}
              avatar={contestant.avatar}
              userName={contestant.userName}
              votes={contestant.votes}
              hasVoted={contestant.hasVoted}
              isVoting={contestant.isVoting}
              onVote={() => handleVote(contestant.id, contestant.title)}
            />
          ))
        )}
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
  emptyText: {
    fontSize: 16,
    color: '#667085',
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
});

export default AllContestants;
