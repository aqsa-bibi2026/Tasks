const express = require("express");
const cors = require("cors");

const app = express();


// Middleware
app.use(cors());
app.use(express.json());



// Home API

app.get("/", (req, res) => {

    res.json({

        success: true,

        project: "PayFlow Enterprise Payment API",

        status: "Running"

    });

});




// Create Payment Checkout API

app.post("/api/v1/payment/create-checkout", (req, res) => {


    const {
        name,
        email
    } = req.body;



    console.log("Customer Name:", name);
    console.log("Customer Email:", email);



    res.json({

        success: true,

        message: "Stripe checkout session created successfully",


        customer: {

            name: name,

            email: email

        },


        checkoutUrl:
        "https://checkout.stripe.com/demo-session"


    });


});






// Payment Status API

app.get("/api/v1/payment/status", (req, res) => {


    res.json({

        success: true,

        status: "Payment system ready",

        gateway: "Stripe"


    });


});






// Payment History API

app.get("/api/v1/payment/history", (req, res) => {


    res.json({

        success: true,


        payments: [

            {

                id: 1,

                customer: "Demo Customer",

                amount: 99,

                currency: "USD",

                status: "Completed"

            }


        ]


    });


});







// 404 Handler

app.use((req,res)=>{


    res.status(404).json({

        success:false,

        message:"API endpoint not found"

    });


});







// Server Start

app.listen(5000, ()=>{


    console.log(
        "🚀 PayFlow Enterprise API running on port 5000"
    );


});