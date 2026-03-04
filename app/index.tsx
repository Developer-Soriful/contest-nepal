import { import_img } from "@/assets/import_img";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const handleGetStarted = () => {
    router.navigate("/login")
  }
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#fff5f9",
      }}
    >
      {/* app logos */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, padding: 20, zIndex: 10 }}>
        <Image source={import_img.icon} style={{ width: 100, height: 100 }} />
      </View>
      {/* middle image */}
      <View
        style={{
          position: "absolute",
          top: 100,
          left: 0,
          right: 0,
          height: 350,
          alignItems: "center",
          justifyContent: "center",
          zIndex: 5,
        }}
      >
        <View
          style={{
            zIndex: 5,
            width: 160,
            justifyContent: "flex-start",
            alignItems: "flex-start",
            gap: 10,
            top: -50
          }}
        >
          <Text style={{
            fontSize: 34,
            fontWeight: 600,
            color: "white"
          }}>Smart
            Play Wins</Text>
          <Text style={{
            fontSize: 14,
            fontWeight: 500,
            color: "white"
          }}>
            Learn fast, think smart.
            win every challenge.
          </Text>
        </View>
        <Image
          source={import_img.bottom_squre}
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            transform: [{ rotate: "-15deg" }],
          }}
          resizeMode="contain"
        />
        <Image
          source={import_img.middle_squre}
          style={{
            position: "absolute",
            width: 250,
            height: 250,
            zIndex: 2,
          }}
          resizeMode="contain"
        />
        <Image
          source={import_img.top_win}
          style={{
            position: "absolute",
            width: 150,
            height: 190,
            zIndex: 3,
            top: -20,
            right: 20,
          }}
          resizeMode="contain"
        />
      </View>
      {/* text and button */}
      <View
        style={{
          position: "absolute",
          top: 0,
          bottom: "-65%",
          left: 0,
          right: 0,
          padding: 20,
          zIndex: 10,
          flexDirection: "column",
          gap: 16,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Text style={{ fontSize: 32, fontWeight: "bold", textAlign: "center", lineHeight: 45, letterSpacing: -0.5 }}>Participate Smart Contest Every Day</Text>
        <Text style={{ fontSize: 18, color: "#323232", textAlign: "center", lineHeight: 26 }}>
          Boost knowledge daily, win challenges,
          become smarter every day.
        </Text>
        <View style={{ marginTop: 10, width: "100%", borderColor: "#990109", borderWidth: 1, borderRadius: 50 }}>
          <TouchableOpacity onPress={handleGetStarted} style={{ backgroundColor: "#990109", width: "100%", paddingVertical: 15, paddingHorizontal: 30, borderRadius: 50, borderColor: "white", borderWidth: 1 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold", textAlign: "center" }}>
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* bottom image */}
      <Image
        source={import_img.getstarted}
        style={{
          width: "100%",
          height: "45%",
          position: "absolute",
          bottom: 0,
        }}
        resizeMode="contain"
      />
    </SafeAreaView>
  );
}
