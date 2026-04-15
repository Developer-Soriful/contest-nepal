import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import CustomGradientButton from "../components/CustomGradientButton";
import Header from "../components/Header";
import OrganizerInfo from "../components/OrganizerInfo";
import PollComponent from "../components/PollComponent";
import ReportModal from "../components/ReportModal";
import { authApi } from "../services/api";

const { width } = Dimensions.get("window");

// --- Theme Constants (Maintainable & Dynamic) ---
const COLORS = {
  primary: "#990000",
  primaryGradient: ["#990000", "#D40000"] as const,
  textDark: "#1F2937",
  textSecondary: "#6B7280",
  bgLight: "#F9FAFB",
  cardBg: "#f5f4fe",
  white: "#FFFFFF",
  success: "#10B981",
};

// Date formatter utility
const formatDate = (dateString: string): string => {
  if (!dateString) return 'No date';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  } catch {
    return dateString;
  }
};

// Calculate time remaining
const getTimeRemaining = (endDateString: string) => {
  if (!endDateString) return { days: 0, hours: 0, minutes: 0 };
  
  try {
    const endDate = new Date(endDateString);
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes };
  } catch {
    return { days: 0, hours: 0, minutes: 0 };
  }
};

const SectionTitle = ({ children }: { children: string }) => (
  <Text
    style={{
      fontSize: 16,
      fontWeight: "700",
      color: "#4B5563",
      marginBottom: 8,
    }}
  >
    {children}
  </Text>
);

const RuleItem = ({ text }: { text: string }) => (
  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
    <Ionicons
      name="checkmark-circle-outline"
      size={22}
      color={COLORS.success}
    />
    <Text style={{ marginLeft: 8, color: COLORS.textSecondary, fontSize: 14 }}>
      {text}
    </Text>
  </View>
);

// --- Main Screen ---

interface ContestDetails {
  id: string;
  title: string;
  description: string;
  rules: string;
  reward: string;
  coverImageUrl: string;
  startDate: string;
  endDate: string;
  status: string;
  category: string;
  participantCount: number;
  submissionCount: number;
  isActive: boolean;
}

