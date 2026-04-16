import { authApi, CalendarEvent } from "@/src/services/api";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import PromotionalBanner from "../components/PromotionalBanner";
import SectionHeader from "../components/SectionHeader";

const CalendarScreen = () => {
  const [selected, setSelected] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [apiEvents, setApiEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-refresh data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('[CalendarScreen] Screen focused - refreshing events');
      loadEvents();
    }, [])
  );

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const response = await authApi.getCalendarEvents();
      if (response.success && response.data) {
        setApiEvents(response.data);
      }
    } catch (error) {
      console.log('Error loading calendar events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventPress = (event: CalendarEvent) => {
    if (!event._id) {
      console.warn('[CalendarScreen] Event ID missing, cannot navigate');
      return;
    }
    router.push({
      pathname: "/contest-detail",
      params: { contestId: event._id }
    });
  };

  // Helper to get category color
  const getCategoryColor = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'POLL': return "#918EF4";
      case 'GIVEAWAY': return "#FF7BA9";
      case 'SUBMISSION_VOTING': return "#00C853";
      default: return "#4A90E2";
    }
  };

  // Generate marked dates for the calendar dots
  const getMarkedDates = () => {
    const marks: any = {
      [selected]: {
        selected: true,
        selectedColor: "#A30000",
        selectedTextColor: "#FFFFFF",
      },
    };

    apiEvents.forEach(event => {
      if (event.startsAt) {
        const startDay = event.startsAt.split('T')[0];
        if (!marks[startDay]) {
          marks[startDay] = { marked: true, dotColor: "#918EF4" };
        } else {
          marks[startDay] = { ...marks[startDay], marked: true };
        }
      }

      if (event.endsAt) {
        const endDay = event.endsAt.split('T')[0];
        if (!marks[endDay]) {
          marks[endDay] = { marked: true, dotColor: "#A30000" };
        } else {
          marks[endDay] = { ...marks[endDay], marked: true };
        }
      }
    });

    return marks;
  };

  // Filter events for the selected date
  const selectedDayEvents = apiEvents.filter(event => {
    const startDay = event.startsAt?.split('T')[0];
    const endDay = event.endsAt?.split('T')[0];
    return selected === startDay || selected === endDay;
  });

  // Get truly upcoming events (starting from today onwards, sorted by date)
  const allUpcomingEvents = [...apiEvents]
    .filter(event => {
      if (!event.startsAt) return false;
      const today = new Date().toISOString().split('T')[0];
      const startDay = event.startsAt.split('T')[0];
      const endDay = event.endsAt?.split('T')[0];
      return startDay >= today || (endDay && endDay >= today);
    })
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, 5);

  const eventsToDisplay = selectedDayEvents.length > 0 ? selectedDayEvents : allUpcomingEvents;
  const isShowingUpcoming = selectedDayEvents.length === 0;

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
            markedDates={getMarkedDates()}
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

        {/* Dynamic Events Section */}
        <View style={styles.eventsSection}>
          <View style={{ paddingHorizontal: 18 }}>
            <SectionHeader
              title={!isShowingUpcoming ? `Events on ${selected}` : "Upcoming Events"}
              showArrow={false}
            />

            {isLoading ? (
              <ActivityIndicator size="large" color="#990009" style={{ marginTop: 20 }} />
            ) : eventsToDisplay.length > 0 ? (
              eventsToDisplay.map((event, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.eventCard}
                  onPress={() => handleEventPress(event)}
                >
                  <View
                    style={[
                      styles.eventIndicator,
                      { backgroundColor: getCategoryColor(event.type) },
                    ]}
                  />
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <View style={styles.eventMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={14} color="#666" />
                        <Text style={styles.metaText}>
                          {isShowingUpcoming
                            ? `Starts: ${event.startsAt?.split('T')[0]}`
                            : (selected === event.startsAt?.split('T')[0] ? "Starts Today" : "Ends Today")
                          }
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="pricetag-outline"
                          size={14}
                          color="#666"
                        />
                        <Text style={styles.metaText}>{event.type}</Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#CCC" />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noEventsContainer}>
                <Ionicons name="calendar-outline" size={48} color="#CCC" />
                <Text style={styles.noEventsText}>No upcoming events found</Text>
              </View>
            )}
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
  noEventsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F2F4F7',
    borderStyle: 'dashed',
    marginTop: 10,
  },
  noEventsText: {
    marginTop: 12,
    fontSize: 14,
    color: '#98A2B3',
    fontWeight: '500',
  },
});

export default CalendarScreen;
