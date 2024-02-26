const { dynamodb } = require("../../db/db");
const { v4: uuidv4 } = require("uuid");

const LIST_TABLE = "pinterest-lists";

const addToList = async (req, res) => {
  const { image_id, list_name } = req.body;
  const params = {
    TableName: LIST_TABLE,
    Item: {
      list_id: uuidv4(),
      list_name: list_name,
      user_id: req.user.user_id,
      images: image_id,
    },
  };
  try {
    const list = await dynamodb.put(params).promise();
    res.status(201).json({ message: "Image added to the list successfully", list });
  } catch (error) {
    console.error("Error adding image to the list:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { addToList };
