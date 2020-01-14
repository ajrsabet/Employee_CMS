// const inquirer = require('inquirer');
// const mysql = require('mysql');
// const mainFunction = require('./index.js')

 let createData = {
   ////////// Create Employee ///////////
createEmployee: function createEmployee() {
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
},
///////////// Create Role /////////////////
createDepartment: function createRole() {
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
},
///////////// Create Department /////////////////
createDepartment: function createDepartment() {
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
  }

module.exports = createData;

