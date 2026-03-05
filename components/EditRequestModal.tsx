import { Colors } from "@/constants/colors";
import type { ConfirmationData } from "@/types";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  visible: boolean;
  data: ConfirmationData | null;
  onSave: (updatedData: ConfirmationData) => void;
  onClose: () => void;
};

export default function EditRequestModal({ visible, data, onSave, onClose }: Props) {
  const [form, setForm] = useState<ConfirmationData | null>(data);

  useEffect(() => {
    setForm(data);
  }, [data]);

  if (!form) return null;

  const update = (key: keyof ConfirmationData, value: any) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const isLeave = form.requestType === "leave";
  const isRoom = form.requestType === "room";

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Edit Request</Text>

          {isLeave && (
            <>
              <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
              <TextInput style={styles.input} value={form.startDate ?? ""} onChangeText={(t) => update("startDate", t)} />

              <Text style={styles.label}>End Date (YYYY-MM-DD)</Text>
              <TextInput style={styles.input} value={form.endDate ?? ""} onChangeText={(t) => update("endDate", t)} />

              <Text style={styles.label}>Reason</Text>
              <TextInput style={styles.input} value={form.reason ?? ""} onChangeText={(t) => update("reason", t)} />
            </>
          )}

          {isRoom && (
            <>
              <Text style={styles.label}>Room Name</Text>
              <TextInput style={styles.input} value={form.roomName ?? ""} onChangeText={(t) => update("roomName", t)} />

              <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
              <TextInput style={styles.input} value={form.date ?? ""} onChangeText={(t) => update("date", t)} />

              <Text style={styles.label}>Start Time (HH:MM)</Text>
              <TextInput style={styles.input} value={form.startTime ?? ""} onChangeText={(t) => update("startTime", t)} />

              <Text style={styles.label}>End Time (HH:MM)</Text>
              <TextInput style={styles.input} value={form.endTime ?? ""} onChangeText={(t) => update("endTime", t)} />

              <Text style={styles.label}>Purpose</Text>
              <TextInput style={styles.input} value={form.purpose ?? ""} onChangeText={(t) => update("purpose", t)} />
            </>
          )}

          <View style={styles.row}>
            <Pressable onPress={onClose} style={[styles.btn, styles.btnGhost]}>
              <Text style={[styles.btnText, styles.btnGhostText]}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={() => onSave(form)}
              style={[styles.btn, styles.btnPrimary]}
            >
              <Text style={styles.btnText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  card: { backgroundColor: Colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16, borderWidth: 1, borderColor: Colors.border },
  title: { fontSize: 18, fontWeight: "800", color: Colors.text, marginBottom: 12 },
  label: { fontSize: 12, color: Colors.textSecondary, marginTop: 10, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: Colors.text, backgroundColor: Colors.surfaceAlt },
  row: { flexDirection: "row", gap: 10, marginTop: 16 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  btnPrimary: { backgroundColor: Colors.primary },
  btnGhost: { backgroundColor: Colors.surfaceAlt, borderWidth: 1, borderColor: Colors.border },
  btnText: { fontWeight: "800", color: Colors.textInverse },
  btnGhostText: { color: Colors.text },
});
