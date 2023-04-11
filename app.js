const express = require('express');
const mongoose = require('mongoose');
const app = express();
const dbConnect = require("./db/dbConnect");
const port = 3000;
const bcrypt = require('bcrypt'); 
const auth = require("./auth");
const jwt = require('jsonwebtoken');
app.use(express.json());


// execute database connection 
dbConnect();

// Curb Cores Error by adding a header here
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});
const User = require("./db/userModel");


app.post("/register", async (request, response) => {
    console.log('Request Body:', request.body);

    // hash the password
    const salt = await bcrypt.genSalt(10);
    bcrypt
      .hash(request.body.password, salt)
      .then((hashedPassword) => {
        // create a new user instance and collect the data
        const user = new User({
          email: request.body.email,
          password: hashedPassword,
        });
  
        // save the new user
        user
          .save()
          // return success if the new user is added to the database successfully
          .then((result) => {
            console.log('New user created:${result');
            response.status(201).send({
              message: "User Created Successfully",
              result,
            });
          })
          // catch error if the new user wasn't added successfully to the database
          .catch((error) => {
            console.log(`Error creating user:${error}`);
            response.status(500).send({
              message: "Error creating user",
              error,
            });
          });
      })
      // catch error if the password hash isn't successful
      .catch((e) => {
        console.log(`Error hashing password: ${e}`);
        response.status(500).send({
          message: "Password was not hashed successfully",
          e,
        });
      });
  });


  // login endpoint


  app.post("/login", async (request, response) => {
    try {
      // check if email exists
      const user = await User.findOne({ email: request.body.email });
  
      if (!user) {
        return response.status(404).send({
          message: "Email not found",
        });
      }
  
      // compare the password entered and the hashed password found
      const passwordCheck = await bcrypt.compare(
        request.body.password,
        user.password
      );
  
      if (!passwordCheck) {
        return response.status(400).send({
          message: "Passwords do not match",
        });
      }
  
      // create JWT token
      const token = jwt.sign(
        {
          userId: user._id,
          userEmail: user.email,
        },
        "RANDOM-TOKEN",
        { expiresIn: "24h" }
      );
  
      // return success response
      response.status(200).send({
        message: "Login successful",
        email: user.email,
        token,
      });
    } catch (error) {
      console.error(error);
      response.status(500).send({
        message: "An error occurred",
        error,
      });
    }
  });







// login endpoint

// app.post("/login", async (request, response) => {
//   try {
//     const { email, password } = request.body;

//     // check if email exists
//     const user = await User.findOne({ email });

//     if (!user) {
//       return response.status(404).send({ message: "Email not found" });
//     }

//     // compare the password entered and the hashed password found
//     const passwordCheck = await bcrypt.compare(password, user.password);

//     // if the passwords do not match
//     if (!passwordCheck) {
//       return response.status(400).send({ message: "Passwords do not match" });
//     }

//     // create JWT token
//     const token = jwt.sign(
//       {
//         userId: user._id,
//         userEmail: user.email,
//       },
//       "RANDOM-TOKEN",
//       { expiresIn: "24h" }
//     );

//     // return success response
//     response.status(200).send({
//       message: "Login Successful",
//       email: user.email,
//       token,
//     });
//   } catch (error) {
//     response.status(500).send({ message: "Internal server error" });
//   }
// });



// app.post("/login", (request, response) => {//this is the right code
//   // check if email exists
//   User.findOne({ email: request.body.email })
//   console.log(user)
//     // if email exists
//     .then((user) => {
//       console.log(user);
//       // compare the password entered and the hashed password found
//       bcrypt
//         .compare(password, user.password)

//         // if the passwords match
//         .then((passwordCheck) => {

//           // check if password matches
//           if(!passwordCheck) {
//             return response.status(400).send({
//               message: "Passwords does not match",
//               error,
//             });
//           }

//           //   create JWT token
//           const token = jwt.sign(
//             {
//               userId: user._id,
//               userEmail: user.email,
//             },
//             "RANDOM-TOKEN",
//             { expiresIn: "24h" }
//           );

//           //   return success response
//           response.status(200).send({
//             message: "Login Successful",
//             email: user.email,
//             token,
//           });
//         })
//         // catch error if password does not match
//         .catch((error) => {
//           response.status(400).send({
//             message: "Passwords does not match",
//             error,
//           });
//         });
//     })
//     // catch error if email does not exist
//     .catch((e) => {
//       response.status(404).send({
//         message: "Email not found",
//         e,
//       });
//     });
// });

  
  app.get("/free-endpoint", (request, response) => {
    response.json({ message: "You are free to access me anytime" });
  });
  
  // authentication endpoint
  app.get("/auth-endpoint", auth, (request, response) => {
    response.json({ message: "You are authorized to access me" });
  });

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });

module.exports = app;