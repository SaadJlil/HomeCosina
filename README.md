# HomeCocina API

Welcome to HomeCocina API—a versatile tool for culinary enthusiasts and researchers alike. Our sophisticated Recipe Search API caters to specific preferences, allowing you to discover diverse recipes based on ingredients, calories, and more, refining your culinary experience.

Join us on this culinary adventure, where HomeCocina not only redefines how you approach exceptional meals but also contributes valuable insights to the evolving world of culinary research.

## Summary

- **Technology Stack:** Backend, scripting, API architecture, authentication, server, and deployment.

- **Get Started:** Steps to install the API in your server.

- **Endpoints:** Authentication, User Info, Main API (graphql), Auto-complete Suggestions, and Search.

- **Status Codes:** Status codes sent by the API.

## Technology Stack

HomeCocina API is built with a modern and robust technology stack, ensuring reliability, scalability, and ease of development.

### Backend Technologies

- **Node.js:** A JavaScript runtime for building scalable and efficient server-side applications.
- **Express.js:** A fast, unopinionated, minimalist web framework for Node.js, perfect for building RESTful APIs.
- **PostgreSQL:** A powerful, open-source relational database system, used to store and manage recipe data.
- **Prisma:** A modern database toolkit that acts as an ORM (Object-Relational Mapping) for Node.js and TypeScript, enhancing database access and management.
- **Non-ORM Solutions:** Leveraging non-ORM solutions where needed for flexibility and fine-grained control.

### Scripting and Automation

- **Bash:** Utilized for scripting and automation tasks, enhancing efficiency in various development processes.
- **Python:** Employed for seed scripting, facilitating the population of the database with initial data.

### API Architecture

- **RESTful and GraphQL:** Combining RESTful principles for traditional API endpoints and GraphQL for flexible and efficient queries.

### Authentication

- **JWT (JSON Web Tokens):** Providing secure and stateless authentication, allowing users to access their personalized recipe data.

### Server and Deployment

- **Nginx:** Used as a reverse proxy server to manage and optimize incoming traffic, enhancing performance.
- **Docker:** Containerization technology employed for consistent and portable deployment across different environments.

## Get Started:

Using Linux would make it easier to run the API (running the runContainer.sh file). However, it is possible to run the API using both Windows and MacOs.

### Clone the Repository
Start by cloning the HomeCocina repository to your local machine:

```bash
git clone https://github.com/SaadJlil/HomeCosina
cd HomeCocina
```

## Docker
### Windows:
#### Docker Desktop:

**Docker Desktop** is the preferred way to install Docker on Windows.

Download Docker Desktop from the official Docker website: Docker Desktop for Windows.
Follow the installation instructions provided by the installer.

### Windows Subsystem for Linux (WSL 2):

If you are using **Windows 10 Home** or an older version that does not support Docker Desktop, you can use WSL 2.
Install WSL 2 following the official Microsoft documentation: Install WSL 2.
After installing WSL 2, follow the instructions for installing Docker Desktop on WSL 2.

### macOS:

#### Docker Desktop for Mac:
Download Docker Desktop for Mac from the official Docker website: Docker Desktop for Mac.
Follow the installation instructions provided by the installer.

### Linux:
#### Docker Engine:

For most Linux distributions, you can install Docker Engine using the package manager specific to your distribution (e.g., apt for Debian/Ubuntu, yum for CentOS, etc.).
Follow the instructions for your specific distribution on the official Docker website: Get Docker.

#### Verify Installation:
After installation, you can verify that Docker is installed correctly by running the following commands in your terminal or command prompt:

```bash
#Copy code
docker --version
docker run hello-world
```

The first command should display the installed Docker version, and the second command should run a simple container (hello-world) to ensure that Docker is working properly.

## Finish the installation:

Make sure you are equipped with .env files for both the AuthIdt and Mvp microservices. These environment files must contain the following: firebase auth JSON file location, emailjs credentials, postgres database/shadow database link, etc... Per request, I might share a mock of the .env files 

