import { import_img } from "@/assets/import_img";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ContestCard from "../../components/ContestCard";

const HomePage = () => {
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#ebf3f4", marginBottom: 20 }}
    >
      {/* Header Container */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 10,
          marginTop: 10,
        }}
      >
        {/* Profile Section (Left) */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* User Avatar */}
          <Image
            source={{ uri: "https://i.pravatar.cc/150?u=alexa" }}
            style={{
              width: 51,
              height: 51,
              borderRadius: 27,
              borderWidth: 1,
              borderColor: "#fff",
            }}
          />

          {/* Welcome Text */}
          <View style={{ marginLeft: 12 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#1A1C1E",
                letterSpacing: 0.3,
              }}
            >
              Welcome Back
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#666",
                marginTop: 2,
                fontWeight: "500",
              }}
            >
              Alexa Donnal
            </Text>
          </View>
        </View>

        {/* Notification Bell (Right) */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            width: 38,
            height: 38,
            borderRadius: 24,
            backgroundColor: "white",
            justifyContent: "center",
            alignItems: "center",
            borderBottomWidth: 2,
            borderRightWidth: 0.1,
            borderTopWidth: 0.1,
            borderLeftWidth: 0.1,
            borderBottomColor: "#990009",
            borderRightColor: "#990009",
            borderTopColor: "#990009",
            borderLeftColor: "#990009",
            ...Platform.select({
              ios: {
                shadowColor: "#990009",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
              },
              android: {
                elevation: 4,
                shadowColor: "#990009",
              },
            }),
          }}
        >
          <View>
            <Ionicons name="notifications-outline" size={24} color="#990009" />
            <View
              style={{
                position: "absolute",
                top: 2,
                right: 3,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#990009",
                borderWidth: 1.5,
                borderColor: "#FFF",
              }}
            />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Promotional Banner */}
        <View style={{ marginTop: 20, paddingHorizontal: 18, position: "relative" }}>
          <View style={{
            position: "absolute",
            top: 24,
            left: 41,
            zIndex: 2,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            height: "70%",
            gap: 8

          }}>
            <Text style={{
              maxWidth: 123,
              fontSize: 20,
              fontWeight: 700
            }}>The
              Gaming
              <Text style={{ color: "#990009" }}> Contest</Text> Hub</Text>
            <View style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: "#000000",
              padding: 8,
              borderRadius: 30,
              paddingHorizontal: 12,
              paddingVertical: 8
            }}>
              <View>
                <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 12 }}>Join Now</Text>
              </View>
              <View>
                <MaterialCommunityIcons name="play-pause" size={18} color="white" />
              </View>
            </View>
          </View>
          <Image
            source={import_img.game_win}
            style={{ width: "100%", height: 185, borderRadius: 35, position: "absolute", top: 0, right: 0, zIndex: 1, maxHeight: 227, maxWidth: 227 }}
          />
          <Image
            source={import_img.geming}
            style={{ width: "100%", height: 185, borderRadius: 35 }}
          />
        </View>
        {/* Your Activity Section */}
        <View style={{ paddingHorizontal: 18, marginTop: 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#1A1C1E" }}>
              Your Activity
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#dde8ea",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: "#666",
                  fontWeight: "600",
                  marginRight: 4,
                }}
              >
                View all
              </Text>
              <Ionicons
                name="arrow-forward-circle-outline"
                size={14}
                color="#990009"
              />
            </TouchableOpacity>
          </View>
          <ContestCard
            title="Win a Premium Gaming Setup"
            reward="$2,500 Gaming PC + Accessories"
            date="Feb 15, 2025"
            joined="1,145"
          />
        </View>
        {/* Promotional Banner */}
        <View style={{ marginTop: 20, paddingHorizontal: 18, position: "relative" }}>
          <View style={{
            position: "absolute",
            top: 24,
            left: 41,
            zIndex: 2,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            height: "70%",
            gap: 8

          }}>
            <Text style={{
              maxWidth: 123,
              fontSize: 20,
              fontWeight: 700
            }}>The
              Gaming
              <Text style={{ color: "#990009" }}> Contest</Text> Hub</Text>
            <View style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: "#000000",
              padding: 8,
              borderRadius: 30,
              paddingHorizontal: 12,
              paddingVertical: 8
            }}>
              <View>
                <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 12 }}>Join Now</Text>
              </View>
              <View>
                <MaterialCommunityIcons name="play-pause" size={18} color="white" />
              </View>
            </View>
          </View>
          <Image
            source={import_img.game_win}
            style={{ width: "100%", height: 185, borderRadius: 35, position: "absolute", top: 0, right: 0, zIndex: 1, maxHeight: 227, maxWidth: 227 }}
          />
          <Image
            source={import_img.geming}
            style={{ width: "100%", height: 185, borderRadius: 35 }}
          />
        </View>
        {/* Featured Contest Section */}
        <View style={{ paddingHorizontal: 18, marginTop: 10 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#1A1C1E" }}>
              Featured Contest
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#dde8ea",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: "#666",
                  fontWeight: "600",
                  marginRight: 4,
                }}
              >
                View all
              </Text>
              <Ionicons name="grid-outline" size={14} color="#990009" />
            </TouchableOpacity>
          </View>
          <ContestCard
            title="Win a Premium Gaming Setup"
            reward="$2,500 Gaming PC + Accessories"
            date="Feb 15, 2025"
            joined="1,145"
          />
        </View>

        {/* Contest nearby Section */}
        <View style={{ paddingHorizontal: 18, marginTop: 10 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#1A1C1E" }}>
              Contest nearby
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#dde8ea",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: "#666",
                  fontWeight: "600",
                  marginRight: 4,
                }}
              >
                View all
              </Text>
              <Ionicons name="grid-outline" size={14} color="#990009" />
            </TouchableOpacity>
          </View>
          <ContestCard
            title="Win a Premium Gaming Setup"
            reward="$2,500 Gaming PC + Accessories"
            date="Feb 15, 2025"
            joined="1,145"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomePage;