export default function ContestDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { contestId, type } = useLocalSearchParams<{ contestId: string; type: string }>();
  const [contest, setContest] = useState<ContestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const contestType = type || "standard";

  useEffect(() => {
    if (!contestId) {
      setError('No contest ID provided');
      setLoading(false);
      return;
    }

    fetchContestDetails();
  }, [contestId]);

  const fetchContestDetails = async () => {
    try {
      setLoading(true);
      console.log('[ContestDetail] Fetching contest:', contestId);
      
      const response = await authApi.getContestById(contestId as string);
      
      if (response.success && response.data) {
        console.log('[ContestDetail] Contest loaded:', response.data.title);
        setContest(response.data);
      } else {
        console.log('[ContestDetail] Failed to load:', response.error);
        setError(response.error?.title || 'Failed to load contest');
      }
    } catch (err) {
      console.log('[ContestDetail] Error:', err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareTitle = contest?.title || 'Contest';
      await Share.share({
        message: `Check out this contest on Contest Hub: ${shareTitle}! Join now and win exciting prizes.`,
        title: shareTitle,
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  };

  const handleParticipate = () => {
    if (contest?.id) {
      router.push(`/entry-form?contestId=${contest.id}`);
    }
  };
  
  const handleStartEntry = () => {
    if (contest?.id) {
      router.replace(`/entry-form?contestId=${contest.id}`);
    } else {
      console.error('[ContestDetail] No contest ID available');
    }
  };
  
  const handleViewEntries = () => {
    router.push("/all-contestants");
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 16, color: COLORS.textSecondary }}>Loading contest...</Text>
      </SafeAreaView>
    );
  }

  if (error || !contest) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: COLORS.textSecondary, fontSize: 16 }}>
          {error || 'Contest not found'}
        </Text>
        <TouchableOpacity onPress={fetchContestDetails} style={{ marginTop: 16 }}>
          <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const timeRemaining = getTimeRemaining(contest.endDate);
  const hasTimeRemaining = timeRemaining.days > 0 || timeRemaining.hours > 0 || timeRemaining.minutes > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <Header
        title="Contest Details"
        backgroundColor="transparent"
        rightElement={
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={handleShare}
              activeOpacity={0.7}
              style={{
                padding: 8,
                backgroundColor: "#FFF",
                borderRadius: 100,
                borderWidth: 0.6,
                borderColor: COLORS.primary,
              }}
            >
              <Ionicons
                name="share-social-outline"
                size={18}
                color={COLORS.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsReportModalVisible(true)}
              activeOpacity={0.7}
              style={{
                padding: 8,
                backgroundColor: "#FFF",
                borderRadius: 100,
                borderWidth: 0.6,
                borderColor: COLORS.primary,
              }}
            >
              <Ionicons name="flag-outline" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Banner Image */}
        <View style={{ padding: 16 }}>
          <Image
            source={
              contest.coverImageUrl && contest.coverImageUrl.trim() !== ''
                ? { uri: contest.coverImageUrl }
                : { uri: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop" }
            }
            style={{ width: "100%", height: 200, borderRadius: 16 }}
            resizeMode="cover"
          />
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          {/* Organizer info */}
          <OrganizerInfo
            name="Creative Labs"
            avatar={{ uri: "https://i.pravatar.cc/150?u=organizer" }}
            onPress={() => router.push("/organizer-profile")}
          />
          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: "#111827",
              marginBottom: 12,
            }}
          >
            {contest.title}
          </Text>

          <SectionTitle>About this Contest</SectionTitle>
          <Text
            style={{
              color: COLORS.textSecondary,
              lineHeight: 20,
              marginBottom: 20,
            }}
          >
            {contest.description || 'No description available'}
          </Text>

          {contest.rules && (
            <>
              <SectionTitle>Rules & Requirement</SectionTitle>
              {contest.rules.split('\n').map((rule, index) => (
                rule.trim() && <RuleItem key={index} text={rule.trim()} />
              ))}
            </>
          )}

          {/* How to Participate Card */}
          <View
            style={{
              backgroundColor: COLORS.cardBg,
              borderRadius: 16,
              padding: 16,
              marginTop: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Ionicons
                name="alert-circle-outline"
                size={24}
                color={COLORS.primary}
              />
              <Text
                style={{
                  marginLeft: 8,
                  fontWeight: "700",
                  color: COLORS.textDark,
                }}
              >
                How to participate
              </Text>
            </View>
            <Text
              style={{
                color: COLORS.textSecondary,
                fontSize: 13,
                marginBottom: 4, // Reduced margin
              }}
            >
              Complete the tasks listed in the entry form to earn your chance to
              win. The more tasks you complete, the higher your chances!
            </Text>
          </View>

          {/* Grand Prize Card */}
          <View
            style={{
              backgroundColor: COLORS.cardBg,
              borderRadius: 16,
              padding: 16,
              marginTop: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                padding: 8,
                borderRadius: 8,
                marginRight: 12,
              }}
            >
              <Ionicons name="trophy-outline" size={24} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>
                Grand Prize
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: COLORS.textDark,
                }}
                numberOfLines={2}
              >
                {contest.reward || 'Exciting Prize'}
              </Text>
              <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
                Ends: {formatDate(contest.endDate)}
              </Text>
            </View>
          </View>

          {/* Contest Stats */}
          <View
            style={{
              backgroundColor: COLORS.cardBg,
              borderRadius: 16,
              padding: 16,
              marginTop: 16,
              marginBottom: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  padding: 6,
                  borderRadius: 6,
                  marginRight: 10,
                }}
              >
                <Ionicons name="stats-chart" size={18} color={COLORS.primary} />
              </View>
              <Text style={{ fontWeight: "700", color: COLORS.textDark }}>
                Contest Stats
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name="people-outline"
                  size={20}
                  color={COLORS.textSecondary}
                />
                <Text style={{ marginLeft: 8, color: COLORS.textSecondary }}>
                  Participants
                </Text>
              </View>
              <Text style={{ fontWeight: "600" }}>
                {contest.participantCount} Person
              </Text>
            </View>

            {hasTimeRemaining && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color={COLORS.textSecondary}
                  />
                  <Text style={{ marginLeft: 8, color: COLORS.textSecondary }}>
                    Time left
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {[timeRemaining.days.toString().padStart(2, '0'), timeRemaining.hours.toString().padStart(2, '0'), timeRemaining.minutes.toString().padStart(2, '0')].map((time, i) => (
                    <React.Fragment key={i}>
                      <View
                        style={{
                          backgroundColor: "#fff",
                          padding: 4,
                          borderRadius: 4,
                          minWidth: 30,
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{ color: COLORS.primary, fontWeight: "700" }}
                        >
                          {time}
                        </Text>
                      </View>
                      {i < 2 && (
                        <Text
                          style={{ marginHorizontal: 4, color: COLORS.primary }}
                        >
                          :
                        </Text>
                      )}
                    </React.Fragment>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Poll block (if contest is a poll) */}
      {contestType === "poll" && (
        <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
          <PollComponent
            question="Which theme should be featured in next week's contest?"
            options={[
              { id: "o1", text: "Urban Night", votes: 24 },
              { id: "o2", text: "Nature Close-up", votes: 42 },
              { id: "o3", text: "Abstract Colors", votes: 16 },
            ]}
          />
        </View>
      )}

      {/* Sticky Bottom Buttons */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          padding: 16,
          paddingBottom: Math.max(insets.bottom, 16),
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#f0f0f0",
          flexDirection: "row",
          gap: 12,
        }}
      >
        <CustomGradientButton
          containerStyle={{ flex: 1, borderRadius: 10 }}
          borderRadius={10}
          title="Participate Now"
          onPress={handleStartEntry}
        />
        <CustomGradientButton
          containerStyle={{ flex: 1, borderRadius: 10 }}
          borderRadius={10}
          title="View Entries"
          backgroundColor="#FFEDCE"
          outerBorderColor="#111827"
          textStyle={{
            color: "#111827",
          }}
          onPress={handleViewEntries}
        />
      </View>
      {/* Report Modal */}
      <ReportModal
        isVisible={isReportModalVisible}
        onClose={() => setIsReportModalVisible(false)}
        targetName={contest.title}
      />
    </SafeAreaView>
  );
}
