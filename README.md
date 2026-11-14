# 🏍️ Jogniya Motors – Motorcycle Showroom Website

A full-stack motorcycle showroom management and customer-facing website developed for **M/S. Jogniya Motors**.

The website helps customers explore new Hero motorcycles, browse used bikes, view spare parts, enquire about services, and calculate bike EMIs. It also includes an admin dashboard for managing showroom inventory and customer enquiries.

## 🚀 Features

### Customer Website
- Browse new Hero motorcycles.
- Explore used motorcycles from different brands.
- View available spare parts.
- Search and filter bikes.
- Filter motorcycles by price.
- Calculate estimated monthly EMIs.
- Contact the showroom through WhatsApp.
- Submit customer enquiries.
- View showroom location and contact information.

### Admin Dashboard
- Secure admin login.
- Add, edit, and delete motorcycles.
- Manage new and used bikes.
- Upload and preview bike images.
- Manage spare parts and their images.
- Update prices and stock information.
- View and manage customer enquiries.

## 🛠️ Technologies Used

**Frontend**
- HTML5
- CSS3
- JavaScript

**Backend**
- Node.js
- Express.js

**Database**
- MySQL

**Development Tools**
- Visual Studio Code
- Git
- GitHub

## 📁 Project Structure

```text
Jogniya-Motor/
│
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── fronted/
│   │   ├── css/
│   │   ├── js/
│   │   ├── admin-dashboard.html
│   │   └── admin-login.html
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── index.html
├── bikes.html
├── usedbikes.html
├── parts.html
├── services.html
├── contact.html
├── emi.html
├── bike_details.html
├── frontend.js
├── style.css
├── package.json
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/anilkhatik1/Jogniya-Motor.git
```

### 2. Open the project

```bash
cd Jogniya-Motor
```

### 3. Install backend dependencies

```bash
cd backend
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the backend folder using the provided `.env.example` file.

Fill in the required database credentials and other configuration values.

**Never upload your actual `.env` file or database passwords to GitHub.**

### 5. Configure MySQL

- Install and start MySQL.
- Create the database named `jogniya_motors`.
- Configure the database connection using your backend environment variables.
- Ensure the required database tables are available.

### 6. Start the backend server

From the backend directory, run:

```bash
node server.js
```

The backend runs at:

```text
https://jogniya-motor.onrender.com
```

### 7. Open the frontend

Open `index.html` using Visual Studio Code Live Server.

## 🎯 Project Purpose

This project aims to digitize the operations of a motorcycle showroom by providing customers with an easy-to-use online platform and showroom administrators with an inventory and enquiry management system.

## 👨‍💻 Developer

**Developed by:** Anil Khatik

**GitHub:** [anilkhatik1](https://github.com/anilkhatik1)

**Project:** Jogniya Motors – Motorcycle Showroom Website

---

⭐ If you find this project interesting, consider giving the repository a star!
