
📺 VidTube — Backend API

Vidtube is a scalable YouTube-style backend built using Node.js, Express, MongoDB, Mongoose, JWT authentication, Multer, and Cloudinary.
It supports user accounts, media uploads, profile management, subscriptions, watch history & more.

✅ Features
🔐 Authentication & Security

User registration & login

JWT-based access & refresh tokens

Secure HTTP-only cookies

Logout & token refresh flow

Password hashing using bcrypt

👤 User Management

Update profile (name, email)

Change password

Get current authenticated user

Delete user account (with Cloudinary cleanup)

Public channel profile fetch

🖼 Media Uploads

Avatar upload/update/delete

Cover image upload/update/delete

Cloudinary storage integration

Multer file handling

📺 Video / Tweet / Comment System (coming next)

Upload videos/images

Likes, comments, replies

Pagination & aggregation queries

Watch history tracking

🛠️ Tech Stack
Layer	---->Technology
Runtime ---->	Node.js
Framework ---->	Express.js
Database ---->	MongoDB + Mongoose
Auth ---->	JWT + Cookies
File Uploads ---->	Multer
Cloud Storage ---->	Cloudinary
Validation ---->	Mongoose Validators
Dev Tools ---->	Nodemon, Git, Postman

Vidtube/
 ├── src/
 │   ├── controllers/
 │   ├── models/
 │   ├── routes/
 │   ├── middlewares/
 │   ├── utils/
 │   ├── db/
 │   └── app.js
 ├── .env
 ├── package.json
 ├── README.md
 └── server.js

Create a .env file:
MONGODB_URI=
PORT=8000

ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

🚀 Installation & Setup
# Clone repo
git clone https://github.com/priyanshuraj-debug/Vidtube.git

cd Vidtube

# Install dependencies
npm install

# Start development server
npm run dev


🧪 API Endpoints (User Module)
Auth
Method	Endpoint	Description
POST ---->	/api/v1/users/register	Register user
POST ---->	/api/v1/users/login	Login user
POST ---->	/api/v1/users/logout	Logout
POST ---->	/api/v1/users/refresh-token	Refresh access token

Profile
Method	Endpoint	Description
GET ---->	/api/v1/users/current-user	Get logged-in user
PATCH ---->	/api/v1/users/update-account	Update name/email
POST ---->	/api/v1/users/change-password	Update password

Media
Method 	Endpoint	Description
PATCH ---->	/api/v1/users/avatar	Update avatar
PATCH ---->	/api/v1/users/cover-image	Update cover image
Channel & History
Method	Endpoint	Description
GET ---->	/api/v1/users/c/:username	Get channel profile
GET ---->	/api/v1/users/history	Watch history

Delete Account
Method	Endpoint	Description
DELETE ---->	/api/v1/users/:userId	Delete user & images


🧹 Future Improvements
✅ Video upload & processing
✅ Like/Dislike system
✅ Comments & replies
✅ Notifications
✅ Admin dashboard

❤️ Author

👨‍💻 Priyanshu Raj
🔗 GitHub: https://github.com/priyanshuraj-debug

⭐ Contribute

1)Fork repo

2)Create feature branch

3)Commit & push changes

4)Open pull request
