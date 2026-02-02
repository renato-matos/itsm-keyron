const jwt=require("jsonwebtoken");
const SECRET_KEY=process.env.SECRET_KEY;

module.exports=(req,res,next)=>{
    const token=req.headers['authorization'];
    if(!token){
        return  res.status(401).json({error:"Token não fornecido."});
    }  

    try{
        const decoded=jwt.verify(token,SECRET_KEY);
        req.user=decoded; // Adiciona os dados do usuário decodificados à requisição
        next();
    }catch(err){
        return res.status(401).json({error:"Token inválido."});
    }
};