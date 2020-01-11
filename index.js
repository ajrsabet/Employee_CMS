// npm packages: npm install
const inquirer = require('inquirer');
const mysql = require('mysql');


const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "employee_cms_db"
});

// Connect
connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  createEmployee();
});



// Create
function createEmployee() {
  console.log("Inserting a new employee...\n");
  const query = connection.query(
    "INSERT INTO employee SET ?",
    {
      first_name: "Tyler",
      last_name: "Durden",
      role_id: "5",
      manager_id: "1",
    },
    function(err, res) {
      if (err) throw err;
      console.log(res.affectedRows + " employee inserted!\n");
      // Call updateemployee AFTER the INSERT completes
      readEmployee();
    }
  );

  // logs the actual query being run
  console.log(query.sql);
}

// Read
function readEmployee() {
  console.log("Selecting all employee...\n");
  connection.query("SELECT * FROM employee", function(err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.table(res);
    // connection.end();
    updateEmployee();
  });
}

// Update
function updateEmployee() {
  console.log("Updating employee position...\n");
  const query = connection.query(
    "UPDATE employee SET ? WHERE ?",
    [
      {
        role_id: 1
      },
      {
        first_name: "Tyler"
      }
    ],
    function(err, res) {
      if (err) throw err;
      console.log(res.affectedRows + " employee updated!\n");
      // Call deleteemployee AFTER the UPDATE completes
      deleteEmployee();
    }
  );

  // logs the actual query being run
  console.log(query.sql);
}

// Delete
function deleteEmployee() {
  console.log("Deleting Tyler Durden...\n");
  connection.query(
    "DELETE FROM employee WHERE ?",
    {
      first_name: "Tyler"
    },
    function(err, res) {
      if (err) throw err;
      console.log(res.affectedRows + " employee deleted!\n");
      // Call reademployee AFTER the DELETE completes
      // readEmployee();
      connection.end();
    }
  );
}


