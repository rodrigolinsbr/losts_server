const server = require('axios')

// Parametros  do test : [newUser , UpdatedUser]
describe.each([
    [{
        "email": "n3ov11231223o12EmailErrado%123",
        "password": "12",
        "name": "Bob Marley+",
        "cpf": "kkkk",
        "phone": "olokito 3"
    }, {
        "email": ":?12312323?1:@m1elhorcom.com.br",
        "password": "12!",
        "name": "Alex Sandro",
        "cpf": "111011012",
        "phone": "8989898989"
    }]
])(
'Testes CRUD, para o consumidor Final',
    (newUser, updatedUser) => {

        let token
        let userId 
        let userEmail
    
        const API = {
            baseUrl: 'https://obapet-userservice.herokuapp.com/api/users'
        }

        describe('Cria o consumidor Final com sucesso', () => {
            test('consumidor Final ainda nao cadastrado', async () => {
                const answer = await server.get(`${API.baseUrl}`)
                
                let users = answer.data.result.all
                let found = false
                for(user in users)
                    if(!users[user].isDeleted && users[user].email === newUser.email)
                            found = true;
                            
                expect(found).toBe(false)
            });
            
            test('cria consumidor Final com sucesso', async () => {

                const header = {
                    "Content-Type" : "application/json"
                }
                
                let answerCreateUser = await server.post(`${API.baseUrl}`, newUser, header)
                let user = answerCreateUser.data.result
        
                const answerGetUsers = await server.get(`${API.baseUrl}`)
        
                let users = answerGetUsers.data.result.all
                let userFound = false
                let userRepeted = false
        
                for(user in users) 
                    if(!users[user].isDeleted && users[user].name === newUser.name && users[user].email === newUser.email)
                        if(!userFound){
                            userFound = true
                        }else{
                            userRepeted = true
                        }
                expect(userFound && !userRepeted).toBe(true)
            });
        });
        describe('atualiza o consumidor Final com sucesso', () => {

            test('Gera um Token com sucesso' , async () => {
                
                var header = {
                    headers: newUser
                };
                
                let userFound = false
                let userRepeted = false

                let answerGetToken = await server.get(`${API.baseUrl}${'/generate_access_token'}`, header)
                token = answerGetToken.data.result.auth.access_token
                
                let answerGetUsers = await server.get(`${API.baseUrl}`)
                let users = answerGetUsers.data.result.all
                
                for(user in users)
                if( typeof users[user].auth !== "undefined" && users[user].email === newUser.email && token === users[user].auth.access_token)
                    if(!userFound){
                        userEmail = users[user].email
                        userId = users[user]._id
                        userFound = true
                    }else{
                        userRepeted = true
                    }

                expect(userFound && !userRepeted).toBe(true)
            });

            test('Atualizado o consumidor Final com sucesso' , async () => {

                header = {
                    headers : {
                        "username": "geoyIsacsa@melhorcom.com.br",
                        "access_token": token,
                        "Content-Type": "application/json"
                    }
                }

                let userFound = false
                let userRepeted = false
                let users

                let answer = await server.patch(`${API.baseUrl}${'/'+  userId}`,updatedUser , header)

                answerGetUsers = await server.get(`${API.baseUrl}`)

                users = answerGetUsers.data.result.all

                for(user in users)
                    if(!users[user].isDeleted && users[user].name === updatedUser.name && users[user].email === updatedUser.email)
                        if(!userFound){
                            userFound = true
                        }else{
                            userRepeted = true
                        }

                expect(userFound && !userRepeted).toBe(true)
            });
        });
        
        describe('deleta consumidor Final (atualizado anteriormente) com sucesso', () => {
            
            test('busca consumidor Final com sucesso', async () => {
                userFound = false
                userRepeted = false
        
                let answerGetUsers = await server.get(`${API.baseUrl}`)
                let users = answerGetUsers.data.result.all
        
                for(user in users)
                    if( typeof users[user].auth !== "undefined" && users[user].email === updatedUser.email && token === users[user].auth.access_token)
                        if(!userFound){
                            userEmail = users[user].email
                            userId = users[user]._id
                            userFound = true
                        }else{
                            userRepeted = true
                        }
        
                expect(userFound && !userRepeted).toBe(true)    
            })

            test('deleta o consumidor Final com sucesso', async () => {

                userFound = false

                header = {
                    headers: {
                        "username" : userEmail,
                        "access_token" : token
                    }
                };

                await server.delete(`${API.baseUrl}${'/'+  userId}`, header)

                answerGetUsers = await server.get(`${API.baseUrl}`)
                users = answerGetUsers.data.result.all

                for(user in users)
                    if(users[user].name === newUser.name && users[user].email === newUser.email)
                        userFound = true

                expect(userFound).toBe(false)
            });
        });

    },
);
