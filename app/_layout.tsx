import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

// Prevent the expo native splash screen from auto-hiding.
SplashScreen.preventAutoHideAsync();

function CustomSplash() {
  return (
    <View style={styles.container}>
      {/* Bottom shadow — behind the logo */}
      <View style={styles.shadowBottom} pointerEvents="none">
        <Image
          source={require("../assets/images/shadow_bottom.png")}
          style={{ width: "100%", height: "100%" }}
          resizeMode="stretch"
        />
      </View>

      {/* The main splash icon */}
      <Image
        source={require("../assets/images/splash-icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Top shadow — on top of everything */}
      <View style={styles.shadowTop} pointerEvents="none">
        <Image
          source={require("../assets/images/shadow_top.png")}
          style={{ width: "100%", height: "100%" }}
          resizeMode="stretch"
        />
      </View>
    </View>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Hide the native splash so our custom one takes over
        await SplashScreen.hideAsync();
        // Keep the custom splash visible for a smooth experience
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return <CustomSplash />;
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
        <View pointerEvents="none" style={styles.globalTopShadow}>
          <Image
            source={require("../assets/images/global_shadow.png")}
            style={{ width: "100%", height: "100%" }}
            resizeMode="stretch"
          />
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 250,
    height: 250,
  },
  shadowTop: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    height: height * 0.45,
  },
  shadowBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: width,
    height: height * 0.45,
  },
  globalTopShadow: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    height: 150,
    zIndex: 999,
  },
});
