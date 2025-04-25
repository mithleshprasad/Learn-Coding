
---

# DSA Learning Hub 🚀

**DSA Learning Hub** is an interactive platform designed to help learners explore and master Data Structures and Algorithms (DSA). It provides examples, API integrations, and will soon include interactive visualizations for various topics such as arrays, strings, linked lists, stacks, graphs, and more.

---

## Features

### 🌟 Current Features:

### 1. **Sorting Algorithms**
   - **Bubble Sort**: Show gradual bubbling of largest elements to the end
   - **Merge Sort**: Visualize the divide-and-conquer approach with splitting and merging
   - **Quick Sort**: Demonstrate pivot selection and partitioning
   - **Insertion Sort**: Show building the sorted array one element at a time
   - **Selection Sort**: Visualize repeatedly finding the minimum element

### 2. **Graph Algorithms**
   - **Dijkstra's Algorithm**: Animate finding shortest paths with a priority queue
   - **A* Search**: Show heuristic-based pathfinding with open/closed sets
   - **Breadth-First Search**: Demonstrate layer-by-layer exploration
   - **Depth-First Search**: Visualize backtracking through nodes
   - **Minimum Spanning Tree (Prim's/Kruskal's)**: Show tree growing process

### 3. **Dynamic Programming**
   - **Fibonacci Sequence**: Visualize recursion tree vs. memoized/dp approach
   - **Knapsack Problem**: Show decision tree and DP table filling
   - **Longest Common Subsequence**: Animate matrix filling process

### 4. **Tree Traversals**
   - **Inorder/Preorder/Postorder**: Animate different traversal orders
   - **AVL Tree Rotations**: Show balancing operations
   - **Red-Black Tree Insertions**: Demonstrate color flipping and rotations

### 5. **String Matching**
   - **Naive String Search**: Show brute-force character comparisons
   - **KMP Algorithm**: Visualize prefix function and pattern shifting
   - **Boyer-Moore**: Demonstrate bad character and good suffix rules

### 6. **Numerical Algorithms**
   - **Euclidean Algorithm**: Animate GCD calculation
   - **Sieve of Eratosthenes**: Show prime number filtering
   - **Fast Exponentiation**: Demonstrate divide-and-conquer power calculation

### 7. **Machine Learning Basics**
   - **K-Nearest Neighbors**: Show decision boundaries forming
   - **Linear Regression**: Animate gradient descent convergence
   - **K-Means Clustering**: Visualize centroid movement

### 8. **Cryptography**
   - **RSA Encryption**: Demonstrate key generation and modular arithmetic
   - **Caesar Cipher**: Show letter shifting visualization
   - **Diffie-Hellman**: Animate key exchange process

### Implementation Tips:
1. **Common UI Components** you can reuse:
   - Array/graph visualization canvas
   - Speed controls
   - Step-by-step explanation panel
   - Algorithm comparison tabs
   - Pseudocode display synchronized with visualization

2. **Visual Elements** to include:
   - Color-coding for different states (visited, current, etc.)
   - Pointer indicators for current positions
   - Animated transitions between steps
   - Performance metrics (time/space complexity)

3. **Educational Features**:
   - Best/worst case scenario toggles
   - Big-O complexity graph comparison
   - Real-world use case examples
   - Common pitfalls/misconceptions

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
