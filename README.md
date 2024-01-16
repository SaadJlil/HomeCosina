# HomeCocina API

Welcome to the HomeCocina API! Elevate your culinary experience with our Recipe Search API. Whether you're a cooking enthusiast or just seeking a delightful meal, HomeCocina allows you to explore and discover recipes tailored to your preferences. Search based on ingredients, calories, fat, sugar, and more to find the perfect recipe for your taste buds.

Embark on a culinary adventure with HomeCocina API and bring the joy of home-cooked meals to your fingertips. Let's get started on a flavorful journey!

# Technology Stack

HomeCocina API is built with a modern and robust technology stack, ensuring reliability, scalability, and ease of development.

## Backend Technologies

- **Node.js:** A JavaScript runtime for building scalable and efficient server-side applications.
- **Express.js:** A fast, unopinionated, minimalist web framework for Node.js, perfect for building RESTful APIs.
- **PostgreSQL:** A powerful, open-source relational database system, used to store and manage recipe data.
- **Prisma:** A modern database toolkit that acts as an ORM (Object-Relational Mapping) for Node.js and TypeScript, enhancing database access and management.
- **Non-ORM Solutions:** Leveraging non-ORM solutions where needed for flexibility and fine-grained control.

## Scripting and Automation

- **Bash:** Utilized for scripting and automation tasks, enhancing efficiency in various development processes.
- **Python:** Employed for seed scripting, facilitating the population of the database with initial data.

## API Architecture

- **RESTful and GraphQL:** Combining RESTful principles for traditional API endpoints and GraphQL for flexible and efficient queries.

## Authentication

- **JWT (JSON Web Tokens):** Providing secure and stateless authentication, allowing users to access their personalized recipe data.

## Server and Deployment

- **Nginx:** Used as a reverse proxy server to manage and optimize incoming traffic, enhancing performance.
- **Docker:** Containerization technology employed for consistent and portable deployment across different environments.

# Endpoints

As a consequence of using a microservice architecture, two endpoints are implemented: Auth and Mvp

## Auth: /auth

### Sign up (POST): /signup (https://domain/auth/signup)

#### Arguments:

- **Email:** The user needs to confirm their email before being able to create recipes. Hence, a confirmation link will be sent to the user's email.
- **Password:** The password must be of a certain complexity, otherwise an error will arise.
- **Username:** The user's username should be unique, otherwise an error will arise.
- **bio (optional):** User's bio.
- **profilepic (optional):** A base64 string of the user's profile picture.

#### code:

```javascript
const axios = require('axios');

const API_ENDPOINT = `https://your-domain.com/api/signup`;

const password = 'your-password'; // Replace with your actual password
const email = 'your-email@example.com'; // Replace with your actual email
const username = 'your-username'; // Replace with your actual username

const postData = {
  password: password,
  email: email,
  username: username
};

