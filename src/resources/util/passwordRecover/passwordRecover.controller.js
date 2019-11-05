const PasswordRecoverRepository = require("./passwordRecover.repository");
const StorekeeperRepository = require("../../storekeeper/storekeeper.repository");
const UserRepository = require("../../user/user.repository");
const AdminRepository = require("../../admin/admin.repository");
const status = require("http-status");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const secret = 'secret';

/**
 * Função responsável por configurar o serviço de e-mail e enviar o token para recuperação da senha do usuário solicitante
 * @param {email do usuário para o qual será enviado o token} email 
 * @param {token gerado} token 
 * @param {*} response 
 */

async function sendEmail(email, token, response){ 
    console.log(email, token);
    let transporter = await nodemailer.createTransport({
        service: 'gmail',
        auth: { //adicionar uma conta válida para transportar os e-mails enviados
          user: '',
          pass: '' 
        }
    });
      
    let mailOptions = {
        from: 'naoresponda@gmail.com',
        to: email,
        subject: 'Recuperação de senha usuário Obapet',
        text: '',
        html: '<h3>Use o seguinte endereço para recuperar sua senha de acesso ao Obapet</h3><p>http://localhost:3002/api/passwordRecover/'  + token + '</p>'
    };
      
    await transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            response.status(status.INTERNAL_SERVER_ERROR).json({result: error, message: status["500_MESSAGE"]});
        } else {
            response.status(status.OK).json({ message: 'Email send to ' + email });
        }
    });
}

/**
 * Função responsável por buscar um usuário de acordo com o seu perfil de acesso
 * @param {usuário que solicitou a alteração da senha} user 
 */
async function getUserByProfile(user){
    const data = user;
    if(data.profile == "storekeeper"){
        data.user = await StorekeeperRepository.findStorekeeperByEmail(data.email);
    }else if(data.profile == "user"){
        data.user = await UserRepository.findUserByEmail(data.email);
    }else{
        data.user = await AdminRepository.findAdminByEmail(data.email);
    }
    return data;
}

/**
 * Essa função chama a função de alteração de acordo com o perfil do usuário requisitante
 * @param {Informações do usuário que terá a senha alterada. Tais informações são usadas para verificar o perfil do usuário e chamar a função de alteração correspondente} userInformations 
 * @param {Nova senha do usuário} newPassword 
 */

async function updateUserPasswordByProfile(userInformations, newPassword){
    console.log(userInformations.user);
    const user = userInformations.user;
    if(userInformations.profile == "storekeeper"){
        await StorekeeperRepository.bcryptSave(user.id, newPassword);
    }else if(userInformations.profile == "user"){
        await UserRepository.bcryptSave(user.id, newPassword);
    }else{
        await AdminRepository.bcryptSave(user.id, newPassword);
    }
}

/**
 * Gera o token com base em um tempo de expiração e um usuário pré-definidos 
 * @param {usuário q vai alterar a senha para que possa ser gerado o payload (informações do usuário encriptadas no token)} user 
 */
async function generateToken(user){
    const expirationDate = new Date(); 
    expirationDate.setHours(new Date().getHours() + 0.02); //hora atual mais o tempo de duração do token em horas

    const header = JSON.stringify({
        alg: 'HS256',
        typ: 'JWT'
    });
        
    const base64Header = Buffer.from(header)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    
    const payload = JSON.stringify({
        email: user.email,
        profile: user.profile,
        expiresIn: expirationDate.getTime()
    });
    
    const base64Payload = Buffer.from(payload)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    
    const data = base64Header + '.' + base64Payload;
    
    const signature = crypto
        .createHmac('sha256', secret)
        .update(data)
        .digest('base64');
    
    const signatureUrl = signature
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    
    const token = base64Header + '.' + base64Payload + '.' + signatureUrl;

    console.log(token.toString());
    
    return token;
}

/**
 * Decodifica o payload do token para saber as informações do usuário que requisitou a alteração da senha
 * @param {Token a ser decodificado} token 
 */
async function getPayload(token) { 
    let payload;  
    if (token) {
        payload = await jwt.decode(token);
    }else{
        response.status(status.NO_CONTENT).json({message: status["204_MESSAGE"]});
    }
    return payload;
}

