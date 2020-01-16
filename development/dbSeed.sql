USE`employee_cms_db`;


INSERT INTO department(name) VALUES ('Administration'),('Accounting'),('Purchasing'),('Engineering'),('Project Management'),('Production'),('Human Resources'),('Marketing');

INSERT INTO role(title, salary, department_id) VALUES('General Manager',131557 ,1),('Project Manager',91121 ,5),('Purchasing Manager',72359 ,3),('Engineer Manager',121221 ,4),('HR Director',72247 ,7),('Accounting Director',78576 ,2),('Marketing Director',86718 ,8);

INSERT INTO employee(first_name,last_name,role_id,manager_id) VALUES('Lara','Croft', 1, null),('Freddie','Mercury', 2, 1),('Violet','Evergarden', 3, 1),('Tyler','Durden', 4, 1),('Maleficent','NA', 5, 1),('Connor', 'MacManus', 6, 1),('Murphy','MacManus', 7, 1);


SELECT SUM(salary),department.name FROM role JOIN department ON role.department_id = department.id GROUP BY role.department_id;

SELECT employee.id AS 'Employee ID', employee.first_name AS 'First Name', employee.last_name AS 'Last Name', role.title AS 'Role', role.salary AS 'Salary', department.name AS 'Department', manager.first_name AS 'Manager First', manager.last_name AS 'Manager Last'  
FROM employee LEFT JOIN employee AS manager ON  employee.manager_id=manager.id LEFT JOIN role ON employee.role_id=role.id LEFT JOIN department ON role.department_id=department.id; 
