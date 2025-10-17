const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const userSchema = require('../schemas/userSchema');
const verifyToken = require('../middlewares/verifyToken');

const User = new mongoose.model("User", userSchema);

router.get('/', async(req, res) => {
  // console.log(req.headers);
    try {
        const users = await User.find();
    
        if (!users || users.length === 0) {
          return res.status(404).json({ message: 'No users found' });
        }
    
        res.status(200).json(users);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
});

router.get('/:email', verifyToken, async (req, res) => {
  try {
    const emailToFind = req.params.email; 
    const user = await User.findOne({ email: emailToFind }); 

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// image upload route 
router.put('/:id/photo', async (req, res) => {
  const userId = req.params.id;
  const { photo } = req.body; 
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, { photo }, { new: true });
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.post('/',  async (req, res) => {
  const query = {email: req.body.user};
  const existinguser = await User.findOne(query);
  if(existinguser)
  {
    return res.status(500).json({
      error: "User already Exists"
    })
  }
  
    try {
      const newUser = new User(req.body);
      await newUser.save();
      res.status(200).json({
          message: "User was added successfully"
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({
          error: "There was a server side error!"
      });
  }
  
    
});

router.put('/:id', async (req, res) => {
  const userId = req.params.id;
  const updateData = req.body;
  try {
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
      if (!updatedUser) {
          return res.status(404).json({ error: 'User not found' });
      }
      res.status(200).json(updatedUser);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:id/make-admin', async (req, res) => {
  try {
      const userId = req.params.id;
      const updatedUser = await User.findByIdAndUpdate(userId, { role: 'admin' }, { new: true });

      if (!updatedUser) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ message: 'User role updated to admin', user: updatedUser });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/:id', async(req, res) => {

});

module.exports = router;
