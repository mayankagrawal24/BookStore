CREATE OR REPLACE VIEW OrdersView AS
SELECT Book.*, SoldBooks.customerOrderId, quantity as qty, Author.name
FROM SoldBooks NATURAL JOIN Book INNER JOIN Author ON (Book.isbn=Author.isbn)

