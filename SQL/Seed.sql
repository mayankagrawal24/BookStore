TRUNCATE TABLE Address RESTART IDENTITY CASCADE;
TRUNCATE TABLE BillingShipping RESTART IDENTITY CASCADE;
TRUNCATE TABLE Customer RESTART IDENTITY CASCADE;
TRUNCATE TABLE Owner RESTART IDENTITY CASCADE;
TRUNCATE TABLE CustomerOrder RESTART IDENTITY CASCADE;
TRUNCATE TABLE Book CASCADE;
TRUNCATE TABLE SoldBooks CASCADE;
TRUNCATE TABLE StoreOrder RESTART IDENTITY CASCADE;
TRUNCATE TABLE OrderedBooks CASCADE;
TRUNCATE TABLE Author CASCADE;
TRUNCATE TABLE Publisher RESTART IDENTITY CASCADE;
TRUNCATE TABLE Makes CASCADE;
TRUNCATE TABLE PhoneNumber CASCADE;

INSERT INTO Address(street, streetNumber, postalCode, province, country) VALUES('Burrito', 2, 'K2L3MK', 'ON', 'Canada');
INSERT INTO Address(street, streetNumber, postalCode, province, country) VALUES('Sock', 122, 'K2L4MK', 'ON', 'Canada');
INSERT INTO Address(street, streetNumber, postalCode, province, country) VALUES('Shawarma', 211, 'K2Q3MK', 'ON', 'Canada');
INSERT INTO Address(street, streetNumber, postalCode, province, country) VALUES('Mink', 178, 'K2L3OK', 'ON', 'Canada');
INSERT INTO Address(street, streetNumber, postalCode, province, country) VALUES('Addy', 17123, 'O2L3OK', 'AB', 'Canada');
INSERT INTO Address(street, streetNumber, postalCode, province, country) VALUES('Cool', 4325, 'K2D3OK', 'ON', 'Canada');

INSERT INTO BillingShipping(creditCardName, creditCardNumber, cvv, expiry, billingAddressID, shippingAddressID) VALUES('Bean Beaner', 123456789, 123, 1023, 1, 2);
INSERT INTO BillingShipping(creditCardName, creditCardNumber, cvv, expiry, billingAddressID, shippingAddressID) VALUES('Jane Jog', 943287432, 234, 1123, 3, 4);

INSERT INTO Customer(name, email, password, BSID) VALUES('Bean Burrito', 'bean@gmail.com', 'bean', 1);
INSERT INTO Customer(name, email, password, BSID) VALUES('Beat Meat', 'beat@gmail.com', 'beat', 2);

INSERT INTO Owner (name, email, password) VALUES ('Owner Pwner', 'owner@gmail.com', 'owner');

