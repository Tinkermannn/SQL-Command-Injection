# **Penetration Testing Simulation: SQL Injection & Command Injection**

---

# SQL Injection

## Prerequisites & Tools

Before starting the simulation, ensure the following hardware and software are prepared. This simulation is conducted on a JavaScript Runtime-based application architecture.

![Kali Linux](https://img.shields.io/badge/Kali_Linux-557C94?style=for-the-badge&logo=kali-linux&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

| Category | Tool / Software | Description |
| :--- | :--- | :--- |
| **OS** | **Kali Linux** | Main operating system for the attacker machine and hosting environment. |
| **Backend** | **Node.js + Express** | Server-side framework (v4.18.2) running the application logic. |
| **Frontend** | **React + Vite** | Client-side library for the TechStore user interface. |
| **Database** | **SQLite (sql.js)** | Lightweight database (v1.10.3) storing user and product data. |
| **Analysis** | **Browser DevTools** | Used to inspect Network requests and Responses. |
| **Scanning** | **Nmap** | Tool for enumerating services on ports 3000 (Backend) and 5173 (Frontend). |

---

## 1. Target Creation

The simulation target is a simple e-commerce application called **TechStore**. This application contains intentional *SQL Injection* vulnerabilities due to a lack of input validation during database interactions.

### A. Architecture & Vulnerable Endpoints
The application runs with a Frontend (Port 5173) communicating with a Backend API (Port 3000). The following endpoints are vulnerable:

*   **`POST /api/login`**: User authentication feature.
*   **`GET /api/search?query=`**: Product search feature.
*   **`GET /api/users/:id`**: Feature to view user account details.

### B. Database Structure
Understanding the table structure is crucial for *Union-Based* attacks.

**`users` Table:**
```sql
CREATE TABLE users (
 id INTEGER PRIMARY KEY,
 username TEXT NOT NULL UNIQUE,
 password TEXT NOT NULL,
 email TEXT,
 role TEXT DEFAULT 'user',
 created_at TEXT
);
```

### C. Vulnerable Code (Backend)
Example of vulnerable Node.js code at the login endpoint (using *String Concatenation*):

```javascript
// Vulnerable Code
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    // Input is concatenated directly into the query string
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    // ... execute query ...
});
```

---

## 2. Enumeration

This stage aims to map the *attack surface* and identify the database type.

### A. Port Scanning (Nmap)
Perform a scan to discover active web services.

```bash
nmap -sV -p- <IP_TARGET>
```
**Result:** Detected Port **3000** (Node.js Express) and Port **5173** (Frontend).

### B. Error Based Analysis
Test by inputting special characters like `'` (single quote) into input fields.
*   **Input:** `admin'`
*   **Server Response:** Returns a JSON error message such as:
    `"message": "SQLITE_ERROR: near \"'admin''\": syntax error"`
*   **Analysis:** The exposed *Verbose Error Message* confirms the use of an **SQLite** database and the existence of an injection flaw.

---

## 3. Exploitation

Exploitation is performed to manipulate database *queries* to bypass login or steal sensitive data.

### Scenario 1: Authentication Bypass (Login)
This attack manipulates the `WHERE` logic to always evaluate to `TRUE`, allowing login without a valid password.

*   **Target:** Login Page
*   **Payload (Username):** `admin' OR '1'='1`
*   **Payload (Password):** *(any)*
*   **Result:** Successfully logged in as the first user in the database (usually the Administrator) because the logic `1=1` is always true.

### Scenario 2: Union-Based Injection (Data Exfiltration)
Uses the `UNION` operator to combine product search results with data from the `users` table (credential theft).

*   **Target:** Search Bar (Parameter `query`)
*   **Payload:**
    ```sql
    ' UNION SELECT username, password, email, role, id, created_at FROM users --
    ```
*   **Result:** The search results page displays a list of usernames, emails, and passwords for all users in the database.

### Scenario 3: IDOR via Blind SQLi (User Lookup)
Manipulating the ID URL parameter to bypass logic validation.

*   **Target:** URL `/api/users/1`
*   **Payload:** Changing ID to `1 OR 1=1`
*   **Result:** The API returns data for *all* users instead of just one specific user.

---

## 4. Remediation

Remediation is achieved by implementing *Parameterized Queries* (Prepared Statements) and strict Input Validation.

### A. Implementation of Parameterized Queries
Replace string concatenation techniques with *placeholders* (`?`). The database driver will treat input as literal data, not executable code.

**Vulnerable Code:**
```javascript
const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
```

**Remediated Code (Secure):**
```javascript
// Using Prepared Statement
const stmt = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?');
// Securely binding parameters
stmt.bind([username, password]);
const result = stmt.step() ? stmt.getAsObject() : null;
```

### B. Input Validation & Sanitization
Add data type and format validation before data is processed by the database.

```javascript
// Validate ID must be Integer
const userId = parseInt(id, 10);
if (!Number.isInteger(userId) || userId < 1) {
    return res.status(400).json({ message: 'Invalid user ID' });
}

// Validate Username (Alphanumeric only)
const regex = /^[a-zA-Z0-9_]{3,20}$/;
if (!regex.test(username)) {
    // Reject request
}
```

### C. Verification
1. Attempt the attack again with the payload: `admin' OR '1'='1`.
2. **Result:** Login fails. The system reads the input as a literal username named `"admin' OR '1'='1"`, not as SQL logic.

---
**Conclusion:** *SQL Injection* vulnerabilities occur because the application trusts raw user input when constructing database queries. Implementing **Parameterized Queries** is the most effective primary defense to prevent this attack.

<br>
<br>

---

# Command Injection

## Prerequisites & Tools

Before starting the simulation, ensure the following hardware and software are prepared. This simulation is conducted in an isolated virtual environment.

![Kali Linux](https://img.shields.io/badge/Kali_Linux-557C94?style=for-the-badge&logo=kali-linux&logoColor=white)
![VirtualBox](https://img.shields.io/badge/VirtualBox-21416b?style=for-the-badge&logo=virtualbox&logoColor=white)
![Apache](https://img.shields.io/badge/Apache-D22128?style=for-the-badge&logo=apache&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
![Burp Suite](https://img.shields.io/badge/Burp_Suite-FF6633?style=for-the-badge&logo=burpsuite&logoColor=white)

| Category | Tool / Software | Description |
| :--- | :--- | :--- |
| **OS** | **Kali Linux** | Debian-based operating system used as the simulation environment (Host & Target). |
| **Virtualization** | **VirtualBox** | Virtualization software used to run the Kali Linux Virtual Machine (VM). |
| **Web Server** | **Apache HTTP Server** | Web server used to host the vulnerable target application. |
| **Backend** | **PHP** | Server-side programming language used to process application logic. |
| **Analysis** | **Burp Suite** | Proxy tool for intercepting and manipulating HTTP requests. |
| **Scanning** | **Nmap** | Tool for performing port scanning and service enumeration. |

---

## 1. Target Creation

This stage aims to create a web server environment that intentionally possesses a *Command Injection* vulnerability for testing purposes.

### A. Web Server & PHP Installation
Run the following commands in the Linux terminal (Kali Linux/Debian):

```bash
# Update repository
sudo apt update

# Install Apache2 and PHP
sudo apt install apache2 php -y

# Start and enable Apache service
sudo systemctl start apache2
sudo systemctl enable apache2

# Verify service status
sudo systemctl status apache2
```

### B. Application Directory Configuration
Create a specific folder for the simulation application to keep it isolated.

```bash
# Create application directory
sudo mkdir -p /var/www/html/network-tools

# Change ownership to allow access by user www-data (Apache)
sudo chown -R www-data:www-data /var/www/html/network-tools

# Enter the target directory
cd /var/www/html/network-tools
```

### C. Vulnerable Code Creation
Create an `index.php` file using a text editor (example: `mousepad` or `nano`).

```bash
sudo mousepad index.php
```

Insert the following **vulnerable** PHP code (without input validation):

```php
<?php
// Vulnerable Code
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $tool = $_POST['tool'] ?? '';
    $target = $_POST['target'] ?? '';

    // Input is passed directly to shell_exec without sanitation
    if ($tool === 'ping') {
        $command = "ping -c 4 " . $target; 
        $output = shell_exec($command);
    }
    // ... (logic for other tools like nslookup/traceroute)
}
?>
```
*Save the file and access via browser at `http://localhost/network-tools/`.*

---

## 2. Enumeration

This stage aims to discover security loopholes and understand how the application processes data.

### A. Port Scanning (Nmap)
Scan for open ports to identify running services.

```bash
nmap -sV -p- <IP_TARGET>
```

### B. Web Enumeration (Burp Suite)
Use Burp Suite to *intercept* HTTP Requests.

1. Open Burp Suite -> **Proxy** Tab -> Turn on **Intercept is on**.
2. In the browser, enter normal input (e.g., IP: `8.8.8.8`) into the application and click "Execute".
3. Burp Suite will capture the request. Observe the parameter:
   `tool=ping&target=8.8.8.8`
4. **Analysis:** The application sends data using the POST method. Input is sent in *plain* or *URL encoded* format.

---

## 3. Exploitation

Perform a *Command Injection* attack by injecting Operating System (OS) commands using separator characters (*Command Separators*).

### Separator Techniques
Characters used to separate the original command from the injected command:
*   `&` (Ampersand)
*   `|` (Pipe)
*   `;` (Semicolon)

### Scenario 1: Direct Injection via Browser
Enter the following payload into the "Target Host" input field on the web page:

*   **Payload:** `8.8.8.8 & ls`
*   **Result:** The application displays the ping result, followed by the list of files in the server directory (result of the `ls` command).

### Scenario 2: Injection via Burp Suite (Repeater)
For more precise control and to avoid automatic browser encoding, use Burp Suite Repeater.

1. Right-click on the intercepted request -> **Send to Repeater**.
2. Modify the `target` parameter in the request body. Ensure **URL Encoding** is used:

   **Payload to Read Password File:**
   *   Raw: `8.8.8.8 | cat /etc/passwd`
   *   Encoded Payload: `8.8.8.8+%7C+cat+%2Fetc%2Fpasswd`

   **Payload to Check Working Directory:**
   *   Raw: `8.8.8.8 ; pwd`
   *   Encoded Payload: `8.8.8.8+%3B+pwd`

3. Click **Send**. Check the server response (Response Tab) to view the output of the injected command.

---

## 4. Remediation

Fix the code to prevent exploitation using PHP's built-in sanitization functions.

### A. Implementation of `escapeshellarg()`
Modify the `index.php` file and apply the `escapeshellarg()` function. This function wraps the input in *single quotes*, causing it to be treated as a single string argument rather than an executable command.

**Remediated Code:**
```php
<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $tool = $_POST['tool'] ?? '';
    $target = $_POST['target'] ?? '';

    if (!empty($tool) && !empty($target)) {
        // REMEDIATION: Input sanitation
        $safe_target = escapeshellarg($target);

        if ($tool === 'ping') {
            // Use the sanitized variable
            $command = "ping -c 4 {$safe_target}";
            $command_executed = $command;
            $output = shell_exec($command);
        }
        // ...
    }
}
?>
```

### B. Removal of Nested Shell Execution (`/bin/bash -c`)

This step involves simplifying the execution process by removing unnecessary *nested shells* (e.g., explicitly calling `/bin/bash -c` inside the PHP script). This minimizes the risk of "double interpretation" of special characters by the shell.

By executing the `$command` variable directly after it has been sanitized by `escapeshellarg()`, we ensure that user input is processed strictly as a safe string argument, not as a command separator or instruction.

**Secure Execution Pattern:**

```php
// ... inside the IF block
if ($tool === 'ping') {
    // 1. Define command with SANITIZED input
    $command = "ping -c 4 {$safe_target}";

    // 2. Direct execution (Avoids explicit 'bash -c' wrappers)
    $command_executed = $command;
    $output = shell_exec($command);
}
elseif ($tool === 'nslookup') {
    $command = "nslookup {$safe_target}";
    $command_executed = $command;
    $output = shell_exec($command);
}
// ... repeat for other tools
```

### C. Verification (Proof of Fix)
1. Attempt the attack again with the payload: `8.8.8.8 & ls`.
2. **Result:** The injection command fails. The system attempts to ping a host named `'8.8.8.8 & ls'` (treated as a string), keeping the server safe from illegal command execution.

---
**Conclusion:** The *Command Injection* vulnerability occurs due to a lack of input validation. Using sanitization functions like `escapeshellarg()` is effective in preventing this attack.