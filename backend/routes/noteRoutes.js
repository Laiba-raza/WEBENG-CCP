// routes/noteRoutes.js
const express = require("express");
const {
  createNote,
  getUserNotes,
  updateNote,
  deleteNote,
  unlockNote
} = require("../controllers/noteController");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();

// Create a new note
router.post("/notes", authenticate, createNote);

//Get a specific note by ID
router.get("/notes/:id", authenticate, getNoteById);

// Get all notes for the authenticated user
router.get("/notes", authenticate, getUserNotes);

// Update a note
router.put("/notes/:id", authenticate, updateNote);

// Delete a note
router.delete("/notes/:id", authenticate, deleteNote);

// Unlock a note
router.post("/notes/:id/unlock", authenticate, unlockNote);



module.exports = router;
