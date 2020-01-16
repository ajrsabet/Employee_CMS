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
connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  mainPrompt();
});

let departmentList = [];
let roleList = [];
let employeeList = [];
let managerList = [];

console.log("\x1b[36m", "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
console.log("\x1b[32m", "WELCOME TO YOUR EMPLOYEE EMS");
console.log("\x1b[36m", "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~", "\x1b[37m");

//////////// Main function ///////////////
function mainPrompt() {
  // get departments data for inquire lists  
  connection.query("SELECT * FROM department", function (err, res) {
    if (err) throw err;
    departmentList = [];
    departmentList = res.map(object => {
      return {
        name: object.name,
        value: object.id
      }
    });
    if (departmentList.length === 0) {
      console.log("\x1b[33m", "No departments have been created, you must create at least one department before adding roles or emplyees.", "\x1b[37m");
      createDepartment()
      return
    };
  
    // get roles data for inquire lists
    connection.query("SELECT * FROM role", function (err, res) {
      if (err) throw err;
      roleList = [];
      roleList = res.map(object => {
        return {
          name: object.title,
          value: object.id
        }
      });

      // get employee data for inquire lists
      connection.query("SELECT * FROM employee", function (err, res) {
        if (err) throw err;
        employeeList = [];
        employeeList = res.map(object => {
          return {
            name: `${object.first_name} ${object.last_name}`,
            value: object.id
          }
        });

        // add a "no manager option" to employee list to create a manager list
        managerList = [];
        managerList = employeeList;
        managerList.unshift({
          name: "no manager",
          value: "none"
        })

        // Initial user prompt
        inquirer.prompt([{
              name: "action",
              type: "list",
              message: "What would you like to do?",
              choices: ["Add", "View", "Update", "Delete", "EXIT"]
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
              case "EXIT":
                connection.end();
                break;
            }
          })
          .catch(function (err) {
            console.log(err);
          })
      });
    });
  });
}

//////////// Create Main //////////////
function createData() {
  let choiceList = ["Employee", "Role", "Department", "Cancel"]
  if (roleList.length === 0) {
    console.log("\x1b[33m", "No roles have been created, you must create a role before adding an employee.", "\x1b[37m");
    choiceList = ["Role", "Department", "Cancel"]
  };
  inquirer.prompt([{
      name: "category",
      type: "list",
      message: "What would you like to add?",
      choices: choiceList
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
        case "Cancel":
          mainPrompt();
          break;
      }
    })
    .catch(function (err) {
      console.log(err);
    });
}
////////// Create Employee ///////////
function createEmployee() {
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
        message: "What is the employee's Role?",
        choices: roleList
      },
      {
        name: "manager",
        type: "list",
        message: "Who is the employee's manager?",
        choices: managerList
      }
    ])
    .then(function (res) {
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
          mainPrompt()
        }
      );

    })
    .catch(function (err) {
      console.log(err);
    })
}
///////////// Create Role /////////////////
function createRole() {
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
        message: "What is the roles's department?",
        choices: departmentList
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
          mainPrompt()
        }
      );

    })
    .catch(function (err) {
      console.log(err);
    })
}
///////////// Create Department /////////////////
function createDepartment() {
  inquirer.prompt([{
      name: "name",
      type: "input",
      message: "What is the name of the new Department?",
    }, ])
    .then(function (res) {
      console.log("Inserting a new Department...\n");
      connection.query(
        "INSERT INTO Department SET ?", {
          name: res.name,
        },
        function (err, res) {
          if (err) throw err;
          console.log(res.affectedRows + " Department inserted!\n");
          mainPrompt()
        }
      );
    })
    .catch(function (err) {
      console.log(err);
    })

};

