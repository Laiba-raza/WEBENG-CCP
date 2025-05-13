import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./NoteEditor.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useNavigate, useParams } from "react-router-dom";
import annyang from "annyang";

const NoteEditor = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLocked, setIsLocked] = useState(false); // New state for privacy toggle
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [editor, setEditor] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [activeElement, setActiveElement] = useState("content");
  const titleInputRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();

  // Initialize annyang speech recognition
  useEffect(() => {
    if (annyang) {
      // Initialize with language for better accuracy
      annyang.setLanguage('en-US');
      annyang.debug(false);
      annyang.removeCallback('result');
      annyang.addCallback('result', (phrases) => {
        if (phrases && phrases.length > 0) {
          const recognizedText = phrases[0];
          console.log(`Active element: ${activeElement}, Recognized: ${recognizedText}`);

          // Only add text to the ACTIVE element - either title OR content, not both
          if (activeElement === "title") {
            console.log("Adding to title");
            // Set the title directly instead of concatenating to avoid duplication
            setTitle(currentTitle => {
              // Add space only if there's already text and it doesn't end with a space
              const spaceNeeded = currentTitle && !currentTitle.endsWith(' ') ? ' ' : '';
              return currentTitle + spaceNeeded + recognizedText;
            });
          } else if (activeElement === "content" && editor) {
            console.log("Adding to content");
            try {
              // Get the current editor selection
              const selection = editor.model.document.selection;

              // Insert text at cursor position with a space
              editor.model.change(writer => {
                writer.insertText(' ' + recognizedText, selection.getFirstPosition());
              });

              // Update content state with the new editor data
              setContent(editor.getData());
            } catch (error) {
              console.error("Error updating content:", error);
            }
          }
        }
      });

      // Clean up on component unmount
      return () => {
        if (isListening) {
          annyang.abort();
          annyang.removeCallback('result');
        }
      };
    }
  }, [editor, activeElement, isListening]);

  useEffect(() => {
    if (id) {
      // Fetch existing note data
      const fetchNote = async () => {
        try {
          const response = await axios.get(
            `http://localhost:3001/api/notes/${id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          console.log("Fetched note data:", response.data);
          setTitle(response.data.title);
          setContent(response.data.content);
          // Set the privacy toggle based on the fetched note data
          setIsLocked(response.data.isLocked || false);
        } catch (error) {
          console.error("Error fetching note:", error);
          showNotification("Error fetching note data.", "error");
        } finally {
          setLoading(false);
        }
      };

      fetchNote();
    } else {
      setLoading(false);
    }
  }, [id]);

  const showNotification = (message, type) => {
    setNotification({
      message,
      type,
    });

    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        // Update existing note
        await axios.put(
          `http://localhost:3001/api/notes/${id}`,
          { title, content, isLocked },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        showNotification("Note updated successfully!", "success");
      } else {
        // Create new note
        await axios.post(
          "http://localhost:3001/api/notes",
          { title, content, isLocked },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        showNotification("Note created successfully!", "success");
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving note:", error);
      showNotification("Error saving note. Please try again.", "error");
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  const toggleListening = () => {
    if (!annyang) {
      showNotification("Speech recognition is not supported in this browser.", "error");
      return;
    }

    if (isListening) {
      // Stop speech recognition
      annyang.abort();
      annyang.removeCallback('result');
      setIsListening(false);
      showNotification("Dictation stopped", "success");
    } else {
      // Stop any previous instances and clear callbacks
      annyang.abort();
      annyang.removeCallback('result');

      // Start speech recognition
      annyang.start({
        autoRestart: true,
        continuous: true
      });
      setIsListening(true);
      showNotification(`Dictation started for ${activeElement}`, "success");
    }
  };

  // Handle focus changes to track which element is active
  const handleTitleFocus = () => {
    setActiveElement("title");
  };

  const handleEditorFocus = () => {
    setActiveElement("content");
  };

  // Toggle privacy setting
  const handlePrivacyToggle = () => {
    setIsLocked(!isLocked);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="note-editor-container">
      <h2>{id ? "Edit Note" : "New Note"}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            ref={titleInputRef}
            onFocus={handleTitleFocus}
            required
          />
        </div>
        <div>
          <label>Content:</label>
          <CKEditor
            key={id || "new"}
            editor={ClassicEditor}
            data={content}
            onFocus={handleEditorFocus}
            onChange={(event, editor) => {
              setContent(editor.getData());
              setEditor(editor);
            }}
            onReady={editor => {
              setEditor(editor);
              editor.editing.view.document.on('focus', () => {
                handleEditorFocus();
              });
            }}
          />
          <div className="speech-controls">
            <button
              type="button"
              className={`speech-button ${isListening ? 'listening' : ''}`}
              onClick={toggleListening}
            >
              {isListening ? "Stop Dictation" : "Start Dictation"}
            </button>
          </div>
        </div>

        {/* New privacy toggle section */}
        <div className="privacy-toggle-container">
          <label className="privacy-toggle-label">
            <input
              type="checkbox"
              checked={isLocked}
              onChange={handlePrivacyToggle}
              className="privacy-toggle-input"
            />
            <span className="privacy-toggle-slider"></span>
            <span className="privacy-toggle-text">
              {isLocked ? "Private Note (Locked)" : "Public Note (Unlocked)"}
            </span>
          </label>
        </div>

        <div className="button-group">
          <button type="submit">{id ? "Update" : "Save"}</button>
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>

      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default NoteEditor;