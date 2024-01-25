# Rejoicehub_llp_backend_project



## Features

### User Management:

- Registration, login, logout, Update Password
- Profile management (avatar, cover image, details)
- Watch history tracking

### Video & photo Management:
- Video & photo upload and publishing
- Video and photo search, sorting, and pagination
- Video and photo editing and deletion
- Visibility control (private/unprivate)


### Like Management:

- Liking and unliking videos & photo
- Viewing liked videos


## Technologies Used:

- Node.js
- Express.js
- MongoDB
- Cloudinary (must have an account)

## Installation and Setup

1. Clone the repository:



2. Install dependencies:

```bash
  npm install
```

3. Set up environment variables: Create a .env in root of project and fill in the required values :

- PORT 
- MONGODB_URI 
- CORS_ORIGIN 
- ACCESS_TOKEN_SECRET 
- ACCESS_TOKEN_EXPIRY 
- REFRESH_TOKEN_SECRET 
- REFRESH_TOKEN_EXPIRY
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

4. Start the server:

```bash
  npm run dev
```