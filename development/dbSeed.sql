USE`employee_cms_db`;

INSERT INTO department(name) VALUES ('Administration'),('Accounting'),('Purchasing'),('Engineering'),('Project Management'),('Production'),('Human Resources'),('Marketing');

INSERT INTO role(title, salary, department_id) VALUES('General Manager',131557 ,1),('Project Manager',91121 ,5),('Purchasing Manager',72359 ,3),('Engineer Manager',121221 ,4),('HR Director',72247 ,7),('Accounting Director',78576 ,2),('Marketing Director',86718 ,8);

INSERT INTO employee(first_name,last_name,role_id,manager_id) VALUES('Vanessa','Castillo', 1, ),('Bob','Schatz', 2, 1),('Abigail','Smith', 3, 1),('Alan','Watson', 4, 1),('Aaron','Castillo', 5, 1),('Heidi','Fisher', 6, 1),('Jinnifer','Garner', 7, 1);


SELECT * FROM department;
SELECT * FROM role;
SELECT * FROM employee;