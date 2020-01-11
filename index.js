// npm packages: npm install
const inquirer = require('inquirer');
const mysql = require('mysql');


const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "employee_db"
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
      name: "Tyler",
      eaten: true,
    },
    function(err, res) {
      if (err) throw err;
      console.log(res.affectedRows + " employee inserted!\n");
      // Call updateemployee AFTER the INSERT completes
      updateEmployee();
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
    console.log(res);
    // connection.end();
  });
}

// Update
function updateEmployee() {
  console.log("Updating all Rocky Road quantities...\n");
  const query = connection.query(
    "UPDATE employee SET ? WHERE ?",
    [
      {
        eaten: true
      },
      {
        name: "Impossible Employee"
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
  console.log("Deleting all Beet employee...\n");
  connection.query(
    "DELETE FROM employee WHERE ?",
    {
      name: "Beet Employee"
    },
    function(err, res) {
      if (err) throw err;
      console.log(res.affectedRows + " employee deleted!\n");
      // Call reademployee AFTER the DELETE completes
      readEmployee();
    }
  );
}