/**
 * Altera a senha do usuário a nível de banco. Antes disso, verifica se o usuário está ativo.
 * @param {*} request 
 * @param {*} response 
 * @param {*} next 
 */

async function updatePassword(request, response, next){
    const token = request.params.token;
    if(token){
        getPayload(token.toString())
        .then(payload => {
            if(payload){
                getUserByProfile(payload)
                .then(user => {
                    console.log(user);
                    if(user.isActive){
                        updateUserPasswordByProfile(user, request.body.newPassword);
                        PasswordRecoverRepository.saveToken(request.params) //salva o token na 'lista nega'
                        .then(() => {
                            response.status(status.OK).json({Result: 'The password has been successfully recovered!', message: status["200_MESSAGE"]});
                        })
                        .catch(error => next(error));
                    }else{
                        response.status(status.BAD_REQUEST).json({result: 'The user is inactive!', message: status["400_MESSAGE"]})
                    }
                })
                .catch(error => next(error));
            }else{
                response.status(status.NO_CONTENT).json({message: status["204_MESSAGE"]});
            }
        })
        .catch(error => next(error));
    }else{
        response.status(status.NO_CONTENT).json({message: status["204_MESSAGE"]})
    }
}

module.exports = {

    /**
     * Gera um novo token e envia-o para o usuário que requisitou a alteração da senha
     * @param {*} request 
     * @param {*} response 
     * @param {*} next 
     */
    async new(request, response, next){
        console.log(request.body)
        await getUserByProfile(request.body)
        .then(user => {
            if(user){
                generateToken(user)
                .then(token => {
                    if(token){
                        console.log(token)
                        //sendEmail(user.email, token, response);
                    }else{
                        response.status(status.NOT_FOUND).json({result, message: status["404_MESSAGE"]});
                    }
                })
                .catch(error => next(error));
            }else{
                response.status(status.NOT_FOUND).json({result, message: status["404_MESSAGE"]});
            }
        })
        .catch(error => next(error));
    },

    /**
     * 
     * @param {Essa função é chamada quando o usuário acessa o link (que contém o token) que foi enviado para ele por e-mail. Antes de alterar a senha é verificado se o token já foi usado e se o mesmo está no prazo de validade  } request 
     * @param {*} response 
     * @param {*} next 
     */
    async update(request, response, next) {  
        const token = request.params.token;
        console.log(token);
        if (token) {
            await PasswordRecoverRepository.getOneToken(token) //pega o token na 'lista negra'. Se estiver nela, é pq já foi usado
            .then(invalidToken => {
                if(invalidToken.toString()){
                    response.status(status.INTERNAL_SERVER_ERROR).json({ result : invalidToken, message : 'Duplicate use of access token!'});
                }else{
                    jwt.verify(token, secret, function(err, decoded) {
                        if (new Date().getTime() >= decoded.expiresIn) { //verifica se o token já expirou
                            response.status(status.INTERNAL_SERVER_ERROR).json({ result: "Token Expiration Date: " + new Date(decoded.expiresIn), message: 'Sorry, token expired!' });
                        }else{
                            updatePassword(request, response, next); //Altera a senha do usuário
                        }
                    });
                }
            }).catch(error => next(error));
        }else{
            response.status(status.NOT_FOUND).json({message: status["404_MESSAGE"]});
        }
    },
    
    /**
     * Pega um token na lista negra
     * @param {*} request 
     * @param {*} response 
     * @param {*} next 
     */
    async getOne(request, response, next){
        PasswordRecoverRepository.getOneToken(request.params.token)
        .then(token => {
            if (token) {
              response.status(status.OK).json({result: token, message: status["200_MESSAGE"]});
            }else{
              response.status(status.NOT_FOUND).json({message: status["404_MESSAGE"]});
            }
          })
        .catch(error => next(error));
    },

    /**
     * Pega todos os tokens da lista negra
     * @param {*} request 
     * @param {*} response 
     * @param {*} next 
     */
    async getAll(request, response, next){
        PasswordRecoverRepository.getAllTokens()
        .then(tokens => {
            if (tokens) {
              response.status(status.OK).json({result: tokens, message: status["200_MESSAGE"]});
            }else{
              response.status(status.NOT_FOUND).json({message: status["404_MESSAGE"]});
            }
          })
        .catch(error => next(error));
    }
}
