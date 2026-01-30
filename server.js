// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./gestorcodstec.db'); // Cria o arquivo do banco localmente

// Configurações
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public')); // Para CSS e imagens
app.use(bodyParser.urlencoded({ extended: false }));

// 1. Criação das Tabelas (Executa ao iniciar)
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        email TEXT
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS contratos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER,
        descricao TEXT,
        valor_fixo REAL,
        valor_variavel REAL,
        data_vencimento TEXT,
        status_pagamento TEXT, -- 'Pendente', 'Pago', 'Atrasado'
        FOREIGN KEY(cliente_id) REFERENCES clientes(id)
    )`);
});

// --- ROTAS ---

// Página Inicial (Dashboard)
app.get('/', (req, res) => {
    const sql = `
        SELECT contratos.*, clientes.nome as cliente_nome 
        FROM contratos 
        JOIN clientes ON contratos.cliente_id = clientes.id
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return console.error(err.message);
        
        // Pega lista de clientes para o formulário
        db.all("SELECT * FROM clientes", [], (err, clientes) => {
            res.render('index', { contratos: rows, clientes: clientes });
        });
    });
});

// Cadastrar Cliente
app.post('/add-cliente', (req, res) => {
    const { nome, email } = req.body;
    db.run(`INSERT INTO clientes (nome, email) VALUES (?, ?)`, [nome, email], (err) => {
        res.redirect('/');
    });
});

// Cadastrar Contrato
app.post('/add-contrato', (req, res) => {
    const { cliente_id, descricao, valor_fixo, valor_variavel, data_vencimento } = req.body;
    const status = "Pendente";
    db.run(`INSERT INTO contratos (cliente_id, descricao, valor_fixo, valor_variavel, data_vencimento, status_pagamento) VALUES (?, ?, ?, ?, ?, ?)`, 
    [cliente_id, descricao, valor_fixo, valor_variavel, data_vencimento, status], (err) => {
        res.redirect('/');
    });
});

// Iniciar Servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});