### Linux:

If you're using Linux you can run the ./runContainer.sh (make sure you're in the HomeCosina folder) as follows: 

```bash
sudo chmod +x ./runContainer.sh
sudo ./runContainer.sh
```

### Windows + macOS:

The Docker container functions on both Windows and macOS. Linux users can streamline the process by executing the provided script. However, Windows and macOS users must independently establish a reverse proxy (e.g., Nginx) for mapping HTTPS ports and endpoints to the Docker container. Additionally, users on these platforms need to configure their respective firewalls – Windows Defender Firewall for Windows and pf for macOS – or choose third-party firewall solutions. This secures the required ports for optimal functionality. 

# Endpoints

As a consequence of using a microservice architecture, two sub endpoints are implemented: Auth and Mvp

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


## Mvp (main Api): /graphql 

### Mutations

### CreateRecipe (POST): (https://domain/graphql)

#### Arguments:

```js 
const CreateRecipeType = `#graphql
    input Args_CreateRecipe{
        steps: [String!]!
        title: String!
        link: [String!]
        cookingtime_min: Int!

        ingredients_id: [ID!]!

        tags: [String!]

        units: [String!]!
        values: [Int!]!
        valuesingram: [Float!]!

        image: String

    }
`
```

- **Authentication Access Token**
- **steps:** A list of strings describing the steps it takes to finish the recipe
- **title**
- **links (optional):** Links to other websites featuring the same recipe
- **cooking time:** Total cooking time of the recipe
- **tags (optional)**
- **image (optional):** A base64 string picture of the recipe.
  
- **ingredient IDs:** A list of strings containing the ingredients necessary for the recipe (The ID must be present in the database)
- **units:** From oz. to kg, the units are composed of the respective measurement units of the ingredients 
- **values:** A list of the ingredients units' respective values (Example: 2 (value) liters (unit) of milk (ingredient))  
- **values in grams:** A conversion to grams of the values above.



#### code:

```javascript
const authToken = 'your-access-token'; 
const graphqlEndpoint = 'https://domain/graphql';

const createRecipeArgs = {
  steps: ["1", "2"],
  title: "title that thing",
  link: ["www.link.com"],
  cookingtime_min: 2,
  recipe_imageurl: "image",
  ingredients_id: ["red apple", "apple"],
  tags: ["firsttag", "thing"],
  units: ["oz.", "oz."],
  values: [2, 1],
  valuesingram: [3.0, 4.0]
};

// Mutation to create a recipe
fetch(graphqlEndpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`,
  },
  body: JSON.stringify({
    query: `
      mutation createRecipe($createRecipeArgs: Args_CreateRecipe!) {
        CreateRecipe(createRecipeArgs: $createRecipeArgs)
      }
    `,
    variables: {
      createRecipeArgs: createRecipeArgs,
    },
  }),
})
  .then(response => response.json())
  .then(data => {
    const createdRecipe = data.data.CreateRecipe;
    console.log(createdRecipe);
  })
  .catch(error){
    console.log(data);
  }
```

#### Expected Responses:

##### Success:

Returns the ID of the created recipe

```json
{
    "data": {
        "CreateRecipe": "69a101e4-1100-4720-afef-036c8c3140de"
    }
}
```

##### Failure:

```json
{
    "errors": [
        {
            "status": 400,
            "errorStructure": {
                "code": 400,
                "errorType": "ClientError",
                "httpErrorMessage": "Bad Request",
                "message": "Picture is not valid"
            }
        }
    ],
    "data": null
}
```

### EditRecipe (POST): (https://domain/graphql)

#### Arguments:

The EditRecipe endpoint creates a new recipe with the same recipe ID. It does that by deleting the original recipe, and then creating a new one using the arguments given (with the same ID)

```js 
const EditRecipeType = `#graphql
    input Args_EditRecipe{
        recipe_id: ID!
        steps: [String!]!
        title: String!
        link: [String!]
        cookingtime_min: Int!

        ingredients_id: [ID!]!

        tags: [String!]

        units: [String!]!
        values: [Int!]!
        valuesingram: [Float!]!

        image: String

    }
`

