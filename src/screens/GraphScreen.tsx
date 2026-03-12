import Header from "@/src/components/Header";
import PromotionalBanner from "@/src/components/PromotionalBanner";
import SectionHeader from "@/src/components/SectionHeader";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const GraphScreen = () => {
  // Mock data for the chart
  const chartData = [
    { label: "Mon", value: 45 },
    { label: "Tue", value: 70 },
    { label: "Wed", value: 40 },
    { label: "Thu", value: 90 },
    { label: "Fri", value: 60 },
    { label: "Sat", value: 85 },
    { label: "Sun", value: 55 },
  ];

  const stats = [
    { label: "Total Points", value: "1,250", icon: "star", color: "#F59E0B" },
    { label: "Win Rate", value: "75%", icon: "trophy", color: "#00C853" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Analytics"
        backgroundColor="#EFF1F3"
        showLeftIcon={false}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Cards */}
        <View style={[styles.statsRow, { paddingHorizontal: 18 }]}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View
                style={[styles.iconBg, { backgroundColor: stat.color + "20" }]}
              >
                <Ionicons
                  name={stat.icon as any}
                  size={20}
                  color={stat.color}
                />
              </View>
              <View>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Main Chart Card */}
        <View style={[styles.chartCard, { marginHorizontal: 18 }]}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Weekly Activity</Text>
            <View style={styles.periodBadge}>
              <Text style={styles.periodText}>Last 7 Days</Text>
            </View>
          </View>

          <View style={styles.chartContainer}>
            <View style={styles.yAxis}>
              <Text style={styles.axisLabel}>100</Text>
              <Text style={styles.axisLabel}>50</Text>
              <Text style={styles.axisLabel}>0</Text>
            </View>
            <View style={styles.barsArea}>
              {chartData.map((item, index) => (
                <View key={index} style={styles.barColumn}>
                  <View style={styles.barBackground}>
                    <View
                      style={[styles.barFill, { height: `${item.value}%` }]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Performance Summary */}
        <View style={[styles.summaryCard, { marginHorizontal: 18 }]}>
          <Text style={styles.summaryTitle}>Performance Summary</Text>
          <Text style={styles.summaryText}>
            You have participated in{" "}
            <Text style={styles.highlight}>12 contests</Text> this week. Your
            activity is <Text style={styles.positive}>15% higher</Text> than
            last week. Keep it up!
          </Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Monthly Goal</Text>
              <Text style={styles.progressValue}>80%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: "80%" }]} />
            </View>
          </View>
        </View>

        <PromotionalBanner marginTop={25} marginBottom={10} />

        <View style={{ marginTop: 20, paddingHorizontal: 18 }}>
          <SectionHeader title="Recent Achievements" showArrow={false} />
          <View style={[styles.summaryCard, { marginTop: 0 }]}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 15 }}
            >
              <View style={[styles.iconBg, { backgroundColor: "#FDF2F2" }]}>
                <Ionicons name="medal-outline" size={24} color="#990009" />
              </View>
              <View>
                <Text style={{ fontWeight: "700", color: "#1A2E4C" }}>
                  Early Bird
                </Text>
                <Text style={{ color: "#667085", fontSize: 12 }}>
                  Joined 5 contests in first hour
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ebf3f4",
    paddingBottom: 30,
  },
  scrollContent: {
    paddingBottom: 60,
    paddingTop: 10,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#FFF",
    width: "48%",
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#667085",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A2E4C",
  },
  chartCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A2E4C",
  },
  periodBadge: {
    backgroundColor: "#F2F4F7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  periodText: {
    fontSize: 12,
    color: "#667085",
    fontWeight: "500",
  },
  chartContainer: {
    flexDirection: "row",
    height: 200,
  },
  yAxis: {
    justifyContent: "space-between",
    paddingRight: 10,
    paddingBottom: 25,
  },
  axisLabel: {
    fontSize: 10,
    color: "#98A2B3",
    textAlign: "right",
  },
  barsArea: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
  },
  barColumn: {
    alignItems: "center",
    width: 30,
    height: "100%",
    justifyContent: "flex-end",
  },
  barBackground: {
    width: 14,
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 7,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    backgroundColor: "#A30000",
    borderRadius: 7,
  },
  barLabel: {
    fontSize: 10,
    color: "#98A2B3",
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A2E4C",
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: "#475467",
    lineHeight: 22,
    marginBottom: 20,
  },
  highlight: {
    fontWeight: "700",
    color: "#1A2E4C",
  },
  positive: {
    color: "#00C853",
    fontWeight: "600",
  },
  progressContainer: {
    marginTop: 5,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: "#667085",
    fontWeight: "500",
  },
  progressValue: {
    fontSize: 13,
    color: "#A30000",
    fontWeight: "700",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#F2F4F7",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#A30000",
  },
});

export default GraphScreen;
