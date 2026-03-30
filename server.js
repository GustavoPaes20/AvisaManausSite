require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
mongoose.set("strictQuery", true);

const denunciaDb = mongoose.createConnection(process.env.MONGODB_DENUNCIAS_URI);

const loginDb = mongoose.createConnection(process.env.MONGODB_LOGIN_URI);

const denunciaUsuarioSchema = new mongoose.Schema({
  tipo: String,         
  descricao: String,    
  latitude: Number,     
  longitude: Number,    
  status: {
    type: String,
    enum: ["em-analise", "solucionado"],
    default: "em-analise", 
  },
  data: { type: Date, default: Date.now }, 
  anexo: [String],     
});

const DenunciaUsuario = denunciaDb.model(
  "DenunciaUsuario",
  denunciaUsuarioSchema,
  "DenunciaUsuario"
);

mongoose
  .connect(process.env.MONGODB_DENUNCIAS_URI)
  .then(() => {
    console.log("Conexão com o banco de dados de denúncias estabelecida com sucesso.");
  })
  .catch((err) => {
    console.error("Erro ao conectar ao banco de dados de denúncias:", err);
  });

app.get("/api/DenunciaUsuario", async (req, res) => {
  try {
    const denuncias = await DenunciaUsuario.find();
    console.log("Denúncias encontradas:", denuncias); 
    res.json(denuncias);
  } catch (err) {
    console.error("Erro ao obter denúncias:", err);
    res.status(500).json({ message: "Erro ao obter denúncias", error: err });
  }
});

app.post("/api/DenunciaUsuario/update", async (req, res) => {
  try {
    const { id, status } = req.body;

    console.log("ID recebido:", id); 
    console.log("Status recebido:", status);

    if (!['em-analise', 'solucionado'].includes(status)) {
      return res.status(400).json({ message: 'Status inválido.' });
    }

    const updatedDenuncia = await DenunciaUsuario.findByIdAndUpdate(id, { status }, { new: true });

    if (!updatedDenuncia) {
      console.log("Denúncia não encontrada."); 
      return res.status(404).json({ message: 'Denúncia não encontrada.' });
    }

    console.log("Denúncia atualizada com sucesso:", updatedDenuncia); 

    res.json({
      success: true,
      message: 'Status atualizado com sucesso!',
      updatedDenuncia,
    });
  } catch (err) {
    console.error("Erro ao atualizar status da denúncia:", err);
    res.status(500).json({ message: "Erro ao atualizar status da denúncia", error: err });
  }
});

const admSchema = new mongoose.Schema(
  {
    empresa: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return v && v.trim().length > 1;
        },
        message: "O nome deve conter mais de uma letra.",
      },
    },
    cnpj: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d{14}$/.test(v);
        },
        message: "O CNPJ deve conter exatamente 14 dígitos numéricos.",
      },
    },
    email: {
      type: String,
      unique: true,
      required: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Email inválido.",
      },
    },
    senha: {
      type: String,
      required: true,
      minlength: 8,
      validate: {
        validator: function (v) {
          return /[0-9!@#$%^&*(),.?":{}|<>]/.test(v);
        },
        message: "A senha deve conter pelo menos um número ou símbolo.",
      },
    },
  },
  {
    collection: "Adm",
  }
);

admSchema.pre("save", async function (next) {
  if (this.isModified("senha")) {
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
  }
  next();
});

const Adm = loginDb.model("Adm", admSchema);

app.post("/api/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const adm = await Adm.findOne({ email });
    if (!adm) {
      return res.status(404).json({ message: "Administrador não encontrado." });
    }

    const senhaValida = await bcrypt.compare(senha, adm.senha);
    if (!senhaValida) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    res.status(200).json({
      message: "Login bem-sucedido!",
      empresa: adm.empresa,
    });
  } catch (err) {
    console.error("Erro ao realizar login:", err);
    res.status(500).json({ message: "Erro interno no servidor." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});