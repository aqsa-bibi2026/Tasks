const express = require("express");
const cors = require("cors");

const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");


const app = express();


// Middleware
app.use(cors());
app.use(express.json());



// Swagger Configuration

const swaggerOptions = {

    definition: {

        openapi: "3.0.0",

        info: {

            title: "TaskFlow Enterprise API",

            version: "1.0.0",

            description:
            "Professional REST API Documentation Portal"

        },


        servers:[

            {
                url:"http://localhost:5000",
                description:"Local Server"
            }

        ],


        tags:[

            {
                name:"Authentication"
            },

            {
                name:"Users"
            },

            {
                name:"Audit"
            }

        ],


        components:{

            securitySchemes:{

                bearerAuth:{

                    type:"http",

                    scheme:"bearer",

                    bearerFormat:"JWT"

                }

            }

        }


    },


    apis:["./server.js"]

};




const swaggerSpec = swaggerJsdoc(swaggerOptions);




// Custom Swagger Style

const customCss = `

.swagger-ui .topbar {

background:#111827;

}


.swagger-ui .info .title {

font-size:38px;

font-weight:700;

}


.swagger-ui .opblock {

border-radius:12px;

}


.swagger-ui .btn {

border-radius:8px;

}

`;





app.use(

"/api-docs",

swaggerUi.serve,

swaggerUi.setup(

swaggerSpec,

{

customCss:customCss,

customSiteTitle:"TaskFlow Developer Portal",

deepLinking:true

}

)

);





// ==========================
// USER API
// ==========================



/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users fetched successfully
 */


app.get("/api/v1/users",(req,res)=>{


    res.json({

        success:true,

        message:"Users API Working",

        data:[

            {

                id:1,

                name:"Admin User",

                role:"manager"

            }

        ]

    });


});






// ==========================
// LOGIN API
// ==========================




/**
 * @swagger
 * /api/v1/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User login
 *     responses:
 *       200:
 *         description: Login successful
 */


app.post("/api/v1/login",(req,res)=>{


    res.json({

        success:true,

        token:"sample-jwt-token"

    });


});







// ==========================
// AUDIT API
// ==========================




/**
 * @swagger
 * /api/v1/audit:
 *   get:
 *     tags:
 *       - Audit
 *     summary: Get audit logs
 *     responses:
 *       200:
 *         description: Audit data returned
 */


app.get("/api/v1/audit",(req,res)=>{


    res.json({

        success:true,

        logs:[]

    });


});







app.listen(5000,()=>{


console.log(
"TaskFlow API Server Running : 5000"
);


});