axios.post(API_ENDPOINT, postData, {
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(response => {
    if(response.success){
      console.log('Signup successful, Access token:', response.data.accessToken);
    }else{
      console.error('Signup failed');
  })
  .catch(error => {
    console.error('Signup failed');
  });
```

#### Expected Responses:

##### Success:

```json
{
    "success": true,
    "data": {
        "accessToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJoWWU0YnFpSmlVQnd3aUdpaXhhVHpLNGJLMjMiLCJyZWZyZXNoSWQiOiJjMmU0Y2RmYi0yNzhhLTQwYmUtOThkOC03ODhkOTU3N2NhZjEiLCJpYXQiOjE3MDUyODc1MzEsImV4cCI6MTcwNTU0NjczMSwic3ViIjoiYmhZZTRicWlKaVVCd3dpR2lpeGFUeks0YksyMyJ9.TAaitLHvndgZuy3WhxGAUvScHvEfNA-SfrbMcATyut9t67xR8mjR-WnxH11lY8dUeO7_R9-W8YD5cf8_6ptlPQ",
        "refreshToken": "c2e4cdfb-278a-40be-98d8-788d9577caf1::eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJoWWU0YnFpSmlVQnd3aUdpaXhhVHpLNGJLMjMiLCJpYXQiOjE3MDUyODc1MzEsImV4cCI6MTcwNjQ5NzEzMSwic3ViIjoiYmhZZTRicWlKaVVCd3dpR2lpeGFUeks0YksyMyJ9.LkPo87PueHytILu1N5ErF7GkhRD3plxZT46FmHS1IMu1V-rwS7ZzM-uMl6QRvCQTmdoNHByYrAol3oI36hZB5g",
        "userId": "bhYe4bqiJiUBwwiGiixaTzK4bK23"
    }
}
```

##### Failure:

```json
{
    "code": 400,
    "success": false,
    "errorType": "ClientError",
    "httpErrorMessage": "Bad Request",
    "message": "Problem with Email or Password",
    "errorStack": "Error Message"
}
```

### Sign in (POST): /signin (https://domain/auth/signin)

#### Arguments:

- **Email:** : The user needs to confirm their email before being able to create recipes. Hence, a confirmation link will be sent to the user's email.
- **Password**

#### Expected Responses:

##### Success:

```json
{
    "success": true,
    "data": {
        "accessToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJoWWU0YnFpSmlVQnd3aUdpaXhhVHpLNGJLMjMiLCJyZWZyZXNoSWQiOiJjMmU0Y2RmYi0yNzhhLTQwYmUtOThkOC03ODhkOTU3N2NhZjEiLCJpYXQiOjE3MDUyODc1MzEsImV4cCI6MTcwNTU0NjczMSwic3ViIjoiYmhZZTRicWlKaVVCd3dpR2lpeGFUeks0YksyMyJ9.TAaitLHvndgZuy3WhxGAUvScHvEfNA-SfrbMcATyut9t67xR8mjR-WnxH11lY8dUeO7_R9-W8YD5cf8_6ptlPQ",
        "refreshToken": "c2e4cdfb-278a-40be-98d8-788d9577caf1::eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJoWWU0YnFpSmlVQnd3aUdpaXhhVHpLNGJLMjMiLCJpYXQiOjE3MDUyODc1MzEsImV4cCI6MTcwNjQ5NzEzMSwic3ViIjoiYmhZZTRicWlKaVVCd3dpR2lpeGFUeks0YksyMyJ9.LkPo87PueHytILu1N5ErF7GkhRD3plxZT46FmHS1IMu1V-rwS7ZzM-uMl6QRvCQTmdoNHByYrAol3oI36hZB5g",
        "userId": "bhYe4bqiJiUBwwiGiixaTzK4bK23"
    }
}
```

### Log out (POST): /logout (https://domain/auth/logout)

#### Arguments:

- **Authentication Jwt Access Token**

#### code:

```javascript

const API_ENDPOINT = `https://domain/api/logout`;

const ACCESS_TOKEN = 'your-access-token';

fetch(API_ENDPOINT, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ACCESS_TOKEN}`
  }
})
  .then(response => {
    console.log(response);
  })
  
```
#### Expected response:

##### Success:

```json
{
    "success": true,
    "data": "You have been successfully logged out."
}
```

### Refresh Token (POST): /refresh-token (https://domain/auth/refresh-token)

#### Function:

This API endpoint generates short-lived access tokens and extends usability by issuing longer-lasting refresh tokens.

#### Arguments:

- **Refresh token**

#### Expected response:

##### Success:

```json
{
    "success": true,
    "data": {
        "accessToken": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJoWWU0YnFpSmlVQnd3aUdpaXhhVHpLNGJLMjMiLCJpYXQiOjE3MDUyOTg3ODIsImV4cCI6MTcwNTU1Nzk4Miwic3ViIjoiYmhZZTRicWlKaVVCd3dpR2lpeGFUeks0YksyMyJ9.irS0lDCXZFL3LNQMux4wyRxCfQteI_8FxyzlhEm8s5_uVK9YLVPIWg9GtwvpKGaxsxDRnCxu_4DU3wOyoyeqxg",
        "refreshToken": "cc6c5a76-5739-48b0-a5cb-888f7f0a36cc::eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJoWWU0YnFpSmlVQnd3aUdpaXhhVHpLNGJLMjMiLCJpYXQiOjE3MDUyOTg3ODIsImV4cCI6MTcwNjUwODM4Miwic3ViIjoiYmhZZTRicWlKaVVCd3dpR2lpeGFUeks0YksyMyJ9.UTsOo6G8bnbyiq7hLLhNHaiPefuua9Xfj--5gqb1Rtivye9x9IESQORKxid5RlVnnB5I2tGeLmbKHVJqZTgyHA"
    }
}
```

### getUserInfo (GET): /signup (https://domain/auth/getUserInfo)

#### Arguments:

- **User Id**

#### Expected response:

Apart from the userId, username, and bio, the API provides two cdn links to the profile's thumbnail picture and main/full picture with noticeable compositions: /${thumbnail-subcategory}/${userId} and /${main-subcategory}/${userId} Respectfully; as seen below.

##### Success:

```json
{
    "success": true,
    "data": {
        "userId": "kZtaxk7KvocAVBTsfNT7dj6TGey2",
        "username": "saad1223",
        "bio": "Welcome to my page. My name's Saad and I love to cook.",
        "mainImage": "https://f005.backblazeb2.com/file/your-domain-name/${thumbnail-subcategory}/m/kZtaxk7KvocAVBTsfNT7dj6TGey2",
        "thumbnailImage": "https://f005.backblazeb2.com/file/your-domain-name/${main-subcategory}/t/kZtaxk7KvocAVBTsfNT7dj6TGey2"
    }
}
```

### editUserInfo (POST): /editUserInfo (https://domain/auth/editUserInfo)

#### Function:

This API endpoint helps edit the user's info after having signed up.

#### Arguments:

- **Authentication Access Token**
- **Email (optional):** Warning: if the email is edited, another confirmation link will be sent to the user's new email address. And must be confirmed.
- **Password (optional)** 
- **Username (optional)**
- **bio (optional):** User's bio 
- **profilepic (optional):** A base64 string of the user's profile picture

#### Expected Responses:

##### Success:

```json
{
    "success": true,
    "data": {
        "userId": "bhYe4bqiJiUBwwiGiixaTzK4bK23"
    }
}
```
