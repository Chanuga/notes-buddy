import { useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  addNotes,
  deleteNotes,
  getNotes,
  initDatabase,
  updateNotes,
} from "../../db";

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export default function Index() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  console.log("notes", notes);

  const setup = async () => {
    await initDatabase();
    await fetchNotes();
  };

  const fetchNotes = async () => {
    const notesList = await getNotes();
    setNotes(notesList as Note[]);
  };

  const handleAddNote = async () => {
    setEditingNote(null);
    setTitle("");
    setContent("");
    setModalVisible(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setModalVisible(true);
  };

  const handleDeleteNote = async (id: number) => {
    await deleteNotes(id);
    await fetchNotes();
  };

  const handleSaveNote = async () => {
    if (editingNote) {
      await updateNotes(
        editingNote.id,
        title,
        content,
        new Date().toISOString(),
      );
    } else {
      await addNotes(title, content, new Date().toISOString());
    }

    setTitle("");
    setContent("");
    setModalVisible(false);
    setEditingNote(null);
    await fetchNotes();
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
  };

  const renderNoteItem = (note: Note) => (
    <TouchableOpacity
      key={note.id}
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => handleEditNote(note)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {note.title}
        </Text>
        <TouchableOpacity
          onPress={() => handleDeleteNote(note.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.cardContent} numberOfLines={3}>
        {note.content}
      </Text>
      {!!formatDate(note.created_at) && (
        <Text style={styles.cardDate}>{formatDate(note.created_at)}</Text>
      )}
    </TouchableOpacity>
  );

  useEffect(() => {
    setup();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NotesBuddy</Text>
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.8}
          onPress={handleAddNote}
        >
          <Text style={styles.addButtonText}>Add Note</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        renderItem={({ item }) => renderNoteItem(item)}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No notes available. Add a note to get started!
            </Text>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            style={styles.modalInner}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <Text style={styles.modalTitle}>
              {editingNote ? "Edit Note" : "Add Note"}
            </Text>

            <TextInput
              style={styles.titleInput}
              placeholder="Title"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.contentInput}
              placeholder="Content"
              placeholderTextColor={colors.textMuted}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                activeOpacity={0.8}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                activeOpacity={0.8}
                onPress={handleSaveNote}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const colors = {
  background: "#EEF1F5",
  surface: "#FFFFFF",
  ink: "#1B2733",
  textMuted: "#7A8794",
  border: "#D9DFE6",
  accent: "#0F766E",
  accentText: "#FFFFFF",
  danger: "#C0392B",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    color: colors.ink,
  },
  addButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  addButtonText: {
    color: colors.accentText,
    fontSize: 14,
    fontWeight: "700",
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    shadowColor: "#1B2733",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
    marginRight: 12,
  },
  deleteText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.danger,
  },
  cardContent: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.ink,
    opacity: 0.8,
  },
  cardDate: {
    marginTop: 10,
    fontSize: 12,
    color: colors.textMuted,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    lineHeight: 23,
    textAlign: "center",
    color: colors.textMuted,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalInner: {
    flex: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.4,
    color: colors.ink,
    marginBottom: 20,
  },
  titleInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 17,
    fontWeight: "600",
    color: colors.ink,
    marginBottom: 12,
  },
  contentInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 22,
    color: colors.ink,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
  saveButton: {
    backgroundColor: colors.accent,
  },
  saveButtonText: {
    color: colors.accentText,
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "600",
  },
});
