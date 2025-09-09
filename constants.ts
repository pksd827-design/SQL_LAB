
export const SAMPLE_DATA = [
`CREATE TABLE employees (
    id INT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    department_id INT,
    salary DECIMAL(10, 2)
);`,
`INSERT INTO employees (id, first_name, last_name, email, department_id, salary) VALUES
(1, 'John', 'Doe', 'john.doe@example.com', 1, 75000.00),
(2, 'Jane', 'Smith', 'jane.smith@example.com', 2, 82000.00),
(3, 'Peter', 'Jones', 'peter.jones@example.com', 1, 68000.00),
(4, 'Mary', 'Johnson', 'mary.johnson@example.com', 3, 95000.00),
(5, 'David', 'Williams', 'david.w@example.com', 2, 79000.00),
(6, 'Emily', 'Brown', 'emily.b@example.com', 3, 105000.00);`,
`CREATE TABLE departments (
    id INT PRIMARY KEY,
    name VARCHAR(100)
);`,
`INSERT INTO departments (id, name) VALUES
(1, 'Engineering'),
(2, 'Marketing'),
(3, 'Product');`
];
