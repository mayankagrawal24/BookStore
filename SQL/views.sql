CREATE OR REPLACE VIEW OrdersView AS
SELECT Book.*, SoldBooks.customerOrderId, quantity, Author.name, date
FROM SoldBooks NATURAL JOIN Book INNER JOIN Author ON (Book.isbn=Author.isbn) INNER JOIN CustomerOrder ON (SoldBooks.customerOrderID=CustomerOrder.customerOrderID);