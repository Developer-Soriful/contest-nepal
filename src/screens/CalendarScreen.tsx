import Header from "@/src/components/Header";
import PromotionalBanner from "@/src/components/PromotionalBanner";
import SectionHeader from "@/src/components/SectionHeader";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";

const CalendarScreen = () => {
  const [selected, setSelected] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Mock events
  const events = [
    {
      id: 1,
      title: "Photography Contest",
      time: "10:00 AM",
      category: "Photography",
      color: "#FF7BA9",
    },
    {
      id: 2,
      title: "Gaming Setup Giveaway",
      time: "02:00 PM",
      category: "Gaming",
      color: "#918EF4",
    },
    {
      id: 3,
      title: "UI/UX Design Challenge",
      time: "05:00 PM",
      category: "Design",
      color: "#00C853",
    },
    {
      id: 4,
      title: "Wildlife Photo Contest",
      time: "09:00 AM",
      category: "Photography",
      color: "#FFD700",
    },
    {
      id: 5,
      title: "App Innovation Awards",
      time: "11:30 AM",
      category: "Dev",
      color: "#4A90E2",
    },
    {
      id: 6,
      title: "Retro Gaming Night",
      time: "08:00 PM",
      category: "Gaming",
      color: "#990009",
    },
  ];

  // Marked dates for the calendar
  const markedDates = {
    [selected]: {
      selected: true,
      disableTouchEvent: true,
      selectedColor: "#A30000",
      selectedTextColor: "#FFFFFF",
    },
    "2026-03-05": { marked: true, dotColor: "#FF7BA9" },
    "2026-03-12": { marked: true, dotColor: "#918EF4" },
    "2026-03-18": { marked: true, dotColor: "#00C853" },
    "2026-03-26": { marked: true, dotColor: "#A30000" },
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Calendar" backgroundColor="#EFF1F3" showLeftIcon={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.calendarWrapper}>
          <Calendar
            onDayPress={(day: any) => {
              setSelected(day.dateString);
            }}
            markedDates={markedDates}
            theme={{
              backgroundColor: "#ffffff",
              calendarBackground: "#ffffff",
              textSectionTitleColor: "#98A2B3",
              selectedDayBackgroundColor: "#A30000",
              selectedDayTextColor: "#ffffff",
              todayTextColor: "#A30000",
              dayTextColor: "#344054",
              textDisabledColor: "#d9e1e8",
              dotColor: "#A30000",
              selectedDotColor: "#ffffff",
              arrowColor: "#333",
              disabledArrowColor: "#d9e1e8",
              monthTextColor: "#1A2E4C",
              indicatorColor: "#A30000",
              textDayFontFamily: "System",
              textMonthFontFamily: "System",
              textDayHeaderFontFamily: "System",
              textDayFontWeight: "500",
              textMonthFontWeight: "bold",
              textDayHeaderFontWeight: "600",
              textDayFontSize: 14,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 13,
            }}
            style={styles.calendar}
          />
        </View>

        {/* Upcoming Events Section */}
        <View style={styles.eventsSection}>
          <View style={{ paddingHorizontal: 18 }}>
            <SectionHeader title="Upcoming Events" showArrow={false} />

            {events.map((event) => (
              <TouchableOpacity key={event.id} style={styles.eventCard}>
                <View
                  style={[
                    styles.eventIndicator,
                    { backgroundColor: event.color },
                  ]}
                />
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.eventMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color="#666" />
                      <Text style={styles.metaText}>{event.time}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons
                        name="pricetag-outline"
                        size={14}
                        color="#666"
                      />
                      <Text style={styles.metaText}>{event.category}</Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#CCC" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <PromotionalBanner />
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
  calendarWrapper: {
    marginHorizontal: 18,
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginBottom: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    overflow: "hidden",
  },
  calendar: {
    borderRadius: 20,
  },
  eventsSection: {
    marginTop: 5,
  },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  eventIndicator: {
    width: 4,
    height: "100%",
    borderRadius: 2,
    marginRight: 15,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1D2939",
    marginBottom: 6,
  },
  eventMeta: {
    flexDirection: "row",
    gap: 15,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#667085",
  },
});

export default CalendarScreen;
