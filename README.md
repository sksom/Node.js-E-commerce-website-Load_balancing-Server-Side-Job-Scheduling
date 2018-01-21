# Node.js-E-commerce-website-Load_balancing-Server-Side-Job-Scheduling
Implementation of E-commerce website (Back-end focus)

Developed a e-commerce website using NODE.Js, Jade, MySQL and also implemented load-balancing along with the bottleneck detection and cron scheduling.

Project: 
Created a 3-tier online order entry system which has the following:
(1)	Create User/Password
(2)	Create customer profile (Name, Address, Ship-To Address, Bill-To-Address, Credit Card)
(3)	Login authentication (validate user)
(4)	Create Catalog of items to be sold (SKU, Item Name, Item Description, Price, Available quantity)
(5)	Create an order
(6)	Add items from catalog to order (if available quantity > 0)
(7)	Calculate total price + Sales Tax
(8)	Complete Order
(9)	Create shipment information for each line item in the order. Process shipment: Possible states - Pick, Pack, Ship 
(10) Show shipment status  on the order
(11) Create subscription templates with due dates
(12) Create orders from subscription templates a day before the due dates

Database Objects: User Table, Customer table, Address Table, Catalog table
Transactional Objects: Order table, LineItems Table, Shipment Table, Subscription Template, Subscription Orders

UI Tier – HTML or thick-Client
App Tier – all business logic, UI and database interaction resides here
DB Tier – All data tables needed to support the application
