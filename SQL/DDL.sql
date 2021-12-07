--create the database
CREATE DATABASE BookStore;

--Creating all of the tables in our database

create table Address(
	addressID SERIAL PRIMARY KEY,
	street varchar(64) NOT NULL,
	streetNumber int NOT NULL,
	postalCode varchar(6) NOT NULL,
	province varchar(64) NOT NULL,
	country varchar(64) NOT NULL
);

create table BillingShipping (
	BSID SERIAL PRIMARY KEY,
	creditCardName varchar(64) NOT NULL, 
	creditCardNumber int NOT NULL,
	cvv int NOT NULL,
	expiry int NOT NULL,
	billingAddressID int NOT NULL,
	shippingAddressID int NOT NULL,
	FOREIGN KEY (billingAddressID) references Address(addressID),
	FOREIGN KEY (shippingAddressID) references Address(addressID)
);

create table Customer (
	customerID SERIAL PRIMARY KEY,
	name varchar(64) NOT NULL,
	email varchar(64) NOT NULL,
	password varchar(64) NOT NULL,
	BSID int NOT NULL,
	FOREIGN KEY (BSID) references BillingShipping 
);
create table Owner (
	ownerID SERIAL PRIMARY KEY,
	name varchar(64) NOT NULL,
	email varchar(64) NOT NULL,
	password varchar(64) NOT NULL
);
create table CustomerOrder (
	customerOrderID SERIAL PRIMARY KEY,
	trackingNumber varchar(64),
	date TIMESTAMPTZ DEFAULT Now(),
	total int,
	completed boolean DEFAULT FALSE,
	BSID int,
	customerID int,
	FOREIGN KEY (BSID) references BillingShipping,
	FOREIGN KEY (customerID) references Customer
);
create table Book (
	ISBN int NOT NULL UNIQUE PRIMARY KEY,
	title varchar(128) NOT NULL,
	genre varchar(64) NOT NULL,
	numPages int check (numPages > 0) NOT NULL,
	price int NOT NULL,
	cost int NOT NULL,
	stock int DEFAULT 0,
	display boolean DEFAULT TRUE
);
create table SoldBooks (
	quantity int check(quantity > 0),
	customerOrderID int,
	ISBN int,
	PRIMARY KEY (ISBN, customerOrderID),
	FOREIGN KEY (customerOrderID) references CustomerOrder,
	FOREIGN KEY (ISBN) references Book
);
create table StoreOrder (
	orderID SERIAL PRIMARY KEY,
	ownerID int,
	date TIMESTAMPTZ DEFAULT Now(),
	FOREIGN KEY (ownerID) references Owner
);
create table OrderedBooks (
	quantity int check(quantity > 0),
	orderID int,
	ISBN int,
	PRIMARY KEY(orderID,ISBN),
	FOREIGN KEY (orderID) references StoreOrder, 
	FOREIGN KEY (ISBN) references Book  
);

create table Author (
	name varchar(64) NOT NULL,
	ISBN int,
	PRIMARY KEY(ISBN, name),
	FOREIGN KEY (ISBN) references Book
		on delete cascade
);
create table Publisher (
	publisherID SERIAL PRIMARY KEY,
	name varchar(64) NOT NULL,
	email varchar(64) NOT NULL,
	bankingAccount varchar(32),
	addressID int,
	FOREIGN KEY (addressID) references Address
);
create table Makes (
	ISBN int,
	publisherID int,
	PRIMARY KEY(ISBN, publisherID),
	FOREIGN KEY (ISBN) references Book,
	FOREIGN KEY (publisherID) references Publisher
);

create table PhoneNumber (
	phoneNumber varchar(16) NOT NULL,
	publisherID int,
	PRIMARY KEY(phoneNumber, publisherID),
	FOREIGN KEY (publisherID) references Publisher
		on delete cascade
);

-- sessions table for persistent session
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
	"sess" json NOT NULL,
	"expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");