INSERT INTO Book (ISBN, title, genre, numPages, price, cost, stock, display) VALUES (12345, 'To Kill A Bean', 'Action', 100, 1000, 500, 15, TRUE);
insert into Book (ISBN, title, genre, numPages, price, cost, stock, display) values (946983, 'Pumping Iron', 'Documentary', 2573, 7852, 955, 465, true);
insert into Book (ISBN, title, genre, numPages, price, cost, stock, display) values (218993, 'Death Defying Acts', 'Drama|Romance|Thriller', 4500, 8490, 344, 901, false);
insert into Book (ISBN, title, genre, numPages, price, cost, stock, display) values (82617, 'Gunbuster (Top wo Narae)', 'Action|Animation|Drama|Sci-Fi', 613, 7413, 487, 641, true);
insert into Book (ISBN, title, genre, numPages, price, cost, stock, display) values (805414, 'Rain or Shine', 'Comedy|Drama|Romance', 2777, 5647, 449, 459, true);
insert into Book (ISBN, title, genre, numPages, price, cost, stock, display) values (253919, 'Allegro non troppo', 'Animation|Comedy|Fantasy|Musical', 5431, 4291, 744, 530, true);
insert into Book (ISBN, title, genre, numPages, price, cost, stock, display) values (539880, 'Loins of Punjab Presents', 'Comedy', 3692, 8431, 981, 622, false);
insert into Book (ISBN, title, genre, numPages, price, cost, stock, display) values (456676, 'Ripe', 'Drama', 116, 9220, 336, 712, true);
insert into Book (ISBN, title, genre, numPages, price, cost, stock, display) values (185962, 'Big Chill, The', 'Comedy|Drama', 5162, 7454, 630, 29, false);
insert into Book (ISBN, title, genre, numPages, price, cost, stock, display) values (435077, 'Daddy Long Legs', 'Comedy|Drama', 786, 9964, 767, 757, true);
insert into Book (ISBN, title, genre, numPages, price, cost, stock, display) values (370245, 'I Never Sang for My Father', 'Drama', 1990, 9270, 490, 767, false);
insert into Book (ISBN, title, genre, numPages, price, cost, stock, display) values (936178, 'City, The (Ciudad, La)', 'Drama', 7777, 9325, 856, 881, true);
insert into Book (ISBN, title, genre, numPages, price, cost, stock, display) values (815824, 'Ink', 'Action|Fantasy|Sci-Fi', 4309, 7914, 248, 76, false);
insert into Book (ISBN, title, genre, numPages, price, cost, stock, display) values (580952, 'Super', 'Action|Comedy|Drama', 6415, 5013, 468, 54, false);
insert into Book (ISBN, title, genre, numPages, price, cost, stock, display) values (192399, 'Forever Young', 'Drama|Romance|Sci-Fi', 3669, 9080, 300, 683, false);
insert into Book (ISBN, title, genre, numPages, price, cost, stock, display) values (651756, 'Electric Horseman, The', 'Comedy|Western', 8584, 1161, 579, 720, true);
insert into Book (ISBN, title, genre, numPages, price, cost, stock, display) values (942610, 'Earth Days', 'Documentary', 4936, 2150, 669, 328, true);
insert into Book (ISBN, title, genre, numPages, price, cost, stock, display) values (660413, 'Snowbeast', 'Horror', 6451, 3046, 452, 504, false);
insert into Book (ISBN, title, genre, numPages, price, cost, stock, display) values (831069, 'Chapter Two', 'Comedy|Drama|Romance', 289, 7661, 188, 459, false);
insert into Book (ISBN, title, genre, numPages, price, cost, stock, display) values (843580, 'Hesher', 'Drama', 5644, 3041, 476, 950, false);
insert into Book (ISBN, title, genre, numPages, price, cost, stock, display) values (153822, 'Story of Film: An Odyssey, The', 'Documentary', 7551, 9986, 749, 121, false);

insert into Publisher (name, email, bankingAccount, addressID) values ('Johnson Corp', 'johnson@corp.com', 'ACC12345', 5);
insert into Publisher (name, email, bankingAccount, addressID) values ('Penguin Corp', 'penguin@penguino.com', 'ACC456788', 6);

insert into Makes (ISBN, publisherID) values (12345, 1);
insert into Makes (ISBN, publisherID) values (946983, 1);
insert into Makes (ISBN, publisherID) values (218993, 1);
insert into Makes (ISBN, publisherID) values (82617, 1);
insert into Makes (ISBN, publisherID) values (805414, 1);
insert into Makes (ISBN, publisherID) values (253919, 1);
insert into Makes (ISBN, publisherID) values (539880, 1);
insert into Makes (ISBN, publisherID) values (456676, 1);
insert into Makes (ISBN, publisherID) values (185962, 1);
insert into Makes (ISBN, publisherID) values (435077, 1);
insert into Makes (ISBN, publisherID) values (370245, 2);
insert into Makes (ISBN, publisherID) values (936178, 2);
insert into Makes (ISBN, publisherID) values (815824, 2);
insert into Makes (ISBN, publisherID) values (580952, 2);
insert into Makes (ISBN, publisherID) values (192399, 2);
insert into Makes (ISBN, publisherID) values (651756, 2);
insert into Makes (ISBN, publisherID) values (942610, 2);
insert into Makes (ISBN, publisherID) values (660413, 2);
insert into Makes (ISBN, publisherID) values (831069, 2);
insert into Makes (ISBN, publisherID) values (843580, 2);
insert into Makes (ISBN, publisherID) values (153822, 2);

insert into PhoneNumber (phoneNumber, publisherID) values ('(123) 456-7890', 1);
insert into PhoneNumber (phoneNumber, publisherID) values ('(124) 996-1190', 2);

insert into Author (name, isbn) values ("Timothy Joe", 12345);
insert into Author (name, isbn) values ("John Jimmies", 12345);
insert into Author (name, isbn) values ("John Jimmies", 946983);
insert into Author (name, isbn) values ("John Jimmies", 218993);
insert into Author (name, isbn) values ("Tommy Jenkins", 82617);
insert into Author (name, isbn) values ("Tommy Jenkins", 805414)
insert into Author (name, isbn) values ("Tommy Jenkins", 253919)
insert into Author (name, isbn) values ("Jimothy Jenkins", 539880)
insert into Author (name, isbn) values ("Jimothy Jenkins", 456676)
insert into Author (name, isbn) values ("Samantha Ploop", 456676)


