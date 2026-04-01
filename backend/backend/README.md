# Blood Drop - Smart Blood Donation Web Application

A full-stack web application connecting blood donors with recipients.

## Tech Stack
- **Frontend**: React.js, TailwindCSS
- **Backend**: Spring Boot 3, Java 17+
- **Database**: MySQL

## How to Run

### Requirements
- **Java 17+**
- **Node.js 16+**
- **Maven**
- **MySQL** running on port 3306

### 1. Database
The application connects to `jdbc:mysql://localhost:3306/blood_drop_db`.
- Ensure your MySQL server is running.
- The application will automatically create the database and tables if they don't exist.
- Update credentials in `backend/src/main/resources/application.properties` if needed.

### 2. Backend
Open a terminal in the `backend` folder and run:
```bash
mvn spring-boot:run
```
The server will start on `http://localhost:8080`.

### 3. Frontend
Open a new terminal in the `frontend` folder and run:
```bash
npm install
npm run dev
```
The application will be accessible at `http://localhost:5173`.

## Features
- **Register/Login**: Secure authentication.
- **Dashboard**: View profile and availability.
- **Find Donors**: Search by blood group and location.
- **Request Blood**: Create urgent blood requests.
- **Campaigns**: View upcoming donation events.
