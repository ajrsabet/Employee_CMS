DROP DATABASE IF EXISTS`employee_cms_db`;
CREATE DATABASE IF NOT EXISTS`employee_cms_db`;

USE`employee_cms_db`;

CREATE TABLE IF NOT EXISTS`department`(
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    PRIMARY KEY(id)
);


CREATE TABLE IF NOT EXISTS`role`(
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(50) NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    department_id INT NOT NULL,
    FOREIGN KEY (department_id) REFERENCES department.id
    ON UPDATE CASCADE ON DELETE RESTRICT,
    PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS`employee`(
    id INT NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role_id INT NOT NULL,
    manager_id INT,
    FOREIGN KEY (role_id) REFERENCES role.id
    ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (manager_id) REFERENCES manager.id
    ON UPDATE CASCADE ON DELETE RESTRICT,
    PRIMARY KEY(id)
);



USE`employee_cms_db`;
SELECT a.first_name, a.last_name, b.title, c.name, a.manager_id
      FROM employee a, role b, department c
      WHERE a.role_id = b.id AND b.department_id = c.id;