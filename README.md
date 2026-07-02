# MERN Stack Interview Preparation README

## By Mithlesh Prasad

---

# 📌 Overview

This guide contains:

* MERN Stack Interview Questions
* Deep Explanations
* Real-world Examples
* Project-based Answers
* System Design Basics
* React + Node.js + Database Concepts
* DevOps Basics
* HR Round Preparation

This README is specially prepared according to:

* Your Resume
* Your Experience
* Current Job Description

---

# 📚 Table of Contents

1. JavaScript Fundamentals
2. React.js
3. Next.js
4. Node.js
5. Express.js
6. MongoDB
7. SQL / PostgreSQL
8. Redis
9. Authentication (JWT)
10. System Design
11. DevOps Basics
12. Docker
13. CI/CD
14. Real Project Questions
15. Machine Coding Round
16. HR Questions
17. Final Interview Tips

---

# 1️⃣ JavaScript Fundamentals

---

# ❓ What is Closure?

## Definition

A closure is a function that remembers variables from its outer scope even after the outer function has finished execution.

---

## Example

```js
function outer() {
  let count = 0;

  return function inner() {
    count++;
    console.log(count);
  };
}

const counter = outer();

counter(); // 1
counter(); // 2
```

---

## Real-world Use

Closures are used in:

* Data hiding
* React hooks
* Event handlers
* Debouncing
* Timers

---

# ❓ What is Hoisting?

## Definition

JavaScript moves declarations to the top before execution.

---

## Example

```js
console.log(a);

var a = 10;
```

Internally:

```js
var a;
console.log(a); // undefined
a = 10;
```

---

# ❓ Difference between == and ===

| ==               | ===                 |
| ---------------- | ------------------- |
| Loose comparison | Strict comparison   |
| Checks value     | Checks value + type |

---

## Example

```js
console.log(5 == "5"); // true
console.log(5 === "5"); // false
```

---

# ❓ What is Event Loop?

## Deep Explanation

Node.js is single-threaded but handles asynchronous tasks using:

* Call Stack
* Web APIs
* Callback Queue
* Event Loop

---

## Flow

```text
Call Stack → Web APIs → Callback Queue → Event Loop
```

---

## Example

```js
console.log("Start");

setTimeout(() => {
  console.log("Timeout");
}, 0);

console.log("End");
```

Output:

```text
Start
End
Timeout
```

---

# 2️⃣ React.js

---

# ❓ What is Virtual DOM?

## Explanation

Virtual DOM is a lightweight copy of the real DOM.

React compares:

* Previous Virtual DOM
* New Virtual DOM

Then updates only changed elements.

---

## Benefits

* Faster rendering
* Better performance
* Reduced DOM operations

---

# ❓ What are React Hooks?

Hooks allow functional components to use:

* State
* Lifecycle methods
* Context

---

# useState Example

```js
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}
```

---

# ❓ useEffect Deep Explanation

Used for:

* API calls
* Event listeners
* Timers
* Side effects

---

## Example

```js
useEffect(() => {
  fetchData();
}, []);
```

---

## Dependency Array

| Dependency | Meaning                 |
| ---------- | ----------------------- |
| []         | Runs once               |
| [count]    | Runs when count changes |
| No array   | Runs every render       |

---

# ❓ React Performance Optimization

## Techniques

### 1. React.memo

```js
export default React.memo(Component);
```

Prevents unnecessary re-renders.

---

### 2. useMemo

```js
const value = useMemo(() => expensiveCalculation(), []);
```

Caches expensive calculations.

---

### 3. useCallback

```js
const handleClick = useCallback(() => {}, []);
```

Caches functions.

---

### 4. Lazy Loading

```js
const Dashboard = React.lazy(() => import("./Dashboard"));
```

Loads component only when needed.

---

# 3️⃣ Next.js

---

# ❓ Why Next.js?

## Advantages

* SEO support
* SSR
* SSG
* Faster performance
* File-based routing

