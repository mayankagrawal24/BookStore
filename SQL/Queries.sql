-- Select Query to seach for books using our wildcard implementation
SELECT book.*, coalesce(STRING_AGG(author.name,','),'No author') as author_list
              FROM Book left join Author using (isbn)
              WHERE isbn = $1 group by isbn, title, genre, numPages, price

-- Select Query to seach for all books and shows all authors along with it 
SELECT book.*, coalesce(STRING_AGG(author.name,','),'No author') as author_list from Book left join Author using (isbn) group by isbn, title, genre, numPages, price

-- Select Query to get publisher information 
Select name, publisherID from Publisher

-- Insert Query to create a new book
INSERT INTO BOOK(ISBN, title, genre, numPages, price, cost, stock, display, publisherCut) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)

-- Insert Query to attach the author to the book
INSERT INTO Author(name, ISBN) VALUES($1, $2)

-- Insert query to attach publisher to the book
INSERT into MAKES(isbn, publisherID) VALUES ($1, $2)

-- Update query to update the quantity for a specific book
UPDATE BOOK SET stock = $1 WHERE ISBN = $2 RETURNING *

-- Update Query to update weather the book is displayed to the customers or not
UPDATE BOOK SET display = $1 WHERE ISBN = $2 RETURNING *

-- Insert query to create an address 
INSERT INTO Address(street, streetNumber, postalCode, province, country) VALUES($1, $2, $3, $4, $5) RETURNING addressID

-- Insert Query to create a new publisher
INSERT INTO Publisher(name, email, bankingAccount, addressID) VALUES($1, $2, $3, $4) RETURNING publisherID

-- Insert each phone number for a publisher
INSERT INTO PhoneNumber(publisherID, phoneNumber) VALUES($1, $2)

-- Insert for a store order
INSERT into StoreOrder(ownerID) VALUES($1) RETURNING orderid

-- Insert for adding the quanity for a specific book that has been ordered for the store
INSERT INTO orderedBooks(quantity, orderID, ISBN) VALUES($1, $2, $3)

-- Report Stuff
SELECT isbn, title, sum(quantity) as qty, sum(quantity) as qty, sum(quantity * price) as total_price, sum(quantity * cost) as total_cost FROM OrdersView WHERE date >= $1::date AND date <= $2::date GROUP BY isbn, title
SELECT name, sum(quantity) as qty, sum(quantity) as qty, sum(quantity * price) as total_price, sum(quantity * cost) as total_cost FROM OrdersView WHERE date >= $1::date AND date <= $2::date GROUP BY name
SELECT genre, sum(quantity) as qty, sum(quantity) as qty, sum(quantity * price) as total_price, sum(quantity * cost) as total_cost FROM OrdersView WHERE date >= $1::date AND date <= $2::date GROUP BY genre
SELECT isbn, title, sum(quantity) as qty, sum(quantity) as qty, sum(quantity * price) as total_price, sum(quantity * cost) as total_cost FROM OrdersView WHERE date >= $1::date AND date <= $2::date GROUP BY isbn, title

-- Query to get information for publisher Payout page
SELECT * From CustomerOrder natural join SoldBooks natural join Book natural join makes natural join publisher where completed = $1

-- Query to get customer information for login credentials
SELECT * FROM customer where email=$1

-- Query to get owner information for login credentials
SELECT * FROM owner where email=$1

-- Query to insert into Address for customer creation for both billing address and shipping address
INSERT INTO Address(street, streetNumber, postalCode, province, country) VALUES($1, $2, $3, $4, $5) RETURNING addressID

-- Query to insert into billingShipping table for customer creation
INSERT INTO BillingShipping(creditCardName, creditCardNumber, cvv, expiry, billingAddressID, shippingAddressID) VALUES($1, $2, $3, $4, $5, $6) RETURNING BSID

-- Query to insert a new customer
INSERT INTO Customer(name, email, password, BSID) VALUES($1, $2, $3, $4) RETURNING customerID

-- Query to get any open orders for a specifc customer
SELECT * FROM CustomerOrder WHERE customerID = $1 AND completed = $2

-- Query to insert a new customerOrder
INSERT INTO CustomerOrder(customerID, completed) VALUES($1, $2) RETURNING customerOrderID

-- Query to get if a specifc book is already in a customer's current order
Select * from SoldBooks Where ISBN=$1 and customerOrderID=$2

-- Query to insert a book into a customerOrder and add the quantity
INSERT INTO SoldBooks(quantity, customerOrderID, ISBN) VALUES($1, $2, $3)

-- Query to just update a quantity for a book currently in the customer order
UPDATE SoldBooks SET quantity = quantity + $1::int Where ISBN=$2::int and customerOrderID=$3::int

-- Query to just update quantity book values in the cart
UPDATE SoldBooks SET quantity = $1 WHERE isbn = $2 and customerOrderID = $3

-- Query to delete a book from the current order
DELETE from SoldBooks where customerOrderId = $1 and isbn = $2

-- Query to get current order information for a customer
SELECT * From CustomerOrder natural join SoldBooks natural join Book inner join customer on (CustomerOrder.customerId = Customer.customerId) where customer.customerid = $1 and completed = $2

-- Query to get current customer order for a customer
SELECT * FROM CustomerOrder WHERE customerID = $1 AND completed = $2 

-- Query to insert into address
INSERT INTO Address(street, streetNumber, postalCode, province, country) VALUES($1, $2, $3, $4, $5) RETURNING addressid

-- Query to insert into BillingShipping Table
INSERT INTO BillingShipping(creditCardName, creditCardNumber, cvv, expiry, billingAddressID, shippingAddressID) VALUES($1, $2, $3, $4, $5, $6) RETURNING BSID

-- Query to get the customers saved billingShipping information
SELECT BSID from Customer where customerID = $1 LIMIT 1

-- Query to get the current order items for a customer
SELECT * From CustomerOrder natural join SoldBooks natural join Book inner join customer on (CustomerOrder.customerId = Customer.customerId) where customer.customerid = $1 and completed = $2

-- Query to update the customerOrder when checking out
UPDATE CustomerOrder SET BSID = $1, trackingNumber = $2, total = $3 WHERE customerOrderID = $4

-- Query to set current customer order to Complete
UPDATE CustomerOrder set completed = $1 where customerOrderID = $2

-- Query to set tracking number for a customer order
UPDATE CustomerOrder SET trackingNumber = $1 WHERE customerOrderID = $2

-- Query to search for a book based on search filters
SELECT 
          book.*,
          coalesce(STRING_AGG(author.name,','),'No author') as author_list
       FROM 
          Book left join Author using (isbn)
       WHERE 
          ${category}::TEXT ILIKE $1 AND 
          display=true
       GROUP BY
          isbn, 
          title, 
          genre, 
          numPages, 
          price;


-- Query to get all previous customer orders that have been completed
SELECT * From CustomerOrder natural join SoldBooks natural join Book inner join customer on (CustomerOrder.customerId = Customer.customerId) where CustomerOrder.customerorderid = $1