```

- **Authentication Access Token**
- **recipe_id:** 
- **steps:** A list of strings describing the steps it takes to finish the recipe
- **title**
- **links (optional):** Links to other websites featuring the same recipe
- **cooking time:** Total cooking time of the recipe
- **tags (optional)**
- **image (optional):** A base64 string picture of the recipe.
  
- **ingredient IDs:** A list of strings containing the ingredients necessary for the recipe (The ID must be present in the database)
- **units:** From oz. to kg, the units are composed of the respective measurement units of the ingredients 
- **values:** A list of the ingredients units' respective values (Example: 2 (value) liters (unit) of milk (ingredient))  
- **values in grams:** A conversion to grams of the values above.


#### Expected Responses:

##### Success:

Returns the ID of the edited recipe

```json
{
    "data": {
        "EditRecipe": "69a101e4-1100-4720-afef-036c8c3140de"
    }
}
```

##### Failure:

```json
{
    "errors": [
        {
            "status": 401,
            "errorStructure": {
                "code": 401,
                "errorType": "ClientError",
                "httpErrorMessage": "Unauthorized",
                "message": "Refresh token invalid or expired\n"
            }
        }
    ],
    "data": null
}
```

### DeleteRecipe (POST): (https://domain/graphql)

#### Arguments:

```js 
DeleteRecipe(recipe_id: ID!): ID!
```

- **Authentication Access Token**
- **recipe_id**


#### Expected Responses:

##### Success:

Returns the ID of the deleted recipe

```json
{
    "data": {
        "DeleteRecipe": "01dd8dc4-759f-4fa6-9e15-87153dbe3615"
    }
}
```

##### Failure:

```json
{
    "errors": [
        {
            "status": 500,
            "errorStructure": {
                "code": 500,
                "errorType": "AppError",
                "message": "Internal Server Error"
            }
        }
    ],
    "data": null
}
```

### VoteRecipe (POST): (https://domain/graphql)

Upvote or Downvote a recipe

#### Arguments:

```js 
VoteRecipe(recipe_id: ID!, vote_value: Boolean!): ID!
```

- **Authentication Access Token**
- **recipe_id**
- **vote_value:** A boolean determining if the recipe will be upvoted (True) or Downvoted (False)

#### Expected Responses:

##### Success:

Returns the ID of the recipe

```json
{
    "data": {
        "VoteRecipe": "8bf7fcd6-8425-4b29-8804-dd64fe210c33"
    }
}
```

##### Failure:

```json
{
    "errors": [
        {
            "status": 401,
            "errorStructure": {
                "code": 401,
                "errorType": "ClientError",
                "httpErrorMessage": "Unauthorized",
                "message": "Refresh token invalid or expired\n"
            }
        }
    ],
    "data": null
}
```

### Queries

### GetRecipeById (POST): (https://domain/graphql)

#### Arguments:

- **recipe_id**

#### Returns:

The user may choose which of the following parameters to be returned by the API.

```js
const GetRecipeByIdType = `#graphql
    type Return_GetRecipeById {

        #ingredient data
        ing_imgurl: [String]
        presentedstring: [String!],
        unit: [String],
        value: [Int],
        valueingram: [Float],
        ingredient_name: [String!]!,
        calories: [Float!]! // Number of calories for each ingredient
        total_fat: [Float!]! // total fat per ingredient
        sat_fat: [Float!]!
        protein: [Float!]!
        sodium: [Float!]!
        potassium: [Float!]!
        cholestrol: [Float!]!
        carbohydrates: [Float!]!
        fiber: [Float!]!
        sugar: [Float!]!
        category: [Float!]!

        #user data
        userid: ID!


        #nutrition
        r_calories: Float! // Total calories per 100g of the recipe
        r_total_fat: Float! // Total fat per 100g of the recipe
        r_sat_fat: Float!
        r_protein: Float!
        r_sodium: Float!
        r_potassium: Float!
        r_cholestrol: Float!
        r_carbohydrates: Float!
        r_fiber: Float!
        r_sugar: Float!


        #recipe data
        recipe_id: ID!
        steps: [String!]!
        date: String!
        title: String!
        link: [String!]
        cookingtime_min: Int!
        views: Int!
        votes: Int!
        recipe_imgurl: String



    }
`
```



#### code:

```javascript
const graphqlEndpoint = 'https://domain/graphql';


