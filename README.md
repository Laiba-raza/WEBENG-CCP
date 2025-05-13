# WEBENG-CCP
NOTES APPLICATION

### TECHNOLOGY STACK
- Node.JS (Latest LTS)
- React.js
- MongoDB
- Pino Logger
- Mocha/Chai (Backend)
- Jest (Frontend)
- Logger
- SonarQube
- Git

### FOR FRONTEND :
React, Jest (Frontend)
HTML ,Css,CKEditor 

### FOR BACKEND:
NodeJS,Mocha/chai,Express server

### For DATABASE:
MongoDB

### ENVIRONMENT VARIABLES:
PORT=5000: 
This defines the port on which your server will run.When the application is started, it will listen on port 5000 for incoming requests.

MONGO_URI=mongodb+srv:
//user-main:--=@cluster0.lkfff.mongodb.net/notes-app?retryWrites=true&w=majority&appName=Cluster0: 
This variable holds the URI (Uniform Resource Identifier) for connecting to my MongoDB database..

JWT_SECRET=validkey---: 
This is the secret key used to sign and verify JSON Web Tokens (JWT). It ensures that tokens are securely generated and validated for user authentication.

### Running the Project

### Backend

1. Navigate to the backend directory:
cd backend
2. Install dependencies:
npm install 
3. Start the backend server:
npm start
npm run dev

### Frontend

1. Navigate to the frontend directory:
cd frontend

2. Install dependencies:
npm install
   
3. Start the frontend development server:
npm start
   
## Additional Features and Information
This project includes login and registration features with complete user authentication.
searching functionality provides seamless user interface .
Voice-to-text alogrithms also integrated so that user can just speak and journal notes.
notes can be locked and unlocked for private and public notes.
Pino logger is implemented for logging purposes.
The application allows users to create, update, delete, and fetch all data related to their authenticated account.
The Rich Text Editor has been implemented through CKEditor.
A logout feature is also implemented.
The frontend is designed to be intuitive and user-friendly, ensuring that users can perform tasks easily such as deleting,creating or updatig notes with ease.