---

# ❓ CSR vs SSR vs SSG

| Type | Meaning                |
| ---- | ---------------------- |
| CSR  | Client-side rendering  |
| SSR  | Server-side rendering  |
| SSG  | Static site generation |

---

# Example SSR

```js
export async function getServerSideProps() {
  return {
    props: {}
  };
}
```

---

# 4️⃣ Node.js

---

# ❓ What is Node.js?

Node.js is a JavaScript runtime built on Chrome V8 engine.

Used for:

* APIs
* Real-time apps
* Backend systems

---

# ❓ What is Middleware?

Middleware runs between request and response.

---

# Example

```js
app.use((req, res, next) => {
  console.log("Middleware");
  next();
});
```

---

# ❓ Types of Middleware

* Authentication
* Logging
* Validation
* Error handling

---

# ❓ JWT Authentication Flow

---

## Step-by-step

```text
Login → Generate Token → Send Token → Verify Token
```

---

# Example

## Generate Token

```js
const token = jwt.sign(
  { id: user._id },
  SECRET_KEY,
  { expiresIn: "1d" }
);
```

---

## Verify Token

```js
jwt.verify(token, SECRET_KEY);
```

---

# 5️⃣ Express.js

---

# ❓ REST API Example

```js
app.get("/users", getUsers);

app.post("/users", createUser);

app.put("/users/:id", updateUser);

app.delete("/users/:id", deleteUser);
```

---

# ❓ Best Practices

* Proper status codes
* Validation
* Error handling
* Pagination
* Authentication
* Rate limiting

---

# 6️⃣ MongoDB

---

# ❓ SQL vs NoSQL

| SQL        | NoSQL       |
| ---------- | ----------- |
| Tables     | Documents   |
| Structured | Flexible    |
| Relations  | Schema-less |

---

# ❓ Mongoose Schema Example

```js
const userSchema = new mongoose.Schema({
  name: String,
  email: String
});
```

---

# ❓ What is Indexing?

Indexes improve search speed.

---

# Example

```js
userSchema.index({ email: 1 });
```

---

# ❓ Aggregation Example

```js
User.aggregate([
  {
    $match: {
      age: { $gt: 18 }
    }
  }
]);
```

---

# 7️⃣ PostgreSQL / SQL

---

# ❓ Joins

| Join       | Meaning           |
| ---------- | ----------------- |
| INNER JOIN | Matching records  |
| LEFT JOIN  | All left records  |
| RIGHT JOIN | All right records |

---

# Example

```sql
SELECT users.name, orders.total
FROM users
INNER JOIN orders
ON users.id = orders.user_id;
```

---

# 8️⃣ Redis

---

# ❓ What is Redis?

Redis is an in-memory database used for:

* Caching
* Sessions
* Rate limiting

---

# ❓ Why Redis?

Without Redis:

```text
Request → Database → Response
```

With Redis:

```text
Request → Redis Cache → Fast Response
```

---

# Example

```js
await redis.set("users", JSON.stringify(data));
```

---

# 9️⃣ System Design

---

# ❓ How to Design Scalable APIs?

## Architecture

```text
Client
 ↓
Load Balancer
 ↓
API Server
 ↓
Redis Cache
 ↓
Database
```

---

# Important Concepts

* Caching
* Pagination
* Indexing
* Load balancing
* Rate limiting
* Queue systems

---

# ❓ Monolith vs Microservices

| Monolith         | Microservices     |
| ---------------- | ----------------- |
| Single app       | Multiple services |
| Easier initially | More scalable     |

---

# 1️⃣0️⃣ Docker

---

# ❓ What is Docker?

Docker packages application + dependencies into containers.

---

# Dockerfile Example

```dockerfile
FROM node:18

WORKDIR /app

COPY . .

RUN npm install

CMD ["npm", "start"]
```

---

# 1️⃣1️⃣ CI/CD

---

# ❓ What is CI/CD?

