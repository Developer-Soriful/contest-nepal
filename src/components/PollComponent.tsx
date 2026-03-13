import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Option = { id: string; text: string; votes: number };

const PollComponent = ({
  question,
  options,
}: {
  question: string;
  options: Option[];
}) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [localOptions, setLocalOptions] = useState<Option[]>(options);
  const [hasVoted, setHasVoted] = useState(false);

  const submitVote = () => {
    if (!selected) return;
    setLocalOptions((prev) =>
      prev.map((o) => (o.id === selected ? { ...o, votes: o.votes + 1 } : o)),
    );
    setHasVoted(true);
  };

  const totalVotes = localOptions.reduce((s, o) => s + o.votes, 0) || 1;

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>
      {localOptions.map((opt) => {
        const pct = Math.round((opt.votes / totalVotes) * 100);
        const selectedStyle = selected === opt.id ? styles.optionSelected : {};
        return (
          <TouchableOpacity
            key={opt.id}
            activeOpacity={0.8}
            onPress={() => !hasVoted && setSelected(opt.id)}
            style={[styles.option, selectedStyle]}
          >
            <Text style={styles.optionText}>{opt.text}</Text>
            <View style={styles.meta}>
              <Text style={styles.votesText}>{opt.votes} votes</Text>
              {hasVoted && <Text style={styles.pctText}>{pct}%</Text>}
            </View>
          </TouchableOpacity>
        );
      })}

      {!hasVoted ? (
        <TouchableOpacity
          style={styles.voteButton}
          onPress={submitVote}
          activeOpacity={0.8}
        >
          <Text style={styles.voteButtonText}>Vote</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.thanks}>Thanks for voting — results updated.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  question: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionSelected: { borderColor: "#A30000", backgroundColor: "#FFF5F5" },
  optionText: { fontSize: 14, color: "#374151", flex: 1 },
  meta: { marginLeft: 8, alignItems: "flex-end" },
  votesText: { fontSize: 12, color: "#6B7280", fontWeight: "600" },
  pctText: { fontSize: 12, color: "#6B7280" },
  voteButton: {
    marginTop: 10,
    backgroundColor: "#A30000",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  voteButtonText: { color: "#fff", fontWeight: "700" },
  thanks: { marginTop: 10, color: "#6B7280", fontWeight: "600" },
});

export default PollComponent;
