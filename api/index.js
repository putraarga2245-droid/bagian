const express = require("express");
const connectToMongoDB = require("../DB/db");
const Item = require("../models/Item");

const app = express();
app.use(express.json());

// Hubungkan ke database
connectToMongoDB();

// 0. FRONTEND (Tampilan UI)
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CRUD MongoDB Express Vercel</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 30px auto; padding: 20px; background: #f9f9f9; }
            .card { background: white; padding: 15px; margin-bottom: 15px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            input, textarea { width: 100%; padding: 8px; margin: 5px 0 10px 0; box-sizing: border-box; }
            button { background: #0070f3; color: white; border: none; padding: 10px 15px; cursor: pointer; border-radius: 3px; }
            button:hover { background: #0051a2; }
            .btn-danger { background: #e00; }
            .btn-danger:hover { background: #a00; }
            .item-actions { margin-top: 10px; }
        </style>
    </head>
    <body>

        <h2>Aplikasi CRUD Sederhana</h2>

        <div class="card">
            <h3 id="form-title">Tambah Item Baru</h3>
            <input type="hidden" id="item-id">
            <label>Nama:</label>
            <input type="text" id="name" placeholder="Masukkan nama item...">
            <label>Deskripsi:</label>
            <textarea id="description" placeholder="Masukkan deskripsi..."></textarea>
            <button onclick="saveItem()">Simpan Data</button>
            <button onclick="resetForm()" style="background: #666; margin-left: 5px;">Batal</button>
        </div>

        <div class="card">
            <h3>Daftar Item</h3>
            <div id="item-list">Memuat data...</div>
        </div>

        <script>
            const API_URL = "/api/items";

            async function fetchItems() {
                try {
                    const response = await fetch(API_URL);
                    const result = await response.json();
                    const container = document.getElementById("item-list");
                    
                    if (!result.data || result.data.length === 0) {
                        container.innerHTML = "<p>Belum ada data.</p>";
                        return;
                    }

                    container.innerHTML = "";
                    result.data.forEach(item => {
                        container.innerHTML += \`
                            <div style="border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 10px;">
                                <strong>\${item.name}</strong>
                                <p>\${item.description || "-"}</p>
                                <div class="item-actions">
                                    <button onclick="editItem('\${item._id}', '\${item.name}', '\${item.description || ""}')">Edit</button>
                                    <button class="btn-danger" onclick="deleteItem('\${item._id}')">Hapus</button>
                                </div>
                            </div>
                        \`;
                    });
                } catch (error) {
                    console.error("Gagal memuat data:", error);
                }
            }

            async function saveItem() {
                const id = document.getElementById("item-id").value;
                const name = document.getElementById("name").value;
                const description = document.getElementById("description").value;

                if (!name) {
                    alert("Nama tidak boleh kosong!");
                    return;
                }

                const method = id ? "PUT" : "POST";
                const url = id ? \`\${API_URL}/\${id}\` : API_URL;

                try {
                    const response = await fetch(url, {
                        method: method,
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name, description })
                    });

                    if (response.ok) {
                        resetForm();
                        fetchItems();
                    } else {
                        alert("Gagal menyimpan data.");
                    }
                } catch (error) {
                    console.error("Error:", error);
                }
            }

            function editItem(id, name, description) {
                document.getElementById("form-title").innerText = "Edit Item";
                document.getElementById("item-id").value = id;
                document.getElementById("name").value = name;
                document.getElementById("description").value = description;
            }

            async function deleteItem(id) {
                if (!confirm("Yakin ingin menghapus item ini?")) return;

                try {
                    const response = await fetch(\`\${API_URL}/\${id}\`, { method: "DELETE" });
                    if (response.ok) {
                        fetchItems();
                    } else {
                        alert("Gagal menghapus data.");
                    }
                } catch (error) {
                    console.error("Error:", error);
                }
            }

            function resetForm() {
                document.getElementById("form-title").innerText = "Tambah Item Baru";
                document.getElementById("item-id").value = "";
                document.getElementById("name").value = "";
                document.getElementById("description").value = "";
            }

            fetchItems();
        </script>
    </body>
    </html>
  `);
});

app.get("/api/hello", (req, res) => {
  res.status(200).json({ message: "API is working" });
});

// --- SISTEM CRUD ---

app.post("/api/items", async (req, res) => {
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    res.status(201).json({ message: "Item berhasil ditambahkan", data: savedItem });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json({ message: "Berhasil mengambil data", data: items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/items/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item tidak ditemukan" });
    res.status(200).json({ message: "Berhasil mengambil data", data: item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
