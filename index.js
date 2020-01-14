// npm packages: npm install
const inquirer = require('inquirer');
const mysql = require('mysql');
// const createFunction = require('./createFunctions.js')

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "employee_cms_db"
});

// Connect
connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  mainPrompt();
});

const departmentList = [];
const roleList = [];
const employeeList = [];

//////////// Main function ///////////////
function mainPrompt() {
// Options Control: If no department exists, must create department before anything else can happen
  connection.query("SELECT * FROM department", function (err, res) {
    
    if (err) throw err;
    if (res.length === 0) {
      console.log("There are no departments in the database, you will need to create at least one department before adding roles and emplyees.");
      createDepartment()
      return
    };

    inquirer.prompt([{
          name: "action",
          type: "list",
          message: "What would you like to do?",
          choices: ["Add", "View", "Update", "Delete"]
        },

      ])
      .then(function (res) {
        switch (res.action) {
          case "Add":
            createData();
            break;
          case "View":
            readData();
            break;
          case "Update":
            updateData();
            break;
          case "Delete":
            deleteData();
            break;
        }
      })
      .catch(function (err) {
        console.log(err);
      })
  });
}

//////////// Create Main //////////////
function createData() {
  // get department data for list
  connection.query("SELECT * FROM department", function (err, res) {
    if (err) throw err;
    // Options Control: If no department exists, must create department before anything else can happen
    if (res.length === 0) {
      console.log("There are no departments in the database, you will need to create at least one department before adding roles and emplyees.");
      createDepartment()
      return
    };

    inquirer.prompt([{
        name: "category",
        type: "list",
        message: "What would you like to add?",
        choices: choicesArr
      }])
      .then(function (res) {
        switch (res.category) {
          case "Employee":
            createEmployee();
            break;
          case "Role":
            createRole();
            break;
          case "Department":
            createDepartment();
            break;
        }
      })
      .catch(function (err) {
        console.log(err);
      })
  })
}
////////// Create Employee ///////////
function createEmployee() {
  // get roles data for list
  connection.query("SELECT * FROM role", function (err, res) {
    if (err) throw err;
    const roles = res.map(object => {
      return {
        name: object.title,
        value: object.id
      }
    });

    // get employee data for list
    connection.query("SELECT * FROM employee", function (err, res) {
      if (err) throw err;
      const employees = res.map(object => {
        return {
          name: `${object.first_name} ${object.last_name}`,
          value: object.id
        }
      });
      employees.unshift({
        name: "no manager",
        value: "none"
      })

      // prompt for user input
      inquirer.prompt([{
            name: "first_name",
            type: "input",
            message: "What is the employee's first name?",
          },
          {
            name: "last_name",
            type: "input",
            message: "What is the employee's last name?",
          },
          {
            name: "role",
            type: "list",
            message: "What is the employee's possition?",
            choices: roles
          },
          {
            name: "manager",
            type: "list",
            message: "Who is the employee's manager?",
            choices: employees
          }
        ])
        .then(function (res) {
          console.log(res);

          console.log(`Inserting ${res.first_name} ${res.last_name} as a new employee...\n`);
          if (res.manager === "none") {
            res.manager = null
          }
          connection.query(
            "INSERT INTO employee SET ?", {
              first_name: res.first_name,
              last_name: res.last_name,
              role_id: res.role,
              manager_id: res.manager,
            },
            function (err, res) {
              if (err) throw err;
              console.log(res.affectedRows + " employee inserted!\n");
              // Call updateemployee AFTER the INSERT completes
              nextAction()
            }
          );

        })
        .catch(function (err) {
          console.log(err);
        })
    });
  });
}
///////////// Create Role /////////////////
function createRole() {
  connection.query("SELECT * FROM department", function (err, res) {
    if (err) throw err;

    // get roles data for list
    const departments = res.map(object => {
      return {
        name: object.name,
        value: object.id
      }
    });

    // prompt
    inquirer.prompt([{
          name: "title",
          type: "input",
          message: "What is the title of the new role?",
        },
        {
          name: "salary",
          type: "number",
          message: "What is the salary of the new role?",
        },
        {
          name: "department",
          type: "list",
          message: "What is the employee's department?",
          choices: departments
        }
      ])
      .then(function (res) {
        console.log("Inserting a new role...\n");
        connection.query(
          "INSERT INTO role SET ?", {
            title: res.title,
            salary: res.salary,
            department_id: res.department,
          },
          function (err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " Role inserted!\n");
            // Call updateemployee AFTER the INSERT completes
            nextAction()
          }
        );

      })
      .catch(function (err) {
        console.log(err);
      })
  });
}
///////////// Create Department /////////////////
function createDepartment() {
  inquirer.prompt([{
      name: "name",
      type: "input",
      message: "What is the name of the new Department?",
    }, ]) // add a .then/.catch
    .then(function (res) {
      console.log("Inserting a new Department...\n");
      connection.query(
        "INSERT INTO Department SET ?", {
          name: res.name,
        },
        function (err, res) {
          if (err) throw err;
          console.log(res.affectedRows + " Department inserted!\n");
          // Call updateemployee AFTER the INSERT completes
          nextAction()
        }
      );

    })
    .catch(function (err) {
      console.log(err);
    })

};


