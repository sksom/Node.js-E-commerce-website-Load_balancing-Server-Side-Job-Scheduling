var http = require("http");
var express=require("express");
var session = require('express-session');
var app=express();
var mysql = require('mysql');
var fs = require('fs');
var path = require('path');
var HOST = 'localhost';
var PORT = 3306;
var MYSQL_USER = 'root';
var MYSQL_PASS = 'GayuUtd@2016';
var DATABASE = 'ecommerce_project';
var TABLE = 'user_entry';

var _dirname = "C:\Users\Gayathri\Desktop\Customer_Handling"


//custom global variable
var dataPass;


var mysql = mysql.createConnection({
    host: HOST,
    port: PORT,
    user: MYSQL_USER,
    password: MYSQL_PASS,
    database: DATABASE
});


app.use(express.bodyParser());
app.use(express.static(__dirname + '/public'));
app.use(express.cookieParser());
app.use(session({cookieName: 'session',secret: 'ssshhhhh', saveUninitialized: true, resave: true}));	
app.use(app.router);
	
var sess;
var user_id;

app.get("/home",function(req,res){
	sess = req.session;
	res.sendfile("./home.html");
	
	
	app.get("/Shirts",function(req,res){    
    //res.sendfile("./home.html");
    console.log("user id to cart" +user_id +sess.user_id);
    mysql.query('select a.SKU, b.Product_ID, a.Name, a.Price, b.Available_Qty, c.Attr_Name, c.Attr_Value from catalog a, product b, product_attribute c where a.sku=b.sku and b.product_id=c.product_id;', function(err, rows, fields)
    {       
		if (err)
            throw err;
	else
        {
		        console.log('no of records is '+rows.length);
                //res.writeHead(200, { 'Content-Type': 'application/json'});
                JSON.stringify(rows);
				var htmlStr="";
				   for(i=0;i<rows.length;i++)
				   {
					//res.write("\n Product Name \t" +rows[i].Name +"\t Price\t " +rows[i].Price + "$");
					htmlStr+="<tr> <td> <input type='checkbox' name='addToCartCheck' value='" +rows[i].Product_ID +"'/> </td> <td>"  +rows[i].Product_ID +"</td> <td>"  + rows[i].Name + "</td> <td>" +rows[i].Price +"$" + "</td> <td> " +rows[i].Available_Qty +   "</td> <td> " +rows[i].Attr_Name +   "</td> <td> " +rows[i].Attr_Value +  " </td> <td> <input type='text' name='purchaseQty' /> <td> </td></tr>";	
					//dataPass=htmlStr;
				    //htmlStr+="<tr> <td> <a href='"+rows[i].Name + "'>" +rows[i].Name +  </a></td> <td>" +rows[i].Price +"$" + "</td>  </tr>";	
					console.log(rows[i].Name);
									
				   }
				  res.writeHead(200, {"Content-Type": "text/html"});  
				  res.write("<html> <head>  <link href='/css/cover.css' type='text/css' rel='stylesheet'> </head><body> <form  action ='/addProductsToCart' method= post> <table border='1'> <tr> <th> Select Product </th> <th> Product ID </th> <th> Product Name </th> <th> Price </th> <th> Available_Qty </th> <th> Attr_Name </th> <th> Attr_Value </th> <th> Purchase Quantity </th></tr>" +htmlStr +"<tr> <td colspan='8'> <input type='submit' name='add to cart' value='Add To Cart'/> </td> </tr> </table></form> </body> </html>"); 
				  res.end(); 
        
        } 
	});
		
	app.post("/addProductsToCart",function(req,res){
					//console.log("i value" +i);
					//var rownumber = i;
					//console.log("row number" +rownumber + "row length" +rows.length);
					//console.log("rows of i" + rows[rownumber].Price);
					//console.log("worked now" + rows[2].Name);
					var checked=req.body.addToCartCheck;
					var qty = req.body.purchaseQty;
					//var index=checked.length; 
					var getPrice = function(index)
					{
					if(index==checked.length){
					console.log("loop done");
					}	
					else
					{
					var checked_product = checked[index];
					console.log("selected check box now" +checked_product );
					var product_qty = qty[0];
					console.log("purchaseQty" + product_qty);
					var product_price;
					console.log("check loop1");
					
					mysql.query("select Price from catalog where SKU = (select SKU from product where Product_ID= ?)", [checked_product], function(err, result, fields)
					{
					
					//JSON.stringify(result);
					if (err)		
						throw err;
					else
					{	
					console.log("check loop2");
					console.log("result" +result);
										
					product_price = result[0].Price;
				
					console.log("product_price"+product_price);
					var price= eval(product_price*product_qty);
					console.log("tot price" +price);	
					var cart= {
					UID : user_id, 
					Product_id : checked_product,
					QTY: product_qty,
					Tot_Price: price,
					Active_Flag : "active"
					}; 
				console.log(cart.UID+" "+cart.Product_id+" "+cart.QTY+" "+cart.Tot_Price+" "+cart.Active_Flag);				
				mysql.query("Insert into cart (UID,Product_id,QTY,Tot_Price,Active_Flag) VALUES ('"+cart.UID+"','"+cart.Product_id+"','"+cart.QTY+"','"+cart.Tot_Price+"','"+cart.Active_Flag+"') ; ",function(err, result)
				{
					if (err)
						throw err;
				else
				{
					console.log("insert into cart success");
					//res.send('added to cart successfully');
				}
				
				});
				
				}
				getPrice(index +1);	
					});	
				
					
					}
					//res.send('added to cart successfully')
					}
				getPrice(0);	
				
 res.send('added to cart successfully')   
});
});
	
	app.get("/displayCart",function(req,res){ 
	mysql.query('SELECT * FROM cart where uid = ? ' , [user_id], function(err,rows)
     {
        if (err)
            throw err;
	else
        {
			 console.log('no of products in cart '+rows.length);
                JSON.stringify(rows);
				var htmlStr="";
				   for(i=0;i<rows.length;i++)
				   {
					htmlStr+="<tr>  <td>"  + rows[i].Product_Id + "</td> <td>" +rows[i].QTY + "</td> <td> " +rows[i].Tot_Price +"$" +   "</td> </tr>";	
					console.log(rows[i].Product_Id);
									
				   }
				  res.writeHead(200, {"Content-Type": "text/html"});  
				  res.write("<html> <head>  <link href='/css/cover.css' type='text/css' rel='stylesheet'> </head><body> <form  action ='/proceedToCheckout' method= post> <table border='1'> <tr> <th> Product ID </th> <th> Qty </th>  <th> Total Price </th> </tr>" +htmlStr +"<tr> <td colspan='3'> <input type='submit' name='proceed to checkout' value='Proceed to Checkout'/> </td> </tr> </table></form> </body> </html>"); 
				  res.end(); 
			
		}
	 });
	 
	app.post("/proceedToCheckout" , function(req,res){ 
	
	mysql.query('SELECT * FROM address where uid = ? ' , [user_id], function(err,rows)
    {
    if (err)
            throw err;
	else
        {
			console.log('no of adress for the user '+rows.length);
                JSON.stringify(rows);
				var htmlStr="";
				   for(i=0;i<rows.length;i++)
				   {
					htmlStr+="<tr> <td>  <input type='radio' name='addr_id_radio' value='"+rows[i].addr_id +"'</td> <td>"  + rows[i].Addr_line1 + "</td> <td>" +rows[i].Addr_line2 + "</td> <td> " +rows[i].state + "</td> <td> " +rows[i].zip_code  + "</td> </tr>";	
					console.log(rows[i].addr_id);
									
				   }
					res.writeHead(200, {"Content-Type": "text/html"});  
				  res.write("<html> <head>  <link href='/css/cover.css' type='text/css' rel='stylesheet'> </head><body> <form  action ='/proceedToPayment' method= post> <table border='1'> <tr> <th> select </th> <th> addr line 1 </th>  <th> addr line 1Price </th> <th> state </th> <th> zip code </th>  </tr>" +htmlStr +"<tr> <td colspan='5'> <input type='submit' name='proceed to payment' value='Proceed to Payment'/> </td> </tr> </table></form> </body> </html>"); 
				  res.end();
				   
		}
	
	});	
	
	});

	app.post("/proceedToPayment" , function(req,res){ 
	
	var addr_selected=req.body.addr_id_radio;
	console.log("selected address" +addr_selected);
	var order_amount;
	var order_id;
	var state_tax;
	var amount_payable;
	var bill_no;
			mysql.query("select sum(tot_price)as amount from cart where UID = ?", [user_id], function(err, result, fields)
					{
					
					//JSON.stringify(result);
					if (err)		
						throw err;
					else
					{					
					order_amount = eval(result[0].amount);
					console.log("result" +order_amount);
					
			var order={
					UID: user_id,
					Purchase_Amt : order_amount, 
					Delivery_Addr_ID : addr_selected,
					Order_Status : "initiated",
					Return_Flag : "no"
					}; 
			mysql.query("Insert into ecommerce_project.order (UID,Order_Date,Purchase_Amt,Delivery_Addr_ID,Order_Status,Return_Flag) VALUES ('"+order.UID+"', NOW(),'"+order.Purchase_Amt+"','"+order.Delivery_Addr_ID+"','"+order.Order_Status+"','"+order.Return_Flag+"') ; ",function(err, result)
				{
					if (err)
						throw err;
				else
				{
					console.log("insert into order success");
				var default_status = "initiated";	
				mysql.query("select Order_ID from ecommerce_project.order where UID = ? and Order_Status = ?", [user_id,default_status], function(err, result, fields)
					{
					if (err)
						throw err;
					else
					{
					order_id = result[0].Order_ID
					console.log("order_id" +order_id);
					
					mysql.query("insert into line_items (Order_ID, Seq_num, Product_ID, QTY, Price) select Order_ID , @n:=@n+1 as seq_num , product_id , qty, Tot_Price from (select product_id , qty, Tot_Price from cart where UID = ?) a ,(SELECT @n:=0) b , (select Order_ID from ecommerce_project.order where Order_ID=?) c ; ", [user_id,order_id], function(err, result, fields)
					{
					if (err)
						throw err;
					else
					{
						//console.log("oder number and sequence number" +result[0].Order_ID +"  " +result[0].seq_num);
						console.log("insert into line items success");
						mysql.query("select Tax_Percent from Tax_Info where State_Code = (select state from address where addr_id = ?)", [addr_selected], function(err, result, fields)
					{
					if (err)
						throw err;
					else
					{
						state_tax=result[0].Tax_Percent;
						console.log("state_tax" +state_tax);
						var tax_amount = eval(order_amount*state_tax/100);
						amount_payable = eval(order_amount + tax_amount);
						console.log("amount_payable" +amount_payable);
					
					var bill={
					Order_ID : order_id, 
					Purchase_Amt : order_amount,
					Taxable_Amt : tax_amount,
					Payable_Amount: amount_payable
					}; 
					mysql.query("Insert into bill (Order_ID,Purchase_Amt,Taxable_Amt,Payable_Amount) VALUES ('"+bill.Order_ID+"','"+bill.Purchase_Amt+"','"+bill.Taxable_Amt+"','"+bill.Payable_Amount+"') ; ",function(err, result)
					{
					if (err)
						throw err;
					else
					{
					console.log("insert into bill success");	
					}
					mysql.query('SELECT * FROM bill where Order_ID = ? ' , [order_id], function(err,rows)
					{
					if (err)
					throw err;
					else
					{
					//console.log('no of adress for the user '+rows.length);
					//JSON.stringify(rows);
					bill_no=rows[0].Bill_no;
					var htmlStr="";
					htmlStr="<tr> <td> "  +rows[0].Bill_no + "</td> <td>" +rows[0].Order_ID + "</td> <td> " +rows[0].Purchase_Amt + "</td> <td> " +rows[0].Taxable_Amt  + "</td> <td> " +rows[0].Payable_Amount + "</td> </tr>";	
					//console.log(rows[i].addr_id);
									
					res.writeHead(200, {"Content-Type": "text/html"}); 					
					res.write("<html> <head> <link href='/css/cover.css' type='text/css' rel='stylesheet'> </head><body> <form  action ='/confirmPayment' method= post> <table border='1'> <tr> <th> Bill no </th> <th> Order ID</th>  <th> Purchase Amount </th> <th> Tax Amount </th> <th> Payable Amount </th>  </tr>" +htmlStr +"<tr> <td> <select name='paymentMode' > <option value='CreditCard'>Credit Card</option><option value='COD'>Cash On Delivery</option></select></td><td colspan='5'> <input type='submit' name='confirm_payment' value='Confirm Payment'/> </td> </tr> </table></form> </body> </html>"); 
					res.end();
					}
	
					});	
					
					});
					

					
					}
					});
						
					}
					});
					
					
					
					}
					
				});
			

				}
				});
					
					}	
					});
					
					
	app.post("/confirmPayment" , function(req,res){
	var PayMode = req.body.paymentMode;
	
		var payment={
					Bill_no : bill_no, 
					Payable_Amount: amount_payable,
					Payment_Mode : PayMode
					}; 
					var order_status = "Ordered";
					mysql.query("Insert into Payment (Bill_no,Payable_Amount,Payment_Mode,Payment_Date) VALUES ('"+payment.Bill_no+"','"+payment.Payable_Amount+"','"+payment.Payment_Mode+"',NOW()) ; ",function(err, result)
					{
					if (err)
						throw err;
					else
					{
					console.log("insert into payment success");	
						mysql.query("update ecommerce_project.order set Order_Status = ?  where Order_ID = ? ", [order_status,order_id],function(err, result)
							{
							if (err)
								throw err;
							else
							{
								console.log("order success");	
								
								mysql.query("delete from cart where UID = ? ", [user_id],function(err, result)
							{
							if (err)
								throw err;
							else
							{
								console.log("items deleted from cart");
							
							mysql.query("insert into shipment (Order_ID,Product_ID) select Order_ID , Product_ID from line_items where Order_ID=? ",[order_id],function(err, result)
							{
							if (err)
								throw err;
							else
							{
								console.log("insert into shipment success");
							}
							});	
								res.send("Order placed Successfully");
								
							}
							});
							}
							});
					}
					});
		
	});
	
	
	
	});
	
	
	
	
	});
	
	app.get("/form",function(req,res){
	res.sendfile("./form.html");  
	});
	
	app.get("/signup",function(req,res){
	res.sendfile("./signup.html"); 

        });

app.post("/form",function(req,res)
{
	
	
	//var user_name=req.body.username; 
	//var pass=req.body.pwd;
	
	var user_entry = {
		user_name : req.body.username, 
		pass_word : req.body.pwd
	}; 
	console.log(user_entry.user_name + "log" + user_entry.pass_word);
	var user_name=user_entry.user_name; 
	 
	
	
	mysql.query('SELECT * FROM user_entry where user_name = ? ' , [user_name], function(err,rows)
     {
        if (err)
            throw err;
	else
        {
	uname=rows[0].user_name; 		
	pswd=rows[0].pass_word; 
	role=rows[0].role;
	user_id=rows[0].cid;
	console.log("user_name" +user_name + "role" +role) ; 
	
	if( pswd == user_entry.pass_word)
	{
		//req.session.user = uname;
		sess.username = uname;
		sess.user_id  = user_id;
	    console.log("login success" +role + "session name" +sess.username);
		if( role == "customer")
			{
				//res.render('/loggedin', {uid:uid});
				res.redirect('/customer_loggedin');
			}
			else
			{
				//res.send({data: uname});
				//res.render('supervisor_loggedin');
				res.redirect('/supervisor_loggedin');
				
			}
	    
	}
	    
        else
	{
            console.log("invalid login");
	    res.send('Invalid login');
	}

           
     }
	 
	 });

});

app.post("/signup" , function(req,res)
{

first_name=req.body.firstname;
last_name=req.body.lastname; 
phone_number=req.body.phoneNum;
email_id=req.body.email;
security_question1=req.body.securityQuestion1;
security_answer1=req.body.securityAnswer1;	
user_name=req.body.UserName;
pass_word=req.body.password;
Addr_line1=req.body.addrLine1;
Addr_line2=req.body.addrLine2;
state=req.body.state;
zip_code=req.body.zipCode;

	mysql.query("Insert into customer (first_name,last_name,phone_number,email_id,security_question1,security_answer1) VALUES ('"+first_name+"','"+last_name+"','"+phone_number+"','"+email_id+"','"+security_question1+"','"+security_answer1+"') ; ",function(err, result)
    {
        if (err)
            throw err;
	else
	{
	console.log("insert into customer success");
	console.log("email_id" +email_id);
	mysql.query('SELECT * FROM customer where email_id= \""+email_id+"\" ;', function(err,rows)
     	{
        if (err)
            throw err;
	else
        {
	 uid=rows[0].uid; 
	console.log("uid" +uid);
	 mysql.query("Insert into user_entry (user_name,pass_word,uid) values ('"+user_name+"', '"+pass_word+"','"+uid+"');", function(err, result)
	  {
	if (err)
            throw err;
	else
	{
	console.log("insert into user_entry success");
	
	mysql.query("Insert into address (uid,Addr_line1,Addr_line2,state,zip_code) values ('"+uid+"','"+Addr_line1+"','"+Addr_line2+"','"+state+"','"+zip_code+"');", function(err, result) {
	if (err)
            throw err;
	console.log("sign up success")
	
	});
	
	}
		
	 });


        }

 });

}

 });
res.send('Invalid login');

});



app.get("/customer_loggedin",function(req,res){
	res.sendfile("./customer_loggedin.html");  
	
 	app.get("/userOrderHistory",function(req,res){

    mysql.query('select b.Order_ID, b.Seq_num, b.Product_ID, b.QTY, b.Price, a.order_date, a.Order_Status ,a.Return_Flag from ecommerce_project.order a, line_items b where (a.Order_ID=b.Order_ID) and (a.Return_Flag="NO") and (a.UID=?)',[user_id], function(err, rows, fields)
		{

        if (err)
            throw err;
        else
        {
            console.log('no of records is '+rows.length);
            //res.writeHead(200, { 'Content-Type': 'application/json'});
            JSON.stringify(rows);
            var htmlStr="";
            for(i=0;i<rows.length;i++)
            {
                htmlStr+="<tr> <td> <input type='checkbox' name='returnItems' value='" +rows[i].Order_ID +"'/> </td> <td>"  +rows[i].Order_ID +"</td> <td>"  + rows[i].Seq_num + "</td> <td>" +rows[i].Product_ID + "</td> <td> " +rows[i].Qty +   "</td> <td> " +rows[i].Price +   "</td> <td> " +rows[i].order_date + "</td> <td> " +rows[i].Order_Status +"</td> <td> " +rows[i].Return_Flag + " </td> </tr>";
       
                console.log(rows[i].Product_ID);

            }
            res.writeHead(200, {"Content-Type": "text/html"});
            res.write("<html> <head>  <link href='/css/cover.css' type='text/css' rel='stylesheet'> </head><body> <form  action ='/customerReturns' method= post> <table border='1'> <tr> <th> Select Order </th> <th> Order ID </th> <th> Seq Number </th> <th> Product ID </th> <th> Qty </th> <th> Total Price </th> <th> Oder Date </th> <th> Order Status </th> <th> Return Flag </th></tr>" +htmlStr +"<tr> <td colspan='9'> <input type='submit' name='returnItem' value='Return Items'/> </td> </tr> </table></form> </body> </html>");
            res.end();

        }
    });


	app.post("/customerReturns" , function(req,res)
	{
    var checked=req.body.returnItems;
    var temp = function(index)
    {
        if(index==checked.length){
            console.log("loop done");
        }
        else
        {
            var checked_product = checked[index];
            console.log("selected check box now" +checked_product );



            console.log("check loop1");
			var flag_yes = "yes"
            mysql.query("update ecommerce_project.order set Return_Flag=? where Order_ID=?)", [flag_yes,checked_product], function(err, result, fields)
            {

                //JSON.stringify(result);
                if (err)
                    throw err;
                else
                {
                    console.log("check loop2");
                    console.log("result" +result);



                }
                temp(index +1);
            });


        }
        //res.send('added to cart successfully')
    }
    temp(0);



res.send('return initiated for the selected item(S)');

	});


});


app.get("/update",function(req,res){
	res.sendfile("./update.html"); 
});



app.get("/home",function(req,res){
	res.sendfile("./home.html");
});

});

app.get("/supervisor_loggedin",function(req,res){
	res.sendfile("./supervisor_loggedin.html"); 
	
	app.get("/addproducts",function(req,res){
	res.sendfile("./addproducts.html"); 
     });
	app.get("/updateprice",function(req,res){
	res.sendfile("./updateprice.html"); 
     });
	app.get("/manageqty",function(req,res){
	res.sendfile("./manageqty.html"); 
     }); 
		
	app.post("/addproducts" , function(req,res)	
	{
		var catalog= {
		SKU : req.body.sku, 
		Name : req.body.ProdName,
		Price: req.body.price,
		Vendor_ID: req.body.vendor
		}; 
	
	
	mysql.query("Insert into catalog (SKU,Name,Price,Vendor_ID) VALUES ('"+catalog.SKU+"','"+catalog.Name+"','"+catalog.Price+"','"+catalog.Vendor_ID+"') ; ",function(err, result)
    {
        if (err)
            throw err;
	else
	{
		console.log("insert into catalog success");
		res.redirect('/productattr');
	}
	
	});		
	});
		
	app.get("/productattr",function(req,res){
	res.sendfile("./productattr.html"); 
});


app.post("/productattr" , function(req,res)	
	{

		var product= {
		Product_ID : req.body.ProdID,
		SKU : req.body.sku, 
		Available_Qty : req.body.qty		
		}; 
		
		var product_attribute= {
		Product_ID	: req.body.ProdID,
		Attr_Name: req.body.attr1, 
		Attr_Value : req.body.Val1	
		}; 
		
		
		mysql.query("Insert into product (Product_ID,SKU,Available_Qty) VALUES ('"+product.Product_ID+"','"+product.SKU+"','"+product.Available_Qty+"') ; ",function(err, result)
		{
        if (err)
            throw err;
		else
		{
			console.log("insert into product success");
			mysql.query("Insert into product_attribute (Product_ID,Attr_Name,Attr_Value) VALUES ('"+product_attribute.Product_ID+"','"+product_attribute.Attr_Name+"','"+product_attribute.Attr_value+"') ; ",function(err, result)
		{
        if (err)
            throw err;
		else
		{
			console.log("insert into product_attribute success");
			res.send('Product added successfully !');
			
		} });	
			
		}
	
	});		
		
	});
		
	
	app.post("/updateprice" , function(req,res)	
	{
		
		var SKU =  req.body.sku; 
		var Price = req.body.price; 
	
	mysql.query("update catalog set Price = ?  where SKU = ? " , [Price,SKU] ,function(err, result)
    {
        if (err)
            throw err;
	else
	{
		console.log("update price to catalog success");
		res.send("update price to catalog success");
		
	}
	
	});		
	});
	
	app.post("/manageqty" , function(req,res)	
	{
		
		var Product_ID =  req.body.ProdID; 
		var Available_Qty = req.body.qty; 
	
	
	mysql.query("update product set Available_Qty = ?  where Product_ID = ? " , [Available_Qty,Product_ID] ,function(err, result)
    {
        if (err)
            throw err;
	else
	{
		console.log("update qty to product success");
		res.send("update qty to product success");
	}
	
	});		
	});
	
	app.get("/viewOrders",function(req,res){
	
	mysql.query('select b.Order_ID, b.Seq_num, b.Product_ID, b.QTY, b.Price, a.order_date, a.Order_Status ,a.Return_Flag from ecommerce_project.order a, line_items b where a.Order_ID=b.Order_ID;', function(err, rows, fields)
    {       
		if (err)
            throw err;
	else
        {
		        console.log('no of records is '+rows.length);
                //res.writeHead(200, { 'Content-Type': 'application/json'});
                JSON.stringify(rows);
				var htmlStr="";
				   for(i=0;i<rows.length;i++)
				   {
					//res.write("\n Product Name \t" +rows[i].Name +"\t Price\t " +rows[i].Price + "$");
					htmlStr+="<tr> <td>"  +rows[i].Order_ID +"</td> <td>"  + rows[i].Seq_num + "</td> <td>" +rows[i].Product_ID  + "</td> <td> " +rows[i].QTY +   "</td> <td> " +rows[i].Price +   "</td> <td> " +rows[i].order_date +  " </td> <td> " +rows[i].Order_Status+ " </td> <td> "  +rows[i].Return_Flag+ " </td></tr>";	
					//dataPass=htmlStr;
				    //htmlStr+="<tr> <td> <a href='"+rows[i].Name + "'>" +rows[i].Name +  </a></td> <td>" +rows[i].Price +"$" + "</td>  </tr>";	
					console.log(rows[i].Name);
									
				   }
				  res.writeHead(200, {"Content-Type": "text/html"});  
				  res.write("<html> <head>  <link href='/css/cover.css' type='text/css' rel='stylesheet'> </head><body> <form  action ='/addProductsToCart' method= post> <table border='1'> <tr> <th> Order_ID </th> <th> Seq_num </th> <th> Product_ID </th> <th> QTY </th> <th> Price </th> <th> order_date </th> <th> Order_Status </th> <th> Return_Flag </th></tr>" +htmlStr +"</tr> </table></form> </body> </html>"); 
				  res.end(); 
        
        } 
	});
		
		
		
	
	});
	
	
		app.get("/updateShipments",function(req,res){
	
	mysql.query('select * from shipment', function(err, rows, fields)
    {       
		if (err)
            throw err;
	else
        {
		        console.log('no of records is '+rows.length);
                //res.writeHead(200, { 'Content-Type': 'application/json'});
                JSON.stringify(rows);
				var htmlStr="";
				   for(i=0;i<rows.length;i++)
				   {
					//res.write("\n Product Name \t" +rows[i].Name +"\t Price\t " +rows[i].Price + "$");
					htmlStr+="<tr> <td> <input type='checkbox' name='shipmentUpdate' value='" +rows[i].Shipment_ID +"'/> </td><td>"  +rows[i].Shipment_ID +"</td> <td>"  + rows[i].Order_ID + "</td> <td>" +rows[i].Product_ID  + "</td> <td> " +rows[i].Ship_Status +  " </td></tr>";	
					//dataPass=htmlStr;
				    //htmlStr+="<tr> <td> <a href='"+rows[i].Name + "'>" +rows[i].Name +  </a></td> <td>" +rows[i].Price +"$" + "</td>  </tr>";	
					console.log(rows[i].Name);
									
				   }
				  res.writeHead(200, {"Content-Type": "text/html"});  
				  res.write("<html> <head>  <link href='/css/cover.css' type='text/css' rel='stylesheet'> </head><body> <form  action ='/shipStatus' method= post> <table border='1'> <tr> <th> Select </th> <th> Shipment_ID </th> <th> Order_ID </th> <th> Product_ID </th> <th> Ship_Status </th> </tr>" +htmlStr +"</tr> <tr> <td> <select name='shipStatus' > <option value='pack'>pack</option><option value='ship'>ship</option></select></td><td colspan='4'> <input type='submit' name='update_shipment' value='Update Ship Status'/> </td> </tr> </table></form> </body> </html>"); 
				  res.end(); 
        
        } 
	});
		
		app.post("/shipStatus",function(req,res){
					//console.log("i value" +i);
					//var rownumber = i;
					//console.log("row number" +rownumber + "row length" +rows.length);
					//console.log("rows of i" + rows[rownumber].Price);
					//console.log("worked now" + rows[2].Name);
					var checked=req.body.shipmentUpdate;
					var shipState= req.body.shipStatus;
					//var index=checked.length; 
					var statusUpdate = function(index)
					{
					if(index==checked.length){
					console.log("loop done");
					}	
					else
					{
					var checked_shipment = checked[index];
					console.log("selected check box now" +checked_shipment );
					mysql.query("update shipment set Ship_Status = ? where Shipment_ID = ?", [shipState,checked_shipment],function(err, result, fields)
					{
					
					//JSON.stringify(result);
					if (err)		
						throw err;
					else
					console.log("shipment status update success");	
				
				 
				      
					 });
				statusUpdate(index +1);	
					}	
					}
				statusUpdate(0);	
				
 res.send('ship status updated successfully')   
});
		
	
	});
	
	
	
});

});

http.createServer(app).listen(3000);

