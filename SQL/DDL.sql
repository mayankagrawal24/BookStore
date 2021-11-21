--create the database
CREATE DATABASE BookStore;

--Creating all of the tables in our database
create table Customer (
	customerID int NOT NULL AUTO_INCREMENT,
	name varchar(64),
	email varchar(64),
	password varchar(64),
	primary key (customerID),
	foreign key (BSID) references BillingShipping on delete
	set null
);
create table BillingShipping (
	BSID int NOT NULL AUTO_INCREMENT,
	creditCardName varchar(64),
	creditCardNumber int(16),
	primary key (BSID)
	foreign key (billingAddressID) references Address
	foreign key (shippingAddressID) references Address
);

create table Address(
	addressID int NOT NULL AUTO_INCREMENT,
	street varchar(64),
	streetNumber int,
	postalCode varchar(6),
	province varchar(64),
	country varchar(64)
	primary key (addressID)
)
create table Owner (
	ownerID int NOT NULL AUTO_INCREMENT,
	name varchar(64),
	username varchar(64),
	password varchar(64),
	primary key (ownerID)
);
create table CustomerOrder (
	customerOrderID int NOT NULL AUTO_INCREMENT,
	trackingNumber varchar(64),
	date Date,
	total int,
	completed boolean,
	primary key (customerID),
	foreign key (BSID) 
	references BillingShipping 
	foreign key (customerID) 
	references Customer
);
create table SoldBooks (
	quantity int,
	primary key (customerOrderID, ISBN) 
	foreign key (customerOrderID) 
	references CustomerOrder 
	foreign key (ISBN) 
	references Book
);
create table OrderedBooks (
	quantity int,
	primary key (orderID, ISBN) 
	foreign key (orderID) 
	references StoreOrder 
	foreign key (ISBN) 
	references Book
);
create table Book (
	ISBN int,
	title varchar(128),
	genre varchar(64),
	numPages int,
	price int,
	stock int,
	display boolean,
	primary key (ISBN)
);
create table Author (
	name varchar(64),
	primary key (ISBN, name),
	foreign key (ISBN) references Book
);
create table Makes (
	primary key (ISBN, publisher_ID) 
	foreign key (ISBN) references Book 
	foreign key (publisherID) references Publisher
);
create table Publisher (
	publisherID int NOT NULL AUTO_INCREMENT,
	name varchar(),
	email varchar(30),
	bankingAccount varchar(30) 
	foreign key (phoneNumber) references PhoneNumber on delete
		set null
	foreign key (addressID) references Address

);
create table PhoneNumber (
	phoneNumber varchar(15),
	publisherID primary key (phoneNumber, publisherID) 
	foreign key (publisherID) references Publisher
);
create table StoreOrder (
	orderID int NOT NULL AUTO_INCREMENT,
	date Date,
	primary key (orderID) 
	foreign key (ownerID) references Owner
);