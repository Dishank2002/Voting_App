# Voting App

A web application for managing and participating in voting. This app allows users to view, add, and vote for candidates. Administrators can manage candidates, while users can cast their votes.

## Deployment

The application is deployed on Render. You can access it [here](https://voting-app-1-ccx3.onrender.com/candidate).

## Features

- User authentication
- Admin panel for adding and deleting candidates
- Real-time vote updates with WebSockets
- Sorted display of candidates by votes

## Technologies Used

- Node.js
- Express
- MongoDB
- Mongoose
- EJS
- Socket.io
- JWT for authentication
- dotenv for environment variable management

## Setup

### Prerequisites

- Node.js
- npm
- MongoDB

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/Dishank2002/Voting_App.git
    cd Voting_App
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add your MongoDB URI and other environment variables:

    ```plaintext
    MONGO_URI=your_mongo_db_connection_string
    PORT=3000
    ```

### Running the Application

1. Start the server:

    ```bash
    npm start
    ```

2. Visit `http://localhost:3000` in your browser.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature-name`).
5. Open a pull request.

