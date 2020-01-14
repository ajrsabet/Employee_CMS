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

// global function variables
// let employeeList = [];
// let employeeNames = [];
//////////// Main function ///////////////
function mainPrompt() {
  inquirer.prompt([{
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: ["Add", "View", "Update", "Delete"]
      },
      {
        name: "category",
        type: "list",
        message: "What category?",
        choices: ["Employee", "Role", "Department"]
      }
    ]) // add a .then/.catch
    .then(function (res) {
      console.log(`You chose to ${res.action} a ${res.category}`);


      switch (res.action) {
        case "Add":
          module.exports
          createData(res.category);
          break;
        case "View":
          readData(res.category);
          break;
        case "Update":
          updateData(res.category);
          break;
        case "Delete":
          deleteData(res.category);
          break;
      }
    })
    .catch(function (err) {
      console.log(err);
    })
}

//////////// Create //////////////
function createData(category) {

  switch (category) {
    ////////// Create Employee ///////////
    case 'Employee':
      connection.query("SELECT * FROM role", function (err, res) {
        if (err) throw err;

        // get roles data for list
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
      break;
      ///////////// Create Role /////////////////
    case 'Role':
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
      break;
      ///////////// Create Department /////////////////
    case 'Department':
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
      break;
  }
};


//////////////// Read Data /////////////////////
function readData(res) {
  switch (res) {
    case "Employee":
      console.log("Selecting all employees...\n");
      connection.query("SELECT * FROM employee", function (err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement
        console.table(res);
        nextAction()
      });
      break;
    case "Role":
      console.log("Selecting all roles...\n");
      connection.query("SELECT * FROM role", function (err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement
        console.table(res);
        nextAction()
      });
      break;
    case "Department":
      console.log("Selecting all departments...\n");
      connection.query("SELECT * FROM department", function (err, res) {
        if (err) throw err;
        // Log all results of the SELECT statement
        console.table(res);
        nextAction()
      });
      break;
  }
}

///////////////// Update ///////////////////
function updateData(category) {
  switch (category) {
    ////////// Create Employee ///////////
    case 'Employee':
      console.log("Updating employee position...\n");
      inquirer.prompt([{
            name: "first_name",
            type: "input",
            message: "Which employee would you like to modify roles?",
          },
          {
            name: "role_id",
            type: "input",
            message: "What would you like to change their role to?",
          }
        ]) // add a .then/.catch
        .then(function (res) {
          console.log("Inserting a new employee...\n");
          connection.query(
            "UPDATE employee SET ? WHERE ?",
            [{
                role_id: res.role_id
              },
              {
                first_name: res.first_name
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
        })
      break;
    case 'Role':
      console.log("Updating Role salary...\n");
      inquirer.prompt([{
            name: "title",
            type: "input",
            message: "Which role would you like to modify the salary?",
          },
          {
            name: "salary",
            type: "number",
            message: "What would you like to change the salary to?",
          }
        ]) // add a .then/.catch
        .then(function (res) {
          console.log("Updating salary information...\n");
          connection.query(
            "UPDATE employee SET ? WHERE ?",
            [{
                salary: res.salary
              },
              {
                title: res.title
              }
            ],
            function (err, res) {
              if (err) throw err;
              console.log(res.affectedRows + " role salary updated!\n");
              // Call deleteemployee AFTER the UPDATE completes
              nextAction()
            }
          );
        })
        .catch(function (err) {
          console.log(err);
        })
      break;
    case 'Department':
      console.log("Nothing to update here! Sorry...\n");
      nextAction()
      break;
  }
};

//////////////// Delete ////////////////////
function deleteData(res) {

  switch (res) {
    case "Employee":
      inquirer.prompt([{
          name: "first_name",
          type: "input",
          message: "What first name of the employee that you would like to delete?",
        }])
        .then(function (res) {
          connection.query(
            "DELETE FROM employee WHERE ?", {
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

      break;
    case "Role":
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

      break;
    case "Department":
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

      break;
  }
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