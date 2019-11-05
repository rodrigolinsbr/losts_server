const server = require('axios')

// Parametros  do test : [newUser , UpdatedUser]
describe.each([
    [{
        "fancy_name": "Dj Victor doidera2",  
          "cnpj": "12341231aa922",
          "phone":"9880877880",
          "email": "v1eas1dl121231231112211  ho@cabuloso.com.brxx",
          "address": {
              "street":"Rua Boa viagem",
              "number": "1000" ,
              "cep": "45454545",
                  "state": "Pernambuco"
          },
          "responsible": {
              "name":  "Miguel",
              "email":"rodrigoblabla@gmail.comx",
              "phone":"988087780"
          },
          "password":"1234567890",
          "email_confirmed": true,
          "email_hash": "hasemailaskahksax",
      "storekeeper_confirmed": true,
      "facade_photo_url": "urlx",
          "cnpj_photo_url": "urlx",
          "bankruptcy_certificate_url": "urlx",	
          "validation": {
                  "facade_photo_ok": true,
          "cnpj_ok": true,
                  "fancy_name_ok": true,
                  "business_name_ok": true,
                  "phone_ok": true,
                  "store_manager_name_ok": true, 
                  "email_ok": true,
                  "obs": true
          },
          "situation":"inactive",
          "isActive": true
  }
  , {
    "fancy_name": "Dj Victor doidera2",  
      "cnpj": "12341231aa922",
      "phone":"9880877880",
      "email": "novas123123da1sdbuloso.com.brxx",
      "address": {
          "street":"Rua Boa viagem",
          "number": "1000" ,
          "cep": "45454545",
              "state": "Pernambuco"
      },
      "responsible": {
          "name":  "Miguel",
          "email":"rodrigoblabla@gmail.comx",
          "phone":"988087780"
      },
      "password":"1234567890",
      "email_confirmed": true,
      "email_hash": "hasemailaskahksax",
  "storekeeper_confirmed": true,
  "facade_photo_url": "urlx",
      "cnpj_photo_url": "urlx",
      "bankruptcy_certificate_url": "urlx",	
      "validation": {
              "facade_photo_ok": true,
      "cnpj_ok": true,
              "fancy_name_ok": true,
              "business_name_ok": true,
              "phone_ok": true,
              "store_manager_name_ok": true, 
              "email_ok": true,
              "obs": true
      },
      "situation":"inactive",
      "isActive": true
}
]
])(
'Testes CRUD, para o lojista',
    (newUser, updatedUser) => {

        let token
        let userId 
        let userEmail
    
        const API = {
            baseUrl: 'https://obapet-userservice.herokuapp.com/api/storekeepers'
        }

        describe('Cria o lojista com sucesso', () => {
            test('lojista ainda não cadastrado', async () => {

                const header = {
                    "Content-Type" : "application/json",
                    "fancy_name" : newUser.fancy_name,
                    "access_token" : token
                }

                const answer = await server.get(`${API.baseUrl}`, header)
                
                let users = answer.data.result.all
                let found = false
                for(user in users)
                    if(!users[user].isDeleted && users[user].email === newUser.email)
                            found = true;
                            
                expect(found).toBe(false)
            });
            
            test('cria lojista com sucesso', async () => {

                let header = {
                    "Content-Type" : "application/json"
                }
                
                let answerCreateUser = await server.post(`${API.baseUrl}`, newUser, header)
                let user = answerCreateUser.data.result
        
                header = {
                    "Content-Type" : "application/json",
                    "fancy_name" : newUser.fancy_name,
                    "access_token" : token
                }

                const answerGetUsers = await server.get(`${API.baseUrl}`, header)
        
                let users = answerGetUsers.data.result.all
                let userFound = false
                let userRepeted = false
        
                for(user in users) 
                    if(!users[user].isDeleted && users[user].fancy_name === newUser.fancy_name && users[user].email === newUser.email)
                        if(!userFound){
                            userFound = true
                        }else{
                            userRepeted = true
                        }
                expect(userFound && !userRepeted).toBe(true)
            });
        });
        describe('atualiza o lojista com sucesso', () => {

            test('Gera um Token com sucesso' , async () => {
                
                let header = {
                    headers: newUser
                };
                
                let userFound = false
                let userRepeted = false

                let answerGetToken = await server.get(`${API.baseUrl}${'/generate_access_token'}`, header)
                token = answerGetToken.data.result.auth.access_token
                
                header = {
                    "Content-Type" : "application/json",
                    "fancy_name" : newUser.fancy_name,
                    "access_token" : token
                }

                let answerGetUsers = await server.get(`${API.baseUrl}`, header)
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

            test('Atualizado o lojista com sucesso' , async () => {

                let header = {
                    "name": newUser.fancy_name,
                    "access_token": token,
                    "Content-Type": "application/json"
                }

                let userFound = false
                let userRepeted = false
                let users

                let answer = await server.patch(`${API.baseUrl}${'/'+  userId}`,updatedUser , header)

                header = {
                    "Content-Type" : "application/json",
                    "fancy_name" : newUser.fancy_name,
                    "access_token" : token
                }

                answerGetUsers = await server.get(`${API.baseUrl}`, header)

                users = answerGetUsers.data.result.all
                
                for(user in users)
                    if(!users[user].isDeleted && users[user].fancy_name === updatedUser.fancy_name && users[user].email === updatedUser.email)
                        if(!userFound){
                            userFound = true
                        }else{
                            userRepeted = true
                        }

                expect(userFound && !userRepeted).toBe(true)
            });
        });
        
        describe('deleta lojista (atualizado anteriormente) com sucesso', () => {
            
            test('busca lojista com sucesso', async () => {
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

            test('deleta o lojista com sucesso', async () => {

                userFound = false

                header = {
                    headers: {
                        "username" : updatedUser.email,
                        "access_token" : token
                    }
                };

                await server.delete(`${API.baseUrl}${'/'+  userId}`, header)

                answerGetUsers = await server.get(`${API.baseUrl}`)
                users = answerGetUsers.data.result.all

                for(user in users)
                    if(users[user].fancy_name === newUser.name && users[user].email === newUser.email)
                        userFound = true

                expect(userFound).toBe(false)
            });
        });

    },
);
