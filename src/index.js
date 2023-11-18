const express = require('express')
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const  { connectToDb } = require('./db/connection');
const User = require('./db/user');
const Note = require('./db/note');
const verifyToken = require('./auth');


const app=express();

app.use(express.json())
app.use(cors())

app.get("./api.notes",async(req,res)=>{
    resizeBy.json({message:"success!"});
})

app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    // Save the user to the database
    await newUser.save();

    // Create a JWT token
    const token = jwt.sign({ userId: newUser._id }, 'payyanur', { expiresIn: '1h' });

    // Respond with the token
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.post('/login', async (req, res) => {
    console.log('req.....')
    const { email, password } = req.body;
  
    try {
      // Check if the user exists
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      // Verify the password
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
  
      // Create a JWT token
      const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });
  
      // Respond with the token
      res.status(200).json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/getAllNotes', verifyToken, async (req, res) => {
  try {
    // req.userId is now available, containing the userId from the token
    const userId = req.userId;

    // Get all notes for the user from the database
    const notes = await Note.find({ userId });

    res.status(200).json({ notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/createNote', verifyToken, async (req, res) => {
    try {
      console.log(req.body, req.userId)
        // req.userId is now available, containing the userId from the token
        const userId = req.userId;

        // Get the user based on userId
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Create a new note using the userId from the token
        const { title, content } = req.body;
        const newNote = new Note({
            userId: user._id,
            title,
            content,
        });

        // Save the note to the database
        await newNote.save();

        res.status(201).json({ message: 'Note created successfully', note: newNote });
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/updateNote/:noteId', verifyToken, async (req, res) => {
  try {
    const { noteId } = req.params;
    const { title, content } = req.body;

    // Update the note in the database
    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      { title, content },
      { new: true } // Return the updated note
    );

    if (!updatedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.status(200).json({ message: 'Note updated successfully', note: updatedNote });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/deleteNote/:noteId', verifyToken, async (req, res) => {
  try {
    const { noteId } = req.params;

    // Delete the note from the database
    const deletedNote = await Note.findByIdAndDelete(noteId);

    if (!deletedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// mongoose connection
connectToDb();

app.listen(5000,()=>{
    console.log("server running on localhost:5000")
})