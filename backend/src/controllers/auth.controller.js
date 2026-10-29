import bcrypt from "bcryptjs";
import generateToken from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
import { prisma } from "../lib/prisma.js";

export const signup = async (req, res) => {
  const { name, username, email, password } = req.body;

  try {
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).send("Password must be at least 6 characters");
    }

    const userMail = await prisma.user.findUnique({ where: { email: email } });
    const userName = await prisma.user.findUnique({ where: { username: username } });

    if (userMail) { return res.status(400).send("Email already used"); }
    if (userName) { return res.status(400).send("Username already taken"); }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email: email,
        username: username,
        name: name,
        password: hashedPassword,
        bio: "",
        tags: []
      }
    });

    if (newUser) {
      generateToken(newUser.id, res);

      res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        profilePic: newUser.profilePic,
        bio: newUser.bio,
        tags: newUser.tags,
      });
      console.log("User created");
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }

  } catch (error) {
    console.log("Error in signup:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credential" });

    const idPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!idPasswordCorrect) return res.status(400).json({ message: "Invalid credential" });

    generateToken(user.id, res);

    res.status(200).json({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      bio: user.bio,
      tags: user.tags,
    });
  } catch (error) {
    console.log("Error in login:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, tags } = req.body;
    const userId = req.user.id;

    const updateData = {};

    if (profilePic) {
      if (typeof profilePic === "string" && profilePic.startsWith("data:image")) {
        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        updateData.profilePic = uploadResponse.secure_url;
      } else {
        updateData.profilePic = profilePic;
      }
    }

    if (bio !== undefined) {
      updateData.bio = typeof bio === "string" ? bio : "";
    }

    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? tags : [];
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "At least one field (profilePic, bio, tags) is required to update" });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId
      },
      data: updateData
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in updateProfile:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
