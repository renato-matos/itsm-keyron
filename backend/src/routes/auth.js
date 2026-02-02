const express = require("express");
const jwt = require("jsonwebtoken");
const { User } = require("../models"); // Importa o modelo User
const router = express.Router();
const bcrypt = require('bcryptjs');
const { withServiceSpan } = require("../observability/spans");
const { logger } = require("../observability/logger");

const SECRET_KEY=process.env.SECRET_KEY;
const JWT_EXPIRATION=process.env.JWT_EXPIRATION;

router.post("/signin", async (req, res) => {
    await withServiceSpan('auth.signin', async () => {
        const { email, password } = req.body;

        try {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                logger.warn({
                    event: 'login_failed',
                    email: email,
                    message: 'Tentativa de login com e-mail não registrado',
                });
                return res.status(404).json({ error: "Usuário não encontrado." });
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                logger.warn({
                    event: 'login_failed',
                    email: email,
                    message: 'Tentativa de login com senha inválida',
                });
                return res.status(401).json({ error: "Senha inválida." });
            }
            
            //Gerar token JWT
            const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: JWT_EXPIRATION});
            logger.info({
                event: 'login_successful',
                email: user.email,
                message: 'Login realizado com sucesso',
            });
            res.status(200).json({message:'Login realizado com sucesso!', token });
        } catch (error) {
            logger.error({
                event: 'login_failed',
                error: error.message,
            });
            res.status(500).json({ error: "Erro ao realizar login." });
        }
    });
});

module.exports = router;