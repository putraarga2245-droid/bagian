const express = require("express");
const connectToMongoDB = require("../DB/db");
const Item = require("../models/Item");

const app = express();
app.use(express.json());

// Hubungkan ke database
connectToMongoDB();

app.get("/api/hello", (req, res) => {
  res.status(200).json({ message: "API is working" });
});

// --- SISTEM CRUD ---

// 1. CREATE (Tambah Data)
app.post("/api/items", async (req, res) => {
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    res.status(201).json({ message: "Item berhasil ditambahkan", data: savedItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. READ ALL (Ambil Semua Data)
app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json({ message: "Berhasil mengambil data", data: items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. READ SINGLE (Ambil Data Berdasarkan ID)
app.get("/api/items/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item tidak ditemukan" });
    res.status(200).json({ message: "Berhasil mengambil data", data: item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. UPDATE (Ubah Data Berdasarkan ID)
app.put("/api/items/:id", async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!updatedItem) return res.status(404).json({ message: "Item tidak ditemukan" });
    res.status(200).json({ message: "Item berhasil diperbarui", data: updatedItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. DELETE (Hapus Data Berdasarkan ID)
app.delete("/api/items/:id", async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ message: "Item tidak ditemukan" });
    res.status(200).json({ message: "Item berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = (req, res) => {
  app(req, res);
};
