export const createUser = async (req, res) => {
  try {
    const { clerkId, username, email } = req.body;

    if (!clerkId || !username || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ clerkId });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      clerkId,
      username,
      email,
    });

    await newUser.save();
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