//////////////// Read Data MAIN /////////////////////
function readData() {
  inquirer.prompt([{
      name: "category",
      type: "list",
      message: "What would you like to view?",
      choices: ["Employee", "Role", "Department"]
    }])
    .then(function (res) {
      switch (res.category) {
        case "Employee":
          viewEmployee();
          break;
        case "Role":
          viewRole();
          break;
        case "Department":
          viewDepartment();
          break;
      }
    })
    .catch(function (err) {
      console.log(err);
    })
}
//////////////// View Employees /////////////////////
function viewEmployee() {
  console.log("Selecting all employees...\n");
  connection.query("SELECT a.id AS 'ID', a.first_name AS 'First Name', a.last_name AS 'Last Name', b.title AS 'Role', c.name AS 'Department', a.manager_id AS 'Manager ID' FROM employee a, role b, department c WHERE a.role_id = b.id AND b.department_id = c.id", function (err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.table(res);
    nextAction()
  });
}
//////////////// View Roles /////////////////////
function viewRole() {
  console.log("Selecting all roles...\n");
  connection.query("SELECT b.title AS 'Role', c.name AS 'Department' FROM role b, department c WHERE b.department_id = c.id", function (err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.table(res);
    nextAction()
  });
}
//////////////// View Departments /////////////////////
function viewDepartment() {
  console.log("Selecting all departments...\n");
  connection.query("SELECT * FROM department", function (err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.table(res);
    nextAction()
  });
};


///////////////// Update MAIN ///////////////////
function updateData() {
  inquirer.prompt([{
      name: "category",
      type: "list",
      message: "What would you like to update?",
      choices: ["Employee's role", "Employee's manager"]
    }])
    .then(function (res) {
      switch (res.category) {
        case "Employee's role":
          updateEmployeesRole();
          break;
        case "Employee's manager":
          updateEmployeesManager();
          break;
      }
    })
    .catch(function (err) {
      console.log(err);
    })
}
////////// Update Employee's Role ///////////
function updateEmployeesRole() {
  // get roles data for list
  connection.query("SELECT * FROM role", function (err, res) {
    if (err) throw err;
    const roles = res.map(object => {
      return {
        name: object.title,
        value: object.id
      }
    });

    // get employee data for list
    connection.query("SELECT * FROM employee", function (err, res) {
      if (err) throw err;
      const employees = res.map(object => {
        return {
          name: `${object.first_name} ${object.last_name}`,
          value: object.id
        }
      });
      employees.unshift({
        name: "no manager",
        value: "none"
      })
      console.log("Updating employee position...\n");
      inquirer.prompt([{
            name: "name",
            type: "list",
            message: "Which employee would you like to change roles?",
            choices: employees,
          },
          {
            name: "role",
            type: "list",
            message: "What would you like to change their role to?",
            choices: roles,
          }
        ])
        .then(function (res) {
          console.log(res);

          console.log("Modifying employee's role...\n");
          if (res.manager === "none") {
            res.manager = null
          }
          connection.query(
            "UPDATE employee SET ? WHERE ?",
            [{
                role_id: res.role
              },
              {
                id: res.name
              }
            ],
            function (err, res) {
              if (err) throw err;
              console.log(res.affectedRows + " employee updated!\n");
              // Call deleteemployee AFTER the UPDATE completes
              nextAction()
            }
          );
        })
        .catch(function (err) {
          console.log(err);
        });
    });
  });
};
////////// Update Employee's Manager ///////////
function updateEmployeesManager() {
  // get employee data for list
  getEmployeeList()
  getRolesList()



  connection.query("SELECT * FROM employee", function (err, res) {
    if (err) throw err;
    const employees = res.map(object => {
      return {
        name: `${object.first_name} ${object.last_name}`,
        value: object.id
      }
    });
    connection.query("SELECT * FROM employee", function (err, res) {
      if (err) throw err;
      const managers = res.map(object => {
        return {
          name: `${object.first_name} ${object.last_name}`,
          value: object.id
        }
      });
      managers.unshift({
        name: "no manager",
        value: "none"
      })

      inquirer.prompt([{
            name: "name",
            type: "list",
            message: "Which employee would you like to change managers?",
            choices: employees,
          },
          {
            name: "manager",
            type: "list",
            message: "Who would you like to change their manager to?",
            choices: managers,
          }
        ])
        .then(function (res) {
          console.log(res);

          console.log("Modifying employee's role...\n");
          if (res.manager === "none") {
            res.manager = null
          }
          connection.query(
            "UPDATE employee SET ? WHERE ?",
            [{
                manager_id: res.manager
              },
              {
                id: res.name
              }
            ],
            function (err, res) {
              if (err) throw err;
              console.log(res.affectedRows + " employee updated!\n");
              // Call deleteemployee AFTER the UPDATE completes
              nextAction()
            }
          );
        })
        .catch(function (err) {
          console.log(err);
        });
    });
  });
};



