import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ContestantCardProps {
  image: ImageSourcePropType;
  title: string;
  description: string;
  avatar: ImageSourcePropType;
  userName: string;
  votes: number;
  onVote: () => void;
  showWinnerBadge?: boolean;
}

const ContestantCard: React.FC<ContestantCardProps> = ({
  image,
  title,
  description,
  avatar,
  userName,
  votes,
  onVote,
  showWinnerBadge = false,
}) => {
  const [hasVoted, setHasVoted] = useState(false);

  const handleVoteInternal = () => {
    if (!hasVoted) {
      setHasVoted(true);
      onVote();
    }
  };
  return (
    <View>
      {/* Winner Header */}
      {showWinnerBadge && (
        <View style={styles.winnerHeader}>
          <Text style={styles.trophyIcon}>🏆</Text>
          <Text style={styles.winnerHeaderText}>WINNER</Text>
        </View>
      )}
      <View style={styles.card}>
        {/* Main Image */}
        <View style={styles.imageContainer}>
          <Image source={image} style={styles.mainImage} resizeMode="cover" />
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          {/* User Profile */}
          <View style={styles.profileRow}>
            <Image source={avatar} style={styles.avatar} />
            <Text style={styles.userName}>{userName}</Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.votesText}>
              Total: {votes + (hasVoted ? 1 : 0)} Votes
            </Text>
            <TouchableOpacity
              onPress={handleVoteInternal}
              activeOpacity={0.8}
              style={styles.voteButtonContainer}
              disabled={hasVoted || showWinnerBadge}
            >
              <LinearGradient
                colors={
                  showWinnerBadge
                    ? ["#d6999c", "#d6999c"]
                    : hasVoted
                      ? ["#00B85C", "#00B85C"]
                      : ["#990000", "#D40000"]
                }
                style={[
                  styles.voteButton,
                  hasVoted && styles.votedButton,
                  showWinnerBadge && styles.winnerButton,
                ]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
              >
                <View style={styles.buttonContent}>
                  {hasVoted && (
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={22}
                      color="#FFFFFF"
                      style={styles.checkIcon}
                    />
                  )}
                  <Text style={styles.voteButtonText}>
                    {showWinnerBadge ? "Vote" : hasVoted ? "Voted" : "Vote"}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 12,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  winnerHeader: {
    backgroundColor: "#FFF5D8",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  trophyIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  winnerHeaderText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#EA9800",
    letterSpacing: 1.2,
  },
  imageContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
  mainImage: {
    width: "100%",
    height: 200,
  },
  contentContainer: {
    paddingTop: 16,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    textTransform: "uppercase",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  votesText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  voteButtonContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  voteButton: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    minWidth: 110,
    alignItems: "center",
  },
  votedButton: {
    borderColor: "transparent",
    paddingHorizontal: 20,
  },
  winnerButton: {
    borderColor: "transparent",
    opacity: 0.8,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  checkIcon: {
    marginRight: 8,
  },
  voteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default ContestantCard;
