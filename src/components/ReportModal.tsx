import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { authApi, type ReportReason } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import CustomGradientButton from "./CustomGradientButton";

type ReportableTargetType = 'CONTEST' | 'USER' | 'SUBMISSION' | 'VOTE';

interface ReportModalProps {
  isVisible: boolean;
  onClose: () => void;
  targetName?: string;
  targetType: ReportableTargetType | 'Other';
  targetId: string;
}

// Map display labels to backend accepted values
const REPORT_REASONS = [
  { label: "Inappropriate Content", value: "inappropriate" },
  { label: "Spam or Misleading", value: "spam" },
  { label: "Scam or Fraud", value: "fraud" },
  { label: "Intellectual Property Violation", value: "copyright" },
  { label: "Other", value: "other" },
] as const satisfies ReadonlyArray<{ label: string; value: ReportReason }>;

const ReportModal: React.FC<ReportModalProps> = ({
  isVisible,
  onClose,
  targetName,
  targetType,
  targetId,
}) => {
  const { isAuthenticated } = useAuth();
  const [selectedReason, setSelectedReason] = useState<(typeof REPORT_REASONS)[number] | null>(null);
  const [additionalContext, setAdditionalContext] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    const { accessToken } = await authApi.getTokens();

    if (!isAuthenticated || !accessToken) {
      Alert.alert(
        'Login Required',
        'Please log in to submit a report.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Log In',
            onPress: () => {
              handleClose();
              router.push('/login');
            },
          },
        ]
      );
      return;
    }

    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason for reporting');
      return;
    }

    const trimmedContext = additionalContext.trim();

    if (targetType === 'Other' && trimmedContext.length < 10) {
      Alert.alert('Error', 'Please provide a bit more detail so our team can review your feedback.');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('[ReportModal] Submitting report:', { targetType, targetId, reason: selectedReason.value, description: trimmedContext });

      const response = targetType === 'Other'
        ? await authApi.createSupportTicket({
            subject: `App Feedback: ${selectedReason.label}`,
            message: trimmedContext,
            priority: 'low',
          })
        : await authApi.createReport({
            targetType,
            targetId,
            reason: selectedReason.value,
            description: trimmedContext || undefined,
          });

      console.log('[ReportModal] Report response:', response);

      if (response.success) {
        setIsSuccess(true);
        // Auto close after 2 seconds
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        Alert.alert('Error', response.error?.title || 'Failed to submit report. Please try again.');
      }
    } catch (error) {
      console.log('[ReportModal] Error submitting report:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset state after modal is hidden
    setTimeout(() => {
      setSelectedReason(null);
      setAdditionalContext("");
      setIsSuccess(false);
    }, 300);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onDismiss={() => {
        setSelectedReason(null);
        setAdditionalContext("");
        setIsSuccess(false);
      }}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={handleClose}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalContainer}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>
                  {isSuccess ? "Success" : "Report Issue"}
                </Text>
                <TouchableOpacity onPress={handleClose} disabled={isSubmitting}>
                  <Ionicons name="close" size={24} color="#667085" />
                </TouchableOpacity>
              </View>

              {!isSuccess ? (
                <>
                  {targetName && (
                    <Text style={styles.subtitle}>
                      Reporting:{" "}
                      <Text style={{ fontWeight: "700" }}>{targetName}</Text>
                    </Text>
                  )}

                  <Text style={styles.sectionLabel}>Select a reason:</Text>
                  <View style={styles.reasonsList}>
                    {REPORT_REASONS.map((reason) => {
                      const isSelected = selectedReason === reason;
                      return (
                        <TouchableOpacity
                          key={reason.value}
                          style={styles.reasonItem}
                          onPress={() => setSelectedReason(reason)}
                          activeOpacity={0.7}
                          disabled={isSubmitting}
                        >
                          <Ionicons
                            name={
                              isSelected
                                ? "radio-button-on"
                                : "radio-button-off"
                            }
                            size={20}
                            color={isSelected ? "#990000" : "#D0D5DD"}
                          />
                          <Text
                            style={[
                              styles.reasonText,
                              isSelected && styles.selectedReasonText,
                            ]}
                          >
                            {reason.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text style={styles.sectionLabel}>
                    Additional details (optional):
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Provide more context here..."
                    placeholderTextColor="#98A2B3"
                    multiline
                    numberOfLines={4}
                    value={additionalContext}
                    onChangeText={setAdditionalContext}
                    editable={!isSubmitting}
                  />

                  <View style={styles.footer}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={handleClose}
                      disabled={isSubmitting}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>

                    <View style={{ flex: 1, position: "relative" }}>
                      <CustomGradientButton
                        title={isSubmitting ? "" : "Submit Report"}
                        onPress={handleSubmit}
                        disabled={!selectedReason || isSubmitting}
                        containerStyle={{
                          borderRadius: 12,
                          opacity: selectedReason ? 1 : 0.5,
                          backgroundColor: selectedReason
                            ? "transparent"
                            : "#F2F4F7",
                          borderWidth: 0,
                        }}
                        style={{ paddingVertical: 12 }}
                        textStyle={{ fontSize: 14 }}
                      />
                      {isSubmitting && (
                        <ActivityIndicator
                          style={styles.loader}
                          color="#FFF"
                          size="small"
                        />
                      )}
                    </View>
                  </View>
                </>
              ) : (
                <View style={styles.successContainer}>
                  <View style={styles.successIconCircle}>
                    <Ionicons name="checkmark" size={40} color="#FFF" />
                  </View>
                  <Text style={styles.successTitle}>Thank You</Text>
                  <Text style={styles.successMessage}>
                    Your report has been received. Our team will review it and
                    take appropriate action.
                  </Text>
                  <TouchableOpacity
                    style={styles.doneButton}
                    onPress={handleClose}
                  >
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  modalContainer: {
    backgroundColor: "#FFF",
    width: "90%",
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1D2939",
  },
  subtitle: {
    fontSize: 14,
    color: "#667085",
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#344054",
    marginBottom: 12,
  },
  reasonsList: {
    marginBottom: 20,
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  reasonText: {
    fontSize: 15,
    color: "#475467",
  },
  selectedReasonText: {
    color: "#1D2939",
    fontWeight: "600",
  },
  textInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#EAECF0",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#1D2939",
    textAlignVertical: "top",
    minHeight: 100,
    marginBottom: 24,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  cancelButton: {
    flex: 0.4,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#667085",
    fontWeight: "600",
    fontSize: 14,
  },
  loader: {
    position: "absolute",
    alignSelf: "center",
    top: 14,
  },
  // Success state styles
  successContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1D2939",
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 15,
    color: "#667085",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  doneButton: {
    backgroundColor: "#F2F4F7",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  doneButtonText: {
    color: "#1D2939",
    fontWeight: "700",
    fontSize: 15,
  },
});

export default ReportModal;