| CI                     | CD                    |
| ---------------------- | --------------------- |
| Continuous Integration | Continuous Deployment |

---

# GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
```

---

# 1️⃣2️⃣ Real Project Questions

---

# ❓ Explain Swan Investment Dashboard

## Answer

* Financial admin dashboard
* JWT authentication
* RBAC
* Payment integration
* Optimized queries
* Secure transactions

---

# ❓ Explain ERP Migration

## Answer

* Migrating monolith → microservices
* Independent services
* Docker deployment
* Redis caching
* CI/CD automation

---

# 1️⃣3️⃣ Machine Coding Round

---

# Common Questions

* Todo App
* Pagination
* Search Filter
* Debounce Search
* CRUD App
* Authentication UI

---

# Debounce Example

```js
function debounce(fn, delay) {
  let timer;

  return function (...args) {
    clearTimeout(timer);

    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
```

---

# 1️⃣4️⃣ HR Questions

---

# ❓ Why should we hire you?

## Answer

> I already have practical experience working on production-level MERN applications, performance optimization, CI/CD deployment, and scalable backend systems. I can contribute quickly with minimal guidance.

---

# ❓ Why are you switching?

## Answer

> I’m looking for larger technical challenges, better growth opportunities, and an environment where I can improve my architecture and backend skills further.

---

# ❓ Your Strengths

* Problem solving
* Full-stack ownership
* Performance optimization
* Fast learning
* Team collaboration

---

# 1️⃣5️⃣ Final Interview Tips

---

# ✅ Before Interview

Revise:

* JWT
* React hooks
* MongoDB queries
* SQL joins
* Redis
* Docker basics
* Event loop
* Async await

---

# ✅ During Interview

* Speak slowly
* Explain real examples
* Mention optimization results
* Explain architecture clearly
* Think before answering

---

# ✅ Avoid

* Long unnecessary answers
* Memorized definitions
* Saying “I don’t know anything”

Instead say:

> “I haven’t used it deeply yet, but I understand the basics.”

---

# 🎯 Final Advice

Your strongest points:

* Real-world projects
* Performance optimization
* MERN stack experience
* DevOps exposure
* Production deployments

Main focus now:

* Communication
* Confidence
* System design basics
* JavaScript fundamentals

---

# ⭐ Author

Mithlesh Prasad
Full Stack MERN Developer
React.js | Node.js | MongoDB | DevOps | AWS | Docker

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



/////////////////////////////////////////////////////////////////////////////////////////////////////////////
🔥 **Alright Mithlesh! Here is the COMPLETE *Day-by-Day DevOps Plan* (40 Days) — the most practical, industry-ready roadmap made specifically for you as a MERN developer.**

👇 **Save this. Follow this. You will become DevOps Engineer in 40 Days.**

---

# 🚀 **DAY-BY-DAY DEVOPS PLAN (40 Days)**

**No theory bullshit. Only practical + real projects.**

---

# ✅ **WEEK 1 — Linux + Git + DevOps Fundamentals**

## **Day 1 — Linux Basics**

* Install Ubuntu (Dual Boot / WSL2)
* Learn:

  * `ls`, `cd`, `pwd`, `mkdir`, `rm`
  * `cat`, `touch`, `less`
  * `sudo`, `apt update`, `apt install`
* Practice navigation like a pro.

## **Day 2 — Linux Intermediate**

* File permissions:
  `chmod`, `chown`
* Processes:
  `ps`, `kill`, `top`, `htop`
* Services:
  `systemctl start/stop/status`
* Networking:
  `ping`, `curl`, `wget`, `ss -tulpn`

## **Day 3 — Linux Advanced**

* Shell scripting basics:

  * variables
  * loops
  * functions
* Write a script:

  ```bash
  #!/bin/bash
  echo "Server Time: $(date)"
  ```

## **Day 4 — Git Basics**

* Git clone / add / commit / push
* Branching
* Merging
* `.gitignore`

## **Day 5 — Git Advanced**

* Git rebase
* Git stash
* Git cherry-pick
* Git bisect

## **Day 6 — DevOps Fundamentals**

* What is DevOps
* Continuous Delivery vs Deployment
* CI vs CD
* Containers
* Infra-as-code
* Cloud
* Monitoring

## **Day 7 — Mini Project**

Deploy a Node.js API on local Linux + push to GitHub.

---

# ✅ **WEEK 2 — AWS Basics + Deploy Backend on EC2**

## **Day 8 — Create AWS Account**

* Setup free tier
* Enable MFA
* Create IAM user
* Install AWS CLI

## **Day 9 — EC2**

* Launch Ubuntu EC2 instance
* SSH using PEM file
* Install Node.js, npm

## **Day 10 — Deploy First App on EC2**

* Clone MERN backend
* Install + run via PM2
* Test public IP

## **Day 11 — Install + Configure NGINX**

* Reverse proxy
* Serve Node.js backend from port 80

## **Day 12 — MongoDB Setup**

* Use MongoDB Atlas
* Connect from EC2
* Fix IP allowlist

## **Day 13 — S3 Basics**

* Create bucket
* Upload/download files
* Learn public & private access
* Learn bucket policies

## **Day 14 — AWS IAM**

* Users
* Groups
* Roles
* Policies
* Attach EC2 Role

🎯 **Project Result:**
**MERN backend deployed manually on AWS EC2 using NGINX + PM2**

---

# ✅ **WEEK 3 — Docker (Most Important for DevOps)**

## **Day 15 — Docker Basics**

* Containers vs VMs
* Install Docker
* Docker images
* Docker containers
* Docker Hub

## **Day 16 — Dockerfile**

Write Dockerfile for Node.js app:

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node","index.js"]
```

Run container:

```bash
docker build -t myapp .
docker run -p 3000:3000 myapp
```

## **Day 17 — Docker Compose**

* Multi-container app
* Backend + MongoDB

Example:

```yaml
services:
  api:
    build: .
    ports:
      - 3000:3000
    depends_on:
      - db
  db:
    image: mongo
    ports:
      - 27017:27017
```

## **Day 18 — Docker Volumes**

* Persistent data
* Bind mount vs volumes

## **Day 19 — Optimize Dockerfile**

* Multi-stage builds
* Smaller image sizes

## **Day 20 — Docker on AWS EC2**

* Install Docker on EC2
* Pull your image
* Run container on cloud

## **Day 21 — Docker Project**

🎯 **Complete:**
**Dockerize full MERN app + run on EC2 + push image to Docker Hub**

---

# ✅ **WEEK 4 — CI/CD (AWS CodePipeline or GitHub Actions)**

## **Day 22 — CI/CD Basics**

* What is CI?
* What is CD?
* Build → Test → Deploy pipelines

## **Day 23 — GitHub Actions**

Create `.github/workflows/deploy.yml`

Triggers on push:

```yaml
name: Node CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
```

## **Day 24 — Build Docker On GitHub Actions**

* Build
* Tag
* Push to Docker Hub
* Or push to AWS ECR

## **Day 25 — AWS ECR**

* Create ECR repo
* Push Docker images using GitHub Actions

## **Day 26 — Deploy to EC2 via CI/CD**

* SSH into EC2 from GitHub Actions
* Pull new Docker image
* Restart container

## **Day 27 — AWS CodePipeline**

* GitHub → CodeBuild → ECR → ECS
* Buildspec.yml

## **Day 28 — CI/CD Project**

🎯 **Complete:**
**Fully automated CI/CD: On every push → Build Docker → Deploy to EC2**

---

# ✅ **WEEK 5 — Terraform (Infra as Code)**

## **Day 29 — Terraform Basics**

* Install Terraform
* Providers
* Resources
* Variables

## **Day 30 — Create EC2 using Terraform**

Create `main.tf`:

```hcl
resource "aws_instance" "web" {
  ami           = "ami-12345"
  instance_type = "t2.micro"
}
```

## **Day 31 — Security Groups + IAM with Terraform**

* Create SG
* Create IAM role
* Outputs

## **Day 32 — Terraform Remote Backend**

Use S3 + DynamoDB lock

## **Day 33 — Terraform Modules**

Break infra into modules.

## **Day 34 — Full Infra**

Build:

* EC2
* S3
* VPC
* IAM
* Security groups

via one command:

```bash
terraform apply
```

## **Day 35 — Terraform Project**

🎯 **Complete:**
**MERN app + EC2 + IAM + S3 fully created through Terraform**

---

# ✅ **WEEK 6 — Monitoring, Scaling, Real Production**

## **Day 36 — CloudWatch**

* Logs
* Metrics
* Alarms
* SNS alerts (email & SMS)

## **Day 37 — Auto Scaling**

* Create launch template
* Create ASG
* Test scaling

## **Day 38 — Load Balancers**

* ALB
* Target Groups
* Health checks

## **Day 39 — Serverless**

* Lambda basics
* Connect lambda to API Gateway

## **Day 40 — Final PRODUCTION Project**

🎯 Deploy a **Production-grade MERN App**:

* Docker
* CI/CD
* ECS or EC2
* Terraform
* Logging
* Load Balancer
* Auto Scaling
* HTTPS + SSL
* Monitoring

This is **100% real DevOps project**.
Here’s a **clean complete list of Top 20 pattern questions in Node.js/JavaScript** with **comments for understanding**. These are the most commonly asked in coding rounds and help build loop logic strongly.

---

# 1. Square Pattern

```javascript
let n = 5;

for (let i = 1; i <= n; i++) {   // Controls rows
    let row = "";

    for (let j = 1; j <= n; j++) { // Controls columns
        row += "* ";
    }

    console.log(row);
}
```

Output:

```text
* * * * *
* * * * *
* * * * *
* * * * *
* * * * *
```

---

# 2. Right Triangle

```javascript
let n = 5;

for (let i = 1; i <= n; i++) {
    let row = "";

    // Print stars equal to row number
    for (let j = 1; j <= i; j++) {
        row += "* ";
    }

    console.log(row);
}
```

Output:

```text
*
* *
* * *
* * * *
* * * * *
```

---

# 3. Inverted Triangle

```javascript
let n = 5;

for (let i = n; i >= 1; i--) {
    let row = "";

    // Print decreasing stars
    for (let j = 1; j <= i; j++) {
        row += "* ";
    }

    console.log(row);
}
```

Output:

```text
* * * * *
* * * *
* * *
* *
*
```

---

# 4. Pyramid

```javascript
let n = 5;

for (let i = 1; i <= n; i++) {
    let row = "";

    // Left spaces
    for (let s = 1; s <= n - i; s++) {
        row += " ";
    }

    // Stars
    for (let j = 1; j <= i; j++) {
        row += "* ";
    }

    console.log(row);
}
```

Output:

```text
    *
   * *
  * * *
 * * * *
* * * * *
```

---

# 5. Reverse Pyramid

```javascript
let n = 5;

for (let i = n; i >= 1; i--) {
    let row = "";

    // Leading spaces
    for (let s = 1; s <= n - i; s++) {
        row += " ";
    }

    // Stars
    for (let j = 1; j <= i; j++) {
        row += "* ";
    }

    console.log(row);
}
```

---

# 6. Diamond

```javascript
let n = 4;

// Upper part
for (let i = 1; i <= n; i++) {
    let row = "";

    row += " ".repeat(n - i);
    row += "* ".repeat(i);

    console.log(row);
}

// Lower part
for (let i = n - 1; i >= 1; i--) {
    let row = "";

    row += " ".repeat(n - i);
    row += "* ".repeat(i);

    console.log(row);
}
```

---

# 7. Hollow Square

```javascript
let n = 5;

for (let i = 1; i <= n; i++) {
    let row = "";

    for (let j = 1; j <= n; j++) {

        // Border stars only
        if (i === 1 || i === n || j === 1 || j === n) {
            row += "* ";
        } else {
            row += "  ";
        }
    }

    console.log(row);
}
```

---

# 8. Hollow Triangle

```javascript
let n = 5;

for (let i = 1; i <= n; i++) {
    let row = "";

    for (let j = 1; j <= i; j++) {

        // First, last and bottom stars
        if (j === 1 || j === i || i === n) {
            row += "* ";
        } else {
            row += "  ";
        }
    }

    console.log(row);
}
```

---

# 9. Number Triangle

```javascript
let n = 5;

for (let i = 1; i <= n; i++) {
    let row = "";

    // Print numbers from 1 to row number
    for (let j = 1; j <= i; j++) {
        row += j + " ";
    }

    console.log(row);
}
```

Output:

```text
1
1 2
1 2 3
1 2 3 4
1 2 3 4 5
```

---

# 10. Reverse Number Triangle

```javascript
let n = 5;

for (let i = n; i >= 1; i--) {
    let row = "";

    for (let j = 1; j <= i; j++) {
        row += j + " ";
    }

    console.log(row);
}
```

---

# 11. Floyd’s Triangle

```javascript
let n = 5;
let num = 1;

for (let i = 1; i <= n; i++) {
    let row = "";

    for (let j = 1; j <= i; j++) {
        row += num + " ";
        num++; // Increment every time
    }

    console.log(row);
}
```

---

# 12. Binary Triangle

```javascript
let n = 5;

for (let i = 1; i <= n; i++) {
    let row = "";

    for (let j = 1; j <= i; j++) {

        // Alternate between 0 and 1
        row += (i + j) % 2 + " ";
    }

    console.log(row);
}
```

---

# 13. Palindrome Triangle

```javascript
let n = 5;

for (let i = 1; i <= n; i++) {
    let row = "";

    // Forward numbers
    for (let j = 1; j <= i; j++) {
        row += j;
    }

    // Backward numbers
    for (let j = i - 1; j >= 1; j--) {
        row += j;
    }

    console.log(row);
}
```

---

# 14. Pascal Triangle

```javascript
let n = 5;

for (let i = 0; i < n; i++) {
    let row = "";
    let num = 1;

    for (let j = 0; j <= i; j++) {
        row += num + " ";

        // Formula
        num = num * (i - j) / (j + 1);
    }

    console.log(row);
}
```

---

# 15. Butterfly Pattern

```javascript
let n = 4;

// Upper
for (let i = 1; i <= n; i++) {
    let row = "";

    row += "* ".repeat(i);
    row += "  ".repeat(2 * (n - i));
    row += "* ".repeat(i);

    console.log(row);
}

// Lower
for (let i = n; i >= 1; i--) {
    let row = "";

    row += "* ".repeat(i);
    row += "  ".repeat(2 * (n - i));
    row += "* ".repeat(i);

    console.log(row);
}
```

---

# 16. X Pattern

```javascript
let n = 5;

for (let i = 0; i < n; i++) {
    let row = "";

    for (let j = 0; j < n; j++) {

        // Diagonal stars
        if (i === j || i + j === n - 1) {
            row += "* ";
        } else {
            row += "  ";
        }
    }

    console.log(row);
}
```

---

# 17. Cross Pattern

```javascript
let n = 5;
let mid = Math.floor(n / 2);

for (let i = 0; i < n; i++) {
    let row = "";

    for (let j = 0; j < n; j++) {

        // Middle row or column
        if (i === mid || j === mid) {
            row += "* ";
        } else {
            row += "  ";
        }
    }

    console.log(row);
}
```

---

# 18. Number Pyramid

```javascript
let n = 5;

for (let i = 1; i <= n; i++) {
    let row = "";

    row += " ".repeat(n - i);

    for (let j = 1; j <= i; j++) {
        row += i + " ";
    }

    console.log(row);
}
```

---

# 19. Palindrome Pyramid

```javascript
let n = 5;

for (let i = 1; i <= n; i++) {
    let row = "";

    row += " ".repeat(n - i);

    // Descending
    for (let j = i; j >= 1; j--) {
        row += j;
    }

    // Ascending
    for (let j = 2; j <= i; j++) {
        row += j;
    }

    console.log(row);
}
```

---

# 20. Alphabet Triangle

```javascript
let n = 5;

for (let i = 1; i <= n; i++) {
    let row = "";

    for (let j = 0; j < i; j++) {
        row += String.fromCharCode(65 + j) + " ";
    }

    console.log(row);
}
```

Output:

```text
A
A B
A B C
A B C D
A B C D E
```

These 20 cover almost all interview loop patterns in Node.js/JavaScript. Once you understand these, advanced patterns become much easier.
Here are **Top 20 Array + String DSA questions in JavaScript/Node.js** (very common in interviews), with **code + comments + output**.

---

# ARRAY QUESTIONS (1–10)

---

## 1. Reverse an Array

```javascript id="a1x93d"
let arr = [1, 2, 3, 4, 5];

// reverse() modifies original array
let reversed = arr.reverse();

console.log(reversed);
```

Output:

```text id="r81kd2"
[5,4,3,2,1]
```

---

## 2. Find Maximum Number

```javascript id="d82ks1"
let arr = [10, 50, 20, 80, 30];

let max = arr[0];

for (let i = 1; i < arr.length; i++) {
    // Update max if bigger number found
    if (arr[i] > max) {
        max = arr[i];
    }
}

console.log(max);
```

Output:

```text id="m82ld0"
80
```

---

## 3. Find Minimum Number

```javascript id="s7d8k2"
let arr = [10, 50, 20, 80, 30];

let min = arr[0];

for (let i = 1; i < arr.length; i++) {
    if (arr[i] < min) {
        min = arr[i];
    }
}

console.log(min);
```

Output:

```text id="n1j8k3"
10
```

---

## 4. Sum of Array

```javascript id="p8q9s1"
let arr = [1, 2, 3, 4, 5];
let sum = 0;

for (let num of arr) {
    sum += num;
}

console.log(sum);
```

Output:

```text id="w7c8d2"
15
```

---

## 5. Remove Duplicates

```javascript id="e4k2d8"
let arr = [1, 2, 2, 3, 4, 4];

// Set stores unique values
let unique = [...new Set(arr)];

console.log(unique);
```

Output:

```text id="f3d8s1"
[1,2,3,4]
```

---

## 6. Second Largest Number

```javascript id="k2m9d1"
let arr = [10, 50, 20, 80, 30];

arr.sort((a, b) => b - a);

// Second largest after sorting
console.log(arr[1]);
```

Output:

```text id="l8s3k2"
50
```

---

## 7. Check Array is Sorted

```javascript id="u8d1k3"
let arr = [1, 2, 3, 4, 5];
let sorted = true;

for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) {
        sorted = false;
        break;
    }
}

console.log(sorted);
```

Output:

```text id="g2m9s4"
true
```

---

## 8. Rotate Array Left

```javascript id="b3k7m2"
let arr = [1, 2, 3, 4, 5];

// Remove first element
let first = arr.shift();

// Add at end
arr.push(first);

console.log(arr);
```

Output:

```text id="p4s8d1"
[2,3,4,5,1]
```

---

## 9. Find Missing Number

```javascript id="m9s2k1"
let arr = [1, 2, 4, 5];
let n = 5;

// Sum formula
let total = (n * (n + 1)) / 2;

let sum = arr.reduce((a, b) => a + b, 0);

console.log(total - sum);
```

Output:

```text id="v7d8m3"
3
```

---

## 10. Merge Two Arrays

```javascript id="q2d7m9"
let arr1 = [1, 2];
let arr2 = [3, 4];

// Merge using spread
let merged = [...arr1, ...arr2];

console.log(merged);
```

Output:

```text id="t8s4m1"
[1,2,3,4]
```

---

# STRING QUESTIONS (11–20)

---

## 11. Reverse a String

```javascript id="r8m3k2"
let str = "hello";

// Split → reverse → join
let reversed = str.split("").reverse().join("");

console.log(reversed);
```

Output:

```text id="j2k9d1"
olleh
```

---

## 12. Check Palindrome

```javascript id="w2m8d1"
let str = "madam";

let reversed = str.split("").reverse().join("");

// Compare original and reversed
console.log(str === reversed);
```

Output:

```text id="s7d9k2"
true
```

---

## 13. Count Vowels

```javascript id="f9k3d1"
let str = "javascript";
let count = 0;

for (let ch of str) {
    if ("aeiou".includes(ch)) {
        count++;
    }
}

console.log(count);
```

Output:

```text id="x8m2d1"
3
```

---

## 14. Find Duplicate Characters

```javascript id="n3d8k1"
let str = "programming";
let map = {};

for (let ch of str) {
    map[ch] = (map[ch] || 0) + 1;
}

for (let key in map) {
    if (map[key] > 1) {
        console.log(key);
    }
}
```

Output:

```text id="c9k2m1"
r
g
m
```

---

## 15. First Non-Repeating Character

```javascript id="t2m8d1"
let str = "swiss";
let map = {};

for (let ch of str) {
    map[ch] = (map[ch] || 0) + 1;
}

for (let ch of str) {
    if (map[ch] === 1) {
        console.log(ch);
        break;
    }
}
```

Output:

```text id="h8d3m1"
w
```

---

## 16. Check Anagram

```javascript id="y3k8d1"
let str1 = "listen";
let str2 = "silent";

// Sort both and compare
let result =
    str1.split("").sort().join("") ===
    str2.split("").sort().join("");

console.log(result);
```

Output:

```text id="m4d9k2"
true
```

---

## 17. Count Characters

```javascript id="u2d8k1"
let str = "hello";
let count = {};

for (let ch of str) {
    count[ch] = (count[ch] || 0) + 1;
}

console.log(count);
```

Output:

```text id="q7m2d1"
{ h:1, e:1, l:2, o:1 }
```

---

## 18. Remove Spaces

```javascript id="o8k2d1"
let str = "hello world";

// Replace spaces with empty
let result = str.replace(/\s/g, "");

console.log(result);
```

Output:

```text id="p2m8d1"
helloworld
```

---

## 19. Find Longest Word

```javascript id="l8d2m1"
let str = "I love javascript programming";

let words = str.split(" ");
let longest = "";

for (let word of words) {
    if (word.length > longest.length) {
        longest = word;
    }
}

console.log(longest);
```

Output:

```text id="n8k2d1"
programming
```

---

## 20. Capitalize First Letter

```javascript id="z2m8d1"
let str = "hello world";

let result = str
    .split(" ")
    .map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");

console.log(result);
```

Output:

```text id="v2d9m1"
Hello World
```

### Most important for interviews:

Focus on these first:

✅ Reverse Array
✅ Max/Min
✅ Remove Duplicates
✅ Missing Number
✅ Palindrome
✅ Anagram
✅ First Non-Repeating Character
✅ Duplicate Characters
✅ Longest Word
✅ Character Count

---

# 🔥 If you want, I will also give you:

### ✔ Complete DevOps Portfolio Projects (3 real projects)

### ✔ GitHub Repo Structure for DevOps

### ✔ Resume for DevOps Engineer

### ✔ 100+ DevOps Interview Questions

### ✔ All scripts (Dockerfile, Terraform, CI/CD YAML) ready-to-use
//////////////////////////////////////////////////////////////////////////////
---

## Author

Built with ❤️ by **Mithlesh Prasad**.

--- 
