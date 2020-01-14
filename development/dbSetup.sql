DROP DATABASE IF EXISTS`employee_cms_db`;
CREATE DATABASE IF NOT EXISTS`employee_cms_db`;

USE`employee_cms_db`;

CREATE TABLE IF NOT EXISTS`department`(
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS`role`(
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    department_id INT(30) NOT NULL REFERENCES department.id,
    PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS`employee`(
    id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT(10) NOT NULL REFERENCES role.id,
    manager_id INT(10) REFERENCES employee.id,
    PRIMARY KEY(id)
);