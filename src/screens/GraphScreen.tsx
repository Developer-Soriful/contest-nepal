import Header from "@/src/components/Header";
import PromotionalBanner from "@/src/components/PromotionalBanner";
import SectionHeader from "@/src/components/SectionHeader";
import { authApi, UserStats } from "@/src/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const GraphScreen = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await authApi.getUserStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.log("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper for max value in chart (for percentage scaling)
  const maxActivityValue = stats?.activity
    ? Math.max(...stats.activity.map(a => a.value), 5)
    : 10;

  const displayStats = [
    {
      label: "Total Points",
      value: stats?.totalPoints.toLocaleString() || "0",
      icon: "star",
      color: "#F59E0B"
    },
    {
      label: "Win Rate",
      value: `${stats?.winRate || 0}%`,
      icon: "trophy",
      color: "#00C853"
    },
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
        {isLoading && !stats ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 }}>
            <ActivityIndicator size="large" color="#A30000" />
            <Text style={{ marginTop: 10, color: "#667085" }}>Loading Analytics...</Text>
          </View>
        ) : (
          <>
            {/* Stats Cards */}
            <View style={[styles.statsRow, { paddingHorizontal: 18 }]}>
              {displayStats.map((stat, index) => (
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

            {/* Main Activity Chart */}
            <View style={[styles.chartCard, { marginHorizontal: 18 }]}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Weekly Activity</Text>
                <View style={styles.periodBadge}>
                  <Text style={styles.periodText}>Last 7 Days</Text>
                </View>
              </View>

              <View style={styles.chartContainer}>
                <View style={styles.yAxis}>
                  <Text style={styles.axisLabel}>{maxActivityValue}</Text>
                  <Text style={styles.axisLabel}>{Math.round(maxActivityValue / 2)}</Text>
                  <Text style={styles.axisLabel}>0</Text>
                </View>
                <View style={styles.barsArea}>
                  {(stats?.activity || []).map((item, index) => (
                    <View key={index} style={styles.barColumn}>
                      <View style={styles.barBackground}>
                        <View
                          style={[
                            styles.barFill,
                            { height: `${(item.value / maxActivityValue) * 100}%` }
                          ]}
                        />
                      </View>
                      <Text style={styles.barLabel}>{item.label}</Text>
                    </View>
                  ))}

                  {/* Empty State Overlay */}
                  {(!stats || stats.activity.every(a => a.value === 0)) && (
                    <View style={styles.chartOverlay}>
                      <Text style={styles.emptyActivityText}>No activity data</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Performance Summary */}
            <View style={[styles.summaryCard, { marginHorizontal: 18 }]}>
              <Text style={styles.summaryTitle}>Performance Summary</Text>
              <Text style={styles.summaryText}>
                You have participated in{" "}
                <Text style={styles.highlight}>{stats?.thisWeekCount || 0} contests</Text> this week. Your
                activity is{" "}
                <Text style={stats?.percentageChange! >= 0 ? styles.positive : { color: '#E43D40', fontWeight: '600' }}>
                  {Math.abs(stats?.percentageChange || 0)}% {stats?.percentageChange! >= 0 ? 'higher' : 'lower'}
                </Text>{" "}
                than last week. Keep it up!
              </Text>

              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Monthly Goal</Text>
                  <Text style={styles.progressValue}>{stats?.monthlyProgress || 0}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${stats?.monthlyProgress || 0}%` }
                    ]}
                  />
                </View>
              </View>
            </View>

            <PromotionalBanner marginTop={25} marginBottom={10} />

            <View style={{ marginTop: 20, paddingHorizontal: 18, paddingBottom: 20 }}>
              <SectionHeader title="Recent Achievements" showArrow={false} />
              {stats?.achievements && stats.achievements.length > 0 ? (
                stats.achievements.map((achievement, idx) => (
                  <View key={idx} style={[styles.summaryCard, { marginTop: 0, marginBottom: 10 }]}>
                    <View
                      style={{ flexDirection: "row", alignItems: "center", gap: 15 }}
                    >
                      <View style={[styles.iconBg, { backgroundColor: achievement.color }]}>
                        <Ionicons name={achievement.icon as any} size={24} color="#990009" />
                      </View>
                      <View>
                        <Text style={{ fontWeight: "700", color: "#1A2E4C" }}>
                          {achievement.title}
                        </Text>
                        <Text style={{ color: "#667085", fontSize: 12 }}>
                          {achievement.description}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={[styles.summaryCard, { alignItems: "center", paddingVertical: 30, borderStyle: 'dashed', borderWidth: 1, borderColor: '#D0D5DD' }]}>
                  <View style={[styles.iconBg, { backgroundColor: "#F2F4F7", marginBottom: 10 }]}>
                    <Ionicons name="lock-closed-outline" size={20} color="#98A2B3" />
                  </View>
                  <Text style={{ fontWeight: "700", color: "#475467" }}>No Achievements Yet</Text>
                  <Text style={{ color: "#667085", fontSize: 12, textAlign: 'center', marginTop: 4 }}>
                    Start winning contests to unlock exclusive badges and rewards!
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
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
  emptyActivityContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  emptyActivityText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475467",
    marginTop: 10,
  },
  emptyActivitySubtext: {
    fontSize: 12,
    color: "#667085",
    marginTop: 4,
    textAlign: "center",
  },
  chartOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    zIndex: 10,
  },
});

export default GraphScreen;