//////////////// Read Data MAIN /////////////////////
function readData() {
  let choiceList = ["Employee", "Role", "Department", "Department Budget", "Cancel"];
  if (roleList.length === 0) {
    console.log("\x1b[33m", "There are no roles or employees in the database. You may view departments", "\x1b[37m");
    choiceList = ["Department", "Cancel"];
  } else if (employeeList.length === 0) {
    console.log("\x1b[33m", "There are no employees in the database. You may view departments and roles", "\x1b[37m");
    choiceList = ["Role", "Department", "Cancel"];
  }
  inquirer.prompt([{
      name: "category",
      type: "list",
      message: "What would you like to view?",
      choices: choiceList
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
        case "Department Budget":
          viewDepartmentBudget();
          break;
        case "Cancel":
          mainPrompt();
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
  connection.query("SELECT employee.id AS 'Employee ID', employee.first_name AS 'First Name', employee.last_name AS 'Last Name', role.title AS 'Role', role.salary AS 'Salary', department.name AS 'Department', manager.first_name AS 'Manager First', manager.last_name AS 'Manager Last'  FROM employee LEFT JOIN employee AS manager ON  employee.manager_id=manager.id LEFT JOIN role ON employee.role_id=role.id LEFT JOIN department ON role.department_id=department.id;", function (err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.table(res);
    mainPrompt()
  });
}
//////////////// View Roles /////////////////////
function viewRole() {
  console.log("Selecting all roles...\n");
  connection.query("SELECT b.id,b.title AS 'Role', b.salary AS 'Salary', c.name AS 'Department' FROM role b, department c WHERE b.department_id = c.id", function (err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.table(res);
    mainPrompt()
  });
}
//////////////// View Departments /////////////////////
function viewDepartment() {
  console.log("Selecting all departments...\n");
  connection.query("SELECT * FROM department", function (err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.table(res);
    mainPrompt()
  });
};
//////////////// View Budgets by Department /////////////////////
function viewDepartmentBudget() {
  console.log("Selecting all departments...\n");
  connection.query("SELECT SUM(salary),department.name FROM role JOIN department ON role.department_id = department.id GROUP BY role.department_id;", function (err, resDep) {
    if (err) throw err;
    console.table(resDep);
    mainPrompt()
  });
};


///////////////// Update MAIN ///////////////////
function updateData() {
  inquirer.prompt([{
      name: "category",
      type: "list",
      message: "What would you like to update?",
      choices: ["Employee's role", "Employee's manager", "Role Salary", "Cancel"]
    }])
    .then(function (res) {
      switch (res.category) {
        case "Employee's role":
          updateEmployeesRole();
          break;
        case "Employee's manager":
          updateEmployeesManager();
          break;
        case "Role Salary":
          updateRoleSalary();
          break;
        case "Cancel":
          mainPrompt();
          break;
      }
    })
    .catch(function (err) {
      console.log(err);
    })
}
////////// Update Employee's Role ///////////
function updateEmployeesRole() {
  inquirer.prompt([{
        name: "name",
        type: "list",
        message: "Which employee would you like to change roles?",
        choices: employeeList,
      },
      {
        name: "role",
        type: "list",
        message: "What would you like to change their role to?",
        choices: roleList,
      }
    ])
    .then(function (res) {
      console.log("Modifying employee's role...\n");
      if (res.manager === "none") {
        res.manager = null
      }
      connection.query(
        "UPDATE employee SET ? WHERE ?",
        [{
            role_id: res.role},{
            id: res.name
          }
        ],
        function (err, res) {
          if (err) throw err;
          console.log(res.affectedRows + " employee updated!\n");
          mainPrompt();
        }
      );
    })
    .catch(function (err) {
      console.log(err);
    });
};
////////// Update Employee's Manager ///////////
function updateEmployeesManager() {
  inquirer.prompt([{
        name: "name",
        type: "list",
        message: "Which employee would you like to change managers?",
        choices: employeeList,
      },
      {
        name: "manager",
        type: "list",
        message: "Who would you like to change their manager to?",
        choices: managerList,
      }
    ])
    .then(function (res) {
      console.log("Modifying employee's role...\n");
      if (res.manager === "none") {
        res.manager = null
      }
      connection.query(
        "UPDATE employee SET ? WHERE ?", {
          manager_id: res.manager},{
          id: res.name
        },
        function (err, res) {
          if (err) throw err;
          console.log(res.affectedRows + " employee updated!\n");
          // Call deleteemployee AFTER the UPDATE completes
          mainPrompt()
        }
      );
    })
    .catch(function (err) {
      console.log(err);
    });
};
////////// Update Role Salary ///////////
function updateRoleSalary() {
  inquirer.prompt([{
        name: "role_id",
        type: "list",
        message: "Which role would you like to update the salary on?",
        choices: roleList,
      },
      {
        name: "salary",
        type: "number",
        message: "What would you like to change the salary to?",
      }
    ])
    .then(function (res) {
      console.log("Modifying salary information...\n");
      connection.query(
        "UPDATE role SET salary = ? WHERE id = ?", [res.salary, res.role_id],
        function (err, res) {
          if (err) throw err;
          console.log(res.affectedRows + " employee updated!\n");
          mainPrompt()
        }
      );
    })
    .catch(function (err) {
      console.log(err);
    });
};

//////////////// Delete MAIN ////////////////////
function deleteData() {
  let choiceList = ["Employee", "Role", "Department", "Cancel"];
  if (roleList.length === 0) {
    choiceList = ["Department", "Cancel"];
  } else if (employeeList.length === 0) {
    choiceList = ["Role", "Department", "Cancel"];
  }
  inquirer.prompt([{
      name: "category",
      type: "list",
      message: "What would you like to delete?",
      choices: choiceList
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
        case "Cancel":
          mainPrompt();
          break;
      }
    })
    .catch(function (err) {
      console.log(err);
    })
}
//////////////// Delete Employee ////////////////////
function deleteEmployee() {
  inquirer.prompt([{
      name: "name",
      type: "list",
      message: "What first name of the employee that you would like to delete?",
      choices: employeeList,
    }])
    .then(function (res) {
      connection.query(
        "DELETE FROM employee WHERE ?", {
          id: res.name
        },
        function (err, res) {
          if (err) throw err;
          console.log(res.affectedRows + " employee deleted!\n");
          mainPrompt()
        });
    })
    .catch(function (err) {
      console.log(err);
    });
};
//////////////// Delete Role ////////////////////
function deleteRole() {
  // get role data to validate delete
  connection.query("SELECT * FROM employee", function (err, res) {
    if (err) throw err;
    console.table(res);
    rolesOnEmployees = res.map(object => object.role_id);

    // Prompt
    inquirer.prompt([{
        name: "role",
        type: "list",
        message: "What the role that you would like to delete?",
        choices: roleList
      }])
      .then(function (res) {
        if (rolesOnEmployees.includes(res.role)) {
          console.log("\x1b[31m", "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
          console.log("\x1b[33m", "There are still employees with this role, delete or modify these employees before deleting this role");
          console.log("\x1b[31m", "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~", "\x1b[37m");
          mainPrompt();
          return;
        } else {
          connection.query(
            "DELETE FROM role WHERE ?", {
              id: res.role_id
            },
            function (err, res) {
              if (err) throw err;
              console.log(res.affectedRows + " employee deleted!\n");
              mainPrompt();
            }
          );
        }
      })
      .catch(function (err) {
        console.log(err);
      })
  })
}
//////////////// Delete Department ////////////////////
function deleteDepartment() {
  // get role data to validate delete
  connection.query("SELECT * FROM role", function (err, res) {
    if (err) throw err;
    console.table(res);

    departmentInRoles = res.map(object => object.department_id);
    console.log(JSON.stringify(departmentInRoles));

    // Prompt
    inquirer.prompt([{
        name: "department",
        type: "list",
        message: "What department would like to delete?",
        choices: departmentList
      }])
      .then(function (res) {
        console.log(res);

        if (departmentInRoles.includes(res.department)) {
          console.log("\x1b[31m", "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
          console.log("\x1b[33m", "There are still roles connected to this department, delete or modify these roles before deleting this department");
          console.log("\x1b[31m", "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~", "\x1b[37m");
          mainPrompt();
          return;
        } else {
          connection.query(
            "DELETE FROM department WHERE ?", {
              id: res.department
            },
            function (err, res) {
              if (err) throw err;
              console.log(res.affectedRows + " Departments deleted!\n");
              mainPrompt();
            }
          );
        }
        mainPrompt();
      })
      .catch(function (err) {
        console.log(err);
      })
  })
}