// Mutation to create a recipe
fetch(graphqlEndpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: `
      query recipeQuery($recipe_id: ID!){
        GetRecipeById(recipe_id: $recipe_id){
		      title
          recipe_id,
          presentedstring,
          steps,
          ingredient_name,
          recipe_imgurl,
          votes,
          views,
          userid,
          r_calories
	      }
      }
    `,
    variables: {
      recipe_id: "8bf7fcd6-8425-4b29-8804-dd64fe210c33",
    },
  }),
})
  .then(response => response.json())
  .then(data => {
    const createdRecipe = data.data.GetRecipeById;
    console.log(createdRecipe);
  })
  .catch(error => {
    console.log(data);
  })

```

#### Expected Responses:

##### Success:

```json
{
    "data": {
        "GetRecipeById": {
            "title": "title that thing",
            "recipe_id": "8bf7fcd6-8425-4b29-8804-dd64fe210c33",
            "presentedstring": [
                "2 oz.",
                "1 oz."
            ],
            "steps": [
                "1",
                "2"
            ],
            "ingredient_name": [
                "red apple",
                "apple"
            ],
            "recipe_imgurl": "https://f005.backblazeb2.com/file/HomeCosina/RecipePic/m/8bf7fcd6-8425-4b29-8804-dd64fe210c33",
            "votes": -1,
            "views": 2,
            "userid": "juTfVsq4j3SocWNXrj4CWRZT1c32",
            "r_calories": 52.82857142857143
        }
    }
}
```

##### Failure:

```json
{
    "errors": [
        {
            "status": 400,
            "errorStructure": {
                "code": 400,
                "errorType": "ClientError",
                "httpErrorMessage": "Bad Request",
                "message": "Wrong Recipe Id"
            }
        }
    ],
    "data": null
}
```

### GetIngredientById (POST): (https://domain/graphql)

#### Query:

```js
query recipeQuery($ingredient_name: ID!){
    GetIngredientById(ingredient_name: $ingredient_name){
        ingredient_name,
        ing_imageurl,
        calories,
        total_fat,
        sat_fat,
        protein,
        sodium,
        potassium,
        cholestrol,
        carbohydrates,
        fiber,
        sugar,
        category
    }
}
```

#### Arguments:

- **ingredient_name:** Example: milk.

#### Returns:

The user may choose which of the following parameters to be returned by the API.

```js
const GetIngredientByIdType = `#graphql
    type Return_GetIngredientById {

        #ingredient data
        ingredient_name: String!
        ing_imageurl: String
        calories: Float!
        total_fat: Float!
        sat_fat: Float!
        protein: Float!
        sodium: Float!
        potassium: Float!
        cholesterol: Float!
        carbohydrates: Float!
        fiber: Float!
        sugar: Float!
        category: Float!

    }
`
```


#### Expected Responses:

##### Success:

```json
{
    "data": {
        "GetIngredientById": {
            "ingredient_name": "garlic",
            "ing_imageurl": null,
            "calories": 144.8,
            "total_fat": 0.7,
            "sat_fat": 0,
            "protein": 6.4,
            "sodium": 16,
            "potassium": 153
        }
    }
}
```

##### Failure:

```json
{
    "errors": [
        {
            "status": 500,
            "errorStructure": {
                "code": 500,
                "errorType": "AppError",
                "message": "Internal Server Error"
            }
        }
    ],
    "data": null
}
```

## Auto-complete Suggestions:

### SearchSuggestionsRecipe (POST): (https://domain/graphql)

This endpoint provides user suggestions for "strings"/recipes. The use of pagination, while non-standard for search suggestions, offers flexibility for possible future implementations, supporting adaptability and enhanced user experiences.

#### Query:

```js
query ingredientQuery($Query: String!, $page_nb: Int!, $row_nb: Int!){
    SearchSuggestionsRecipe(Query: $Query, page_nb: $page_nb, row_nb: $row_nb)
}
```

#### Arguments:

- **Query**
- **page_nb:** pagination: the number of the page the user is interested in
- **row_nb:** Number of recipes per page

#### Returns:       

String list


#### Expected Responses:

##### Success:

```json
{
    "data": {
        "SearchSuggestionsRecipe": [
            "apple pie",
            "apple pie ham",
            "apple pie cake",
            "apple pie cake ",
            "apple pie crust",
            "apple pie goody",
            "apple pie spice",
            "apple pie deluxe",
            "apple pie in bag",
            "apple pie brownie",
            "apple pie cobbler"
        ]
    }
}
```

##### Failure:

```json
{
    "errors": [
        {
            "status": 500,
            "errorStructure": {
                "code": 500,
                "errorType": "AppError",
                "message": "Internal Server Error"
            }
        }
    ],
    "data": {
        "SearchSuggestionsRecipe": null
    }
}
```

###  (POST): (https://domain/graphql)

This endpoint provides user suggestions for ingredients. The use of pagination, while non-standard for search suggestions, offers flexibility for possible future implementations, supporting adaptability and enhanced user experiences.

#### Query:

```js
query ingredientQuery($Query: String!, $page_nb: Int!, $row_nb: Int!){
    SearchIngredientsByQuery(Query: $Query, page_nb: $page_nb, row_nb: $row_nb){
        ingredient_name
    }
}
```

#### Arguments:

- **Query**
- **page_nb:** pagination: the number of the page the user is interested in
- **row_nb:** Number of recipes per page

#### Returns:       

```js
const SearchIngredientType = `#graphql
    type Return_SearchIngredients {

        #ingredient data
        ingredient_name: String!
        ing_imageurl: String //Thumbnail picture
        calories: Float!
        total_fat: Float!
        sat_fat: Float!
        protein: Float!
        sodium: Float!
        potassium: Float!
        cholestrol: Float!
        carbohydrates: Float!
        fiber: Float!
        sugar: Float!
        category: Float!

    }
`
```


#### Expected Responses:

##### Success:

```json
{
    "data": {
        "SearchIngredientsByQuery": [
            {
                "ingredient_name": "meat"
            },
            {
                "ingredient_name": "meatloaf"
            },
            {
                "ingredient_name": "meatballs"
            },
            {
                "ingredient_name": "meat sauce"
            },
            {
                "ingredient_name": "meat sauce"
            },
            {
                "ingredient_name": "beet"
            },
            {
                "ingredient_name": "pear"
            }
        ]
    }
}
```

##### Failure:

```json
{
    "errors": [
        {
            "status": 400,
            "errorStructure": {
                "code": 400,
                "errorType": "ClientError",
                "httpErrorMessage": "Bad Request",
                "message": "Row volume must be between 1 and 30"
            }
        }
    ],
    "data": {
        "SearchIngredientsByQuery": null
    }
}
```

## Search:

### GetUserRecipes (POST): (https://domain/graphql)

This endpoint shows several recipes uploaded by a user. CDN images follow an obvious pattern (optimizing the user experience is beyond possible in this case). 

#### Query:

```js
query recipeQuery($userid: ID!, $page_nb: Int!, $row_nb: Int!){
    GetUserRecipes(user_id: $userid, page_nb: $page_nb, row_nb: $row_nb){
        recipe_id,
        r_calories,
        recipe_imgurl
    }
}
```

#### Arguments:

- **user_id**
- **page_nb:** pagination: the number of the page the user is interested in
- **row_nb:** Number of recipes per page

#### Returns:

The user may choose which of the following parameters to be returned by the API.

```js
const GetUserRecipesType = `#graphql
    type Return_GetUserRecipes {

        #ingredient data
        ing_imgurl: [String] //thumbnail image CDN url
        presentedstring: [String!]
        unit: [String]
        value: [Int]
        valueingram: [Float]
        ingredient_name: [String!]!
        calories: [Float!]!
        total_fat: [Float!]!
        sat_fat: [Float!]!
        protein: [Float!]!
        sodium: [Float!]!
        potassium: [Float!]!
        cholestrol: [Float!]!
        carbohydrates: [Float!]!
        fiber: [Float!]!
        sugar: [Float!]!
        category: [Float!]!

        #user data
        userid: ID!


        #nutrition
        r_calories: Float!
        r_total_fat: Float!
        r_sat_fat: Float!
        r_protein: Float!
        r_sodium: Float!
        r_potassium: Float!
        r_cholestrol: Float!
        r_carbohydrates: Float!
        r_fiber: Float!
        r_sugar: Float!



        #recipe data
        recipe_id: ID!
        steps: [String!]!
        date: String!
        title: String!
        link: [String!]
        cookingtime_min: Int!
        views: Int!
        votes: Int!
        recipe_imgurl: String //thumbnail image CDN url

    }
`
```


#### Expected Responses:

##### Success:

```json
{
    "data": {
        "GetUserRecipes": [
            {
                "recipe_id": "34a2b5aa-e5ec-41b0-a771-bef85b764786",
                "r_calories": 52.82857142857143,
                "recipe_imgurl": ""
            },
            {
                "recipe_id": "6498f8c8c0c4a304b56a1a71",
                "r_calories": 237.259292492134,
                "recipe_imgurl": null
            },
            {
                "recipe_id": "6498f8ddc0c4a304b56a1a9d",
                "r_calories": 348.43575295572316,
                "recipe_imgurl": null
            }
        ]
    }
}
```

##### Failure:

```json
{
    "errors": [
        {
            "status": 500,
            "errorStructure": {
                "code": 500,
                "errorType": "AppError",
                "message": "Internal Server Error"
            }
        }
    ],
    "data": {
        "GetUserRecipes": null
    }
}
```

### SearchRecipesByIng (POST): (https://domain/graphql)

This endpoint searches for recipes with certain ingredients suggested by the user.

#### Query:

```js
query recipeQuery($Ingredients: [String!]!, $page_nb: Int!, $row_nb: Int!){
    SearchRecipesByIng(Ingredients: $Ingredients, page_nb: $page_nb, row_nb: $row_nb){
        recipe_id,
        title,
        ingredient_name,
        votes,
        recipe_imgurl,
        r_calories
    }
}
```

#### Arguments:

- **Ingredients:** Ingredient IDs
- **page_nb:** pagination: the number of the page the user is interested in
- **row_nb:** Number of recipes per page

#### Returns:

The user may choose which of the following parameters to be returned by the API.

```js
const SearchRecipesType = `#graphql
    type Return_SearchRecipes {

        #ingredient data
        ing_imgurl: [String] //thumbnail CDN url
        presentedstring: [String!]
        unit: [String]
        value: [Int]
        valueingram: [Float]
        ingredient_name: [String!]!
        calories: [Float!]!
        total_fat: [Float!]!
        sat_fat: [Float!]!
        protein: [Float!]!
        sodium: [Float!]!
        potassium: [Float!]!
        cholestrol: [Float!]!
        carbohydrates: [Float!]!
        fiber: [Float!]!
        sugar: [Float!]!
        category: [Float!]!

        #user data
        userid: ID!

        #nutrition
        r_calories: Float!
        r_total_fat: Float!
        r_sat_fat: Float!
        r_protein: Float!
        r_sodium: Float!
        r_potassium: Float!
        r_cholestrol: Float!
        r_carbohydrates: Float!
        r_fiber: Float!
        r_sugar: Float!


        #recipe data
        recipe_id: ID!
        steps: [String!]!
        date: String!
        title: String!
        link: [String!]
        cookingtime_min: Int!
        views: Int!
        votes: Int!
        recipe_imgurl: String //thumbnail CDN url


        vote: Int!

    }
`
```


#### Expected Responses:

##### Success:

```json
{
    "data": {
        "SearchRecipesByIng": [
            {
                "recipe_id": "6499d6715cd777aed2795cde",
                "title": "one crust apple pie",
                "ingredient_name": [
                    "flour",
                    "apple",
                    "sugar"
                ],
                "votes": 0,
                "recipe_imgurl": null,
                "r_calories": 172.59774615433324
            },
            {
                "recipe_id": "649926f25cd777aed276b946",
                "title": "9 or 10-inch double pie crust",
                "ingredient_name": [
                    "salt",
                    "flour",
                    "sugar",
                    "water"
                ],
                "votes": 0,
                "recipe_imgurl": null,
                "r_calories": 273.1031286997458
            },
            {
                "recipe_id": "649a75e93bbc5a60559972c5",
                "title": "baked apples ",
                "ingredient_name": [
                    "salt",
                    "water",
                    "apple",
                    "sugar"
                ],
                "votes": 0,
                "recipe_imgurl": null,
                "r_calories": 82.01973684210527
            }
        ]
    }
}
```

##### Failure:

```json
{
    "errors": [
        {
            "status": 400,
            "errorStructure": {
                "code": 400,
                "errorType": "ClientError",
                "httpErrorMessage": "Bad Request",
                "message": "Row volume must be between 1 and 30"
            }
        }
    ],
    "data": {
        "SearchRecipesByIng": null
    }
}
```

### SearchRecipesByQuery (POST): (https://domain/graphql)

This endpoint searches for recipes using a Query.

#### Query:

```js
query recipeQuery($Query: String!, $page_nb: Int!, $row_nb: Int!){
    SearchRecipesByQuery(Query: $Query, page_nb: $page_nb, row_nb: $row_nb){
        recipe_id,
        title
    }
}
```

#### Arguments:

- **Query** 
- **page_nb:** pagination: the number of the page the user is interested in
- **row_nb:** Number of recipes per page

#### Returns:

The user may choose which of the following parameters to be returned by the API.

```js
const SearchRecipesType = `#graphql
    type Return_SearchRecipes {

        #ingredient data
        ing_imgurl: [String] //thumbnail CDN url
        presentedstring: [String!]
        unit: [String]
        value: [Int]
        valueingram: [Float]
        ingredient_name: [String!]!
        calories: [Float!]!
        total_fat: [Float!]!
        sat_fat: [Float!]!
        protein: [Float!]!
        sodium: [Float!]!
        potassium: [Float!]!
        cholestrol: [Float!]!
        carbohydrates: [Float!]!
        fiber: [Float!]!
        sugar: [Float!]!
        category: [Float!]!

        #user data
        userid: ID!

        #nutrition
        r_calories: Float!
        r_total_fat: Float!
        r_sat_fat: Float!
        r_protein: Float!
        r_sodium: Float!
        r_potassium: Float!
        r_cholestrol: Float!
        r_carbohydrates: Float!
        r_fiber: Float!
        r_sugar: Float!


        #recipe data
        recipe_id: ID!
        steps: [String!]!
        date: String!
        title: String!
        link: [String!]
        cookingtime_min: Int!
        views: Int!
        votes: Int!
        recipe_imgurl: String //thumbnail CDN url


        vote: Int!

    }
`
```


#### Expected Responses:

##### Success:

```json
{
    "data": {
        "SearchRecipesByQuery": [
            {
                "recipe_id": "649955835cd777aed27763eb",
                "title": "cranberry-grape salad"
            },
            {
                "recipe_id": "649995945cd777aed278663a",
                "title": "sugar cure for meat"
            },
            {
                "recipe_id": "649976885cd777aed277db80",
                "title": "creole meat seasoning"
            }
        ]
    }
}
```

##### Failure:

```json
{
    "errors": [
        {
            "status": 400,
            "errorStructure": {
                "code": 400,
                "errorType": "ClientError",
                "httpErrorMessage": "Bad Request",
                "message": "Row volume must be between 1 and 30"
            }
        }
    ],
    "data": {
        "SearchRecipesByQuery": null
    }
}
```



### SearchRecipesByQueryIng (POST): (https://domain/graphql)

This endpoint searches for recipes using both the query and ingredients.

#### Query:

```js
query recipeQuery($Query: String!, $Ingredients: [String!]!, $page_nb: Int!, $row_nb: Int!){
    SearchRecipesByQueryIng(Query: $Query, Ingredients: $Ingredients, page_nb: $page_nb, row_nb: $row_nb){
        recipe_id,
        title,
        ingredient_name
    }
}
```

#### Arguments:

- **Query**
- **Ingredients:** Ingredient IDs
- **page_nb:** pagination: the number of the page the user is interested in
- **row_nb:** Number of recipes per page

#### Returns:

The user may choose which of the following parameters to be returned by the API.

```js
const SearchRecipesType = `#graphql
    type Return_SearchRecipes {

        #ingredient data
        ing_imgurl: [String] //thumbnail CDN url
        presentedstring: [String!]
        unit: [String]
        value: [Int]
        valueingram: [Float]
        ingredient_name: [String!]!
        calories: [Float!]!
        total_fat: [Float!]!
        sat_fat: [Float!]!
        protein: [Float!]!
        sodium: [Float!]!
        potassium: [Float!]!
        cholestrol: [Float!]!
        carbohydrates: [Float!]!
        fiber: [Float!]!
        sugar: [Float!]!
        category: [Float!]!

        #user data
        userid: ID!

        #nutrition
        r_calories: Float!
        r_total_fat: Float!
        r_sat_fat: Float!
        r_protein: Float!
        r_sodium: Float!
        r_potassium: Float!
        r_cholestrol: Float!
        r_carbohydrates: Float!
        r_fiber: Float!
        r_sugar: Float!


        #recipe data
        recipe_id: ID!
        steps: [String!]!
        date: String!
        title: String!
        link: [String!]
        cookingtime_min: Int!
        views: Int!
        votes: Int!
        recipe_imgurl: String //thumbnail CDN url


        vote: Int!

    }
`
```


#### Expected Responses:

##### Success:

```json
{
    "data": {
        "SearchRecipesByQueryIng": [
            {
                "recipe_id": "649a75e93bbc5a60559972c5",
                "title": "baked apples ",
                "ingredient_name": [
                    "salt",
                    "water",
                    "apple",
                    "sugar"
                ]
            },
            {
                "recipe_id": "649957a35cd777aed2776bba",
                "title": "apple juice",
                "ingredient_name": [
                    "sugar",
                    "water",
                    "apple"
                ]
            },
            {
                "recipe_id": "649991c25cd777aed27857cf",
                "title": "applesauce",
                "ingredient_name": [
                    "water",
                    "apple",
                    "sugar"
                ]
            }
        ]
    }
}
```

##### Failure:

```json
{
    "errors": [
        {
            "status": 400,
            "errorStructure": {
                "code": 400,
                "errorType": "ClientError",
                "httpErrorMessage": "Bad Request",
                "message": "Row volume must be between 1 and 30"
            }
        }
    ],
    "data": {
        "SearchRecipesByQueryIng": null
    }
}
```

## Status Codes:

- **200:** OK - Successful operation.
- **404:** Not Found - No results found.
- **401:** Unauthorized
- **400:** Bad Request (Client Error: typos etc...)
- **500:** Internal Server Error - General server error.
