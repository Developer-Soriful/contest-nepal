import { import_img } from "@/assets/import_img";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ContestantCard from "../components/ContestantCard";
import CustomGradientButton from "../components/CustomGradientButton";
import Header from "../components/Header";

const Contest_Detail_Screen = () => {
  const searchParams = useLocalSearchParams();
  const submissionStatus = searchParams.status;
  console.log("submissionStatus", submissionStatus);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header backgroundColor="transparent" title="Contest Detail" />
      <ScrollView style={{ flex: 1, backgroundColor: "#FF7BA90A" }}>
        <View style={{ padding: 16 }}>
          {/* Hero Image */}
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=500",
            }}
            style={{
              width: "100%",
              height: 200,
              borderRadius: 16,
              marginBottom: 16,
            }}
          />

          {/* Title and Description */}
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: "#1A2E4C",
              marginBottom: 8,
            }}
          >
            Weekly Gift Card Drop
          </Text>

          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: "#475467",
              marginBottom: 4,
            }}
          >
            About this Contest
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#667085",
              lineHeight: 20,
              marginBottom: 16,
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation.
          </Text>

          {/* Rules Section */}
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: "#475467",
              marginBottom: 8,
            }}
          >
            Rules & Requirment
          </Text>
          {[1, 2, 3].map((_, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: "#E6FFF4",
                  borderWidth: 1,
                  borderColor: "#00C853",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 10,
                }}
              >
                <Text
                  style={{ color: "#00C853", fontSize: 12, fontWeight: "bold" }}
                >
                  ✓
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: "#344054" }}>
                Login daily to enter
              </Text>
            </View>
          ))}

          {/* Grand Prize Card */}
          <View
            style={{
              backgroundColor: "#F9FAFB",
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                backgroundColor: "#FFFFFF",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <Text style={{ fontSize: 24 }}>🏆</Text>
            </View>
            <View>
              <Text style={{ fontSize: 14, color: "#667085" }}>
                Grand Prize
              </Text>
              <Text
                style={{ fontSize: 18, fontWeight: "700", color: "#1A2E4C" }}
              >
                $50 Amazon Gift Card
              </Text>
              <Text style={{ fontSize: 12, color: "#98A2B3" }}>
                Plus recognition on our platform
              </Text>
            </View>
          </View>

          {/* Contest Stats Card */}
          <View
            style={{
              backgroundColor: "#F9FAFB",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 20, marginRight: 8 }}>📊</Text>
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: "#1A2E4C" }}
              >
                Contest Stats
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View>
                <Text style={{ fontSize: 13, color: "#667085" }}>
                  👥 Participants
                </Text>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: "#344054",
                    marginTop: 4,
                  }}
                >
                  120 Person
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: 13, color: "#667085" }}>
                  🕒 Time left
                </Text>
                <View style={{ flexDirection: "row", marginTop: 4 }}>
                  {["25", "36", "55"].map((time, i) => (
                    <React.Fragment key={i}>
                      <View
                        style={{
                          backgroundColor: "#FFF",
                          padding: 4,
                          borderRadius: 4,
                          borderWidth: 1,
                          borderColor: "#EAECF0",
                        }}
                      >
                        <Text
                          style={{
                            color: "#A30000",
                            fontWeight: "700",
                            fontSize: 12,
                          }}
                        >
                          {time}
                        </Text>
                      </View>
                      {i < 2 && (
                        <Text
                          style={{
                            alignSelf: "center",
                            marginHorizontal: 2,
                            color: "#A30000",
                          }}
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

          {/* Winner Declared Banner */}
          {submissionStatus === "Approved" && (
            <View
              style={{
                backgroundColor: "#FEFCE8",
                borderRadius: 12,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
                borderWidth: 1,
                borderColor: "#FCD34D",
                borderLeftWidth: 1,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  backgroundColor: "#F59E0B",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Text style={{ color: "#FFF", fontSize: 20 }}>🏆</Text>
              </View>
              <View>
                <Text
                  style={{ fontSize: 16, fontWeight: "700", color: "#E2AA1B" }}
                >
                  Winner Declared!
                </Text>
                <Text style={{ fontSize: 13, color: "#B45309" }}>
                  Results have been published by the organizer
                </Text>
              </View>
            </View>
          )}

          {submissionStatus === "Approved" && (
            <ContestantCard
              image={import_img.gaming_setup_neon}
              title="Win a Premium Gaming Setup"
              description="Best landscape photography wins! Results are now live."
              avatar={{ uri: "https://i.pravatar.cc/150?u=seam" }}
              userName="SEAM RAHMAN"
              votes={156}
              onVote={() => {}}
              showWinnerBadge={true}
            />
          )}
          {submissionStatus === "Rejected" && (
            <View
              style={{
                backgroundColor: "#f5f4fe",
                borderRadius: 20,
                padding: 16,
                borderWidth: 1,
                borderColor: "rgba(91, 81, 255, 0.20)",
              }}
            >
              <Text
                style={{ fontSize: 14, fontWeight: "500", color: "#990009" }}
              >
                This contest has ended. Winner announcement coming soon!{" "}
              </Text>
            </View>
          )}
          {submissionStatus === "Pending" && (
            <CustomGradientButton
              containerStyle={{ borderRadius: 10 }}
              backgroundColor="#d6999c"
              borderRadius={10}
              title="Joind"
              onPress={() => {}}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Contest_Detail_Screen;
