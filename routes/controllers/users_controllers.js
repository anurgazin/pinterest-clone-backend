const { dynamodb } = require("../../db/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const USERS_TABLE = "pinterest-users";

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "3600s" });
};

const createUser = async (req, res) => {
  const { username, email, password } = req.body;
  const hashedpwd = await bcrypt.hash(password, 10);

  const params = {
    TableName: USERS_TABLE,
    Item: {
      user_id: uuidv4(),
      username: username,
      email: email,
      password: hashedpwd,
    },
  };
  try {
    await dynamodb.put(params).promise();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUserById = async (req, res) => {
  const id = req.params.user_id;
  const params = {
    TableName: USERS_TABLE,
    Key: {
      user_id: id,
    },
  };
  try {
    const { Item } = await dynamodb.get(params).promise();
    if (!Item) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(Item);
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUsers = async (req, res) => {
  const params = {
    TableName: USERS_TABLE,
  };
  const users = await dynamodb.scan(params).promise();
  res.status(200).json(users);
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const params = {
    TableName: USERS_TABLE,
    IndexName: "email-index",
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": email,
    },
  };

  try {
    const { Items } = await dynamodb.query(params).promise();
    if (Items.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const user = Items[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      const token = generateToken({
        user_id: user.user_id,
        username: user.username,
      });
      res.status(200).json({ message: "Authentication successful", token });
    } else {
      res.status(401).json({ message: "Incorrect password" });
    }
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { createUser, getUsers, getUserById, loginUser };
