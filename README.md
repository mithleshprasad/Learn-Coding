
---

# DSA Learning Hub 🚀

**DSA Learning Hub** is an interactive platform designed to help learners explore and master Data Structures and Algorithms (DSA). It provides examples, API integrations, and will soon include interactive visualizations for various topics such as arrays, strings, linked lists, stacks, graphs, and more.

---

## Features

### 🌟 Current Features:
- **API Testing**:
  - Fetch responses from `info` and `array` endpoints.
- **Dynamic Data**:
  - View array operations (original and reversed) dynamically from the API.
- **Structured Layout**:
  - Organized sections for content display, API interactions, and upcoming features.

### 🔜 Coming Soon:
- Interactive examples for arrays, strings, linked lists, stacks, and graphs.
- Topic-wise tutorials and explanations.
- Visualizations for DSA concepts.
- Practice problems and solutions.

---

## Project Structure

```
root/
│
├── index.html       # Main HTML file for the website
├── server.js        # Express server for API endpoints
├── README.md        # Project documentation
└── styles.css       # (Optional) External stylesheet for custom styles
```

---

## API Endpoints

### `/info`
- **Method**: `GET`
- **Description**: Returns a message indicating the API server is running successfully.
- **Sample Response**:
  ```json
  {
    "status": true,
    "message": "JSON server run successful!",
    "server": "Express"
  }
  ```

### `/array`
- **Method**: `GET`
- **Description**: Returns an array and its reversed version.
- **Sample Response**:
  ```json
  {
    "status": true,
    "array": "Originally array 1,2,3,4,5,6 <br> Reversed array: 6,5,4,3,2,1"
  }
  ```

---

## How to Run the Project

### Prerequisites
- Node.js installed on your machine.
- A text editor (e.g., VSCode).

### Steps
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd dsa-learning-hub
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Server**:
   ```bash
   node server.js
   ```
   The server will start at [http://localhost:8045](http://localhost:8045).

4. **Open the Website**:
   - Open `index.html` in a browser or serve it using a tool like Live Server.

---

## Contribution

Contributions are welcome! Here's how you can help:
1. Fork the repository.
2. Create a new branch for your feature/bug fix.
3. Submit a pull request with detailed information about your changes.

---

## License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute it as you like.

---

## Author

Built with ❤️ by **Mithlesh Prasad**.

--- 
