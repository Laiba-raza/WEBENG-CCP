// controllers/noteController.js
const Note = require("../models/Notes");
const User = require("../models/User");
const logger = require("../configure");
const sanitizeHtml = require("sanitize-html");

// Create a new note
createNote = async (req, res) => {
  const { title, content, isLocked } = req.body;
  const sanitizedContent = sanitizeHtml(content); // Sanitize content

  try {
    const note = new Note({
      title: sanitizeHtml(title),
      content: sanitizedContent,
      userId: req.user._id,
      isLocked: isLocked
    });

    const savedNote = await note.save();
    logger.info(`Note created: ${savedNote._id} by user ${req.user.email}`);
    res.status(201).json(savedNote);
  } catch (error) {
    logger.error("Error creating note:", error);
    res.status(500).json({ message: "Error creating note" });
  }
};

// Get all notes for the authenticated user
getUserNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id });
    logger.info(`Fetched notes for user ${req.user.email}`);
    res.status(200).json(notes);
  } catch (error) {
    logger.error("Error fetching notes:", error);
    res.status(500).json({ message: "Error fetching notes" });
  }
};

// Get a specific note by ID
getNoteById = async (req, res) => {
  const { id } = req.params;
  try {
    const note = await Note.findOne({ _id: id, userId: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.status(200).json(note);
  } catch (error) {
    logger.error("Error fetching note:", error);
    res.status(500).json({ message: "Error fetching note" });
  }
};

//Update a note
updateNote = async (req, res) => {
  const { id } = req.params;
  const { title, content, isLocked } = req.body;
  logger.info("Title : ", title)
  logger.info("Content : ", content)
  logger.info("isLocked : ", isLocked)

  try {
    const note = await Note.findOne({ _id: id, userId: req.user._id });

    if (!note) {
      logger.warn(`Note not found: ${id} for user ${req.user.email}`);
      return res
        .status(403)
        .json({ message: "Forbidden:You don't own this note" });
    }

    note.title = sanitizeHtml(title) || note.title;
    note.content = sanitizeHtml(content) || note.content;
    note.isLocked = isLocked
    note.updatedAt = Date.now();

    const updatedNote = await note.save();
    logger.info(`Note updated: ${updatedNote._id} by user ${req.user.email}`);
    res.status(200).json(updatedNote);
  } catch (error) {
    logger.error("Error updating note:", error);
    res.status(500).json({ message: "Error updating note" });
  }
};

// Delete a note
deleteNote = async (req, res) => {
  const { id } = req.params;

  try {
    const note = await Note.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!note) {
      logger.warn(
        `Note not found for deletion: ${id} by user ${req.user.email}`
      );
      return res.status(404).json({ message: "Note not found" });
    }

    logger.info(`Note deleted: ${id} by user ${req.user.email}`);
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    logger.error("Error deleting note:", error);
    res.status(500).json({ message: "Error deleting note" });
  }
};

// @desc Unlock a locked note by verifying password
// @route POST /api/notes/unlock
// @access Private
unlockNote = async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ success: false, message: "Password is required" });
  }

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await user.matchPassword(password);

    if (isMatch) {
      res.status(200).json({ success: true });
    } else {
      res.status(200).json({ success: false });
    }
  } catch (error) {
    logger.error("Error unlocking note:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createNote,
  getUserNotes,
  updateNote,
  deleteNote,
  getNoteById,
  unlockNote
};