//////////////// Delete MAIN ////////////////////
function deleteData() {
  inquirer.prompt([{
      name: "category",
      type: "list",
      message: "What would you like to delete?",
      choices: ["Employee", "Role", "Department"]
    }])
    .then(function (res) {
      switch (res.category) {
        case "Employee":
          deleteEmployee();
          break;
        case "Role":
          deleteRole();
          break;
        case "Department":
          deleteDepartment();
          break;
      }
    })
    .catch(function (err) {
      console.log(err);
    })
}

function deleteEmployee(res) {
  // get employee data for list
  connection.query("SELECT * FROM employee", function (err, res) {
    if (err) throw err;
    const employees = res.map(object => {
      return {
        name: `${object.first_name} ${object.last_name}`,
        value: object.id
      }
    });
    // prompt for user input
    inquirer.prompt([{
        name: "name",
        type: "list",
        message: "What first name of the employee that you would like to delete?",
        choices: employees,
      }])
      .then(function (res) {
        connection.query(
          "DELETE FROM employee WHERE ?", {
            id: res.name
          },
          function (err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " employee deleted!\n");
            nextAction()
          });
      })
      .catch(function (err) {
        console.log(err);
      });
  });
};

function deleteRole() {
  inquirer.prompt([{
      name: "title",
      type: "input",
      message: "What the role that you would like to delete?",
    }])
    .then(function (res) {
      connection.query(
        "DELETE FROM employee WHERE ?", {
          title: res.title
        },
        function (err, res) {
          if (err) throw err;
          console.log(res.affectedRows + " employee deleted!\n");
          nextAction()
        }
      );

    })
    .catch(function (err) {
      console.log(err);
    })
}

function deleteDepartment() {
  inquirer.prompt([{
      name: "name",
      type: "input",
      message: "What name of the department that you would like to delete?",
    }])
    .then(function (res) {
      connection.query(
        "DELETE FROM department WHERE ?", {
          first_name: res.name
        },
        function (err, res) {
          if (err) throw err;
          console.log(res.affectedRows + " employee deleted!\n");
          nextAction()
        }
      );
    })
    .catch(function (err) {
      console.log(err);
    })
}

/////////////// Next Action or EXIT ////////////////
function nextAction() {
  inquirer.prompt({
      name: "action",
      type: "list",
      message: "Would you like to take another action or exit the programs?",
      choices: ["Take another action", "EXIT"]
    })
    .then(function (res) {
      console.log(`${res.action}...\n`);
      switch (res.action) {
        case "EXIT":
          connection.end();
          break;
        case "Take another action":
          mainPrompt();
          break;
      }
    })
    .catch(function (err) {
      console.log(err);
    })
}