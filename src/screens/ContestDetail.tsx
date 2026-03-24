import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Dimensions, Image, ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import CustomGradientButton from "../components/CustomGradientButton";
import Header from "../components/Header";
import OrganizerInfo from "../components/OrganizerInfo";
import PollComponent from "../components/PollComponent";

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

export default function ContestDetailsScreen() {
  const insets = useSafeAreaInsets();
  const searchParams = useLocalSearchParams();
  const contestType = (searchParams.type as string) || "standard";
  const handleParticipate = () => console.log("Participate Pressed");
  const handleStartEntry = () => {
    router.replace("/entry-form");
  };
  const handleViewEntries = () => {
    router.push("/all-contestants");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <Header title="Contest Details" backgroundColor="transparent" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Banner Image */}
        <View style={{ padding: 16 }}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
            }}
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
            Weekly Gift Card Drop
          </Text>

          <SectionTitle>About this Contest</SectionTitle>
          <Text
            style={{
              color: COLORS.textSecondary,
              lineHeight: 20,
              marginBottom: 20,
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam.
          </Text>

          <SectionTitle>Rules & Requirement</SectionTitle>
          <RuleItem text="Login daily to enter" />
          <RuleItem text="Complete all profile details" />
          <RuleItem text="Follow our social handles" />

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
            <View>
              <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>
                Grand Prize
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "800",
                  color: COLORS.textDark,
                }}
              >
                $50 Amazon Gift Card
              </Text>
              <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
                Plus recognition on our platform
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
              <Text style={{ fontWeight: "600" }}>120 Person</Text>
            </View>

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
                {["25", "36", "55"].map((time, i) => (
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
          backgroundColor="#111827"
          outerBorderColor="#111827"
          onPress={handleViewEntries}
        />
      </View>
    </SafeAreaView>
  );
}
