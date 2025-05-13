import "./Dashboard.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";


const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // New state variables for handling locked notes
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [password, setPassword] = useState("");
  const [unlockedNotes, setUnlockedNotes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("http://localhost:3001/api/notes", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const sortedNotes = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotes(sortedNotes);
        setFilteredNotes(sortedNotes);
        setNotes(response.data);
        setFilteredNotes(response.data);
      } catch (error) {
        console.error("Error fetching notes:", error);
        alert("Session expired. Please log in again.");
        navigate("/auth"); // Redirect to login page
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();

    // Reset unlockedNotes when component mounts (page refresh)
    setUnlockedNotes([]);
  }, [navigate]);

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredNotes(notes);
    } else {
      const filtered = notes.filter(
        note => {
          // Only search in unlocked notes or notes that aren't private
          if (!note.isLocked || unlockedNotes.includes(note._id)) {
            return note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              note.content.toLowerCase().includes(searchTerm.toLowerCase());
          }
          // For locked notes, only search in title
          return note.title.toLowerCase().includes(searchTerm.toLowerCase());
        }
      );
      setFilteredNotes(filtered);
    }
  }, [searchTerm, notes, unlockedNotes]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateNote = () => {
    navigate("/note/new");
  };

  const handleEditNote = (id, note) => {
    // Check if note is locked and not unlocked
    if (note.isLocked && !unlockedNotes.includes(id)) {
      setSelectedNote({ ...note, action: 'edit' });
      setIsPasswordModalOpen(true);
      return;
    }
    navigate(`/note/edit/${id}`, { state: note });
  };

  const handleDeleteNote = async (id) => {
    setIsLoading(true);
    try {
      await axios.delete(`http://localhost:3001/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setNotes(notes.filter((note) => note._id !== id));
      setFilteredNotes(filteredNotes.filter((note) => note._id !== id));

      // Remove from unlocked notes if it was there
      setUnlockedNotes(unlockedNotes.filter(noteId => noteId !== id));

      // Set success notification
      setNotification({
        message: "Note deleted successfully!",
        type: "success",
      });

      setTimeout(() => {
        setNotification({ message: "", type: "" });
      }, 3000);

      setIsConfirmingDelete(false);
      setNoteToDelete(null);
    } catch (error) {
      console.error("Error deleting note:", error);

      // Set error notification
      setNotification({
        message: "Failed to delete the note. Please try again.",
        type: "error",
      });

      // Hide the notification after 3 seconds
      setTimeout(() => {
        setNotification({ message: "", type: "" });
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Open the confirmation modal for deletion
  const initiateDeleteNote = (note) => {
    // Check if note is locked and not unlocked
    if (note.isLocked && !unlockedNotes.includes(note._id)) {
      setSelectedNote({ ...note, action: 'delete' });
      setIsPasswordModalOpen(true);
      return;
    }

    setIsConfirmingDelete(true);
    setNoteToDelete(note);
  };

  // Cancel the delete action
  const cancelDelete = () => {
    setIsConfirmingDelete(false);
    setNoteToDelete(null);
  };

  // API function for password verification
  const verifyPassword = async (noteId, password) => {
    try {
      const res = await axios.post(`http://localhost:3001/api/notes/${noteId}/unlock`, { password }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return res.data.success;
    } catch {
      return false;
    }
  };

  // Handle the unlock attempt
  const handleUnlockNote = async () => {
    // Set loading state while verifying password

    try {
      // Verify password with the backend API
      const isPasswordCorrect = await verifyPassword(selectedNote._id, password);

      if (isPasswordCorrect) {
        // Add note to unlocked notes
        setUnlockedNotes([...unlockedNotes, selectedNote._id]);

        // Show success notification
        setNotification({
          message: "Note unlocked successfully!",
          type: "success",
        });

        // Reset password field
        setPassword("");

        // Close the modal
        setIsPasswordModalOpen(false);

        // Check if there was a pending action (edit or delete)
        if (selectedNote.action === 'edit') {
          // Navigate to edit page
          navigate(`/note/edit/${selectedNote._id}`, { state: selectedNote });
        } else if (selectedNote.action === 'delete') {
          // Open delete confirmation
          setIsConfirmingDelete(true);
          setNoteToDelete(selectedNote);
        }

        // Reset selected note
        setSelectedNote(null);
      } else {
        // Show error notification
        setNotification({
          message: "Incorrect password. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error verifying password:", error);

      // Show error notification
      setNotification({
        message: "Error verifying password. Please try again.",
        type: "error",
      });
    } finally {

      // Hide the notification after 3 seconds
      setTimeout(() => {
        setNotification({ message: "", type: "" });
      }, 3000);
    }
  };

  // Close the password modal
  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setSelectedNote(null);
    setPassword("");
  };

  // View a locked note
  const viewNote = (note) => {
    if (note.isLocked && !unlockedNotes.includes(note._id)) {
      setSelectedNote({ ...note, action: 'view' });
      setIsPasswordModalOpen(true);
    }
  };

  return (
    <div className="dashboard">
      <h2>My Notes</h2>
      <div className="create-note-button">
        <button onClick={handleCreateNote}>Create New Note</button>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : (
        <ul>
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <li
                key={note._id}
                className={`note-item ${note.isLocked && !unlockedNotes.includes(note._id) ? 'locked-note' : ''}`}
              >
                <div className="note-header">
                  <h3>{note.title}</h3>
                </div>

                {/* Only show content if note is not private or if it's unlocked */}
                {(!note.isLocked || unlockedNotes.includes(note._id)) ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: note.content }}
                  />
                ) : (
                  <div className="locked-content" onClick={() => viewNote(note)}>
                    <p>This note is locked. Click to unlock.</p>
                    <div className="lock-icon">
                      <FaLock size={20} color="#555" />
                    </div>
                  </div>
                )}

                <div className="note-buttons">
                  <button onClick={() => handleEditNote(note._id, note)}>Edit</button>
                  <button onClick={() => initiateDeleteNote(note)}>Delete</button>
                </div>
              </li>
            ))
          ) : (
            <p className="no-notes-message">
              {notes.length === 0 ? "No notes found. Create your first note!" : "No notes match your search."}
            </p>
          )}
        </ul>
      )}

      {/* Delete Confirmation Modal */}
      {isConfirmingDelete && (
        <div className="modal-overlay">
          <div className="delete-confirmation-modal">
            <p>Are you sure you want to delete this note?</p>
            <div className="modal-buttons">
              <button onClick={() => handleDeleteNote(noteToDelete._id)}>
                Yes
              </button>
              <button onClick={cancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="modal-overlay">
          <div className="password-modal">
            <h3>Enter Password</h3>
            <p>This note is locked. Please enter the password to access it.</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleUnlockNote();
                }
              }}
            />
            <div className="modal-buttons">
              <button
                onClick={handleUnlockNote}
                disabled={isLoading || !password.trim()}
              >
                {isLoading ? (
                  <span className="button-spinner"></span>
                ) : (
                  "Unlock"
                )}
              </button>
              <button onClick={closePasswordModal} disabled={isLoading}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default Dashboard;