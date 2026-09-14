const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); //gives our controller access to the MongoDB User model, so we can create a user document.

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;     //Validate the input.

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "Name, email and password are required"
        });
    }

    const existingUser = await User.findOne({ email });     //Checks if a user with the provided email already exists in the database.

    if (existingUser) {         
        return res.status(409).json({
            message: "User with this email already exists"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10); //Hashes the password using bcrypt with a salt round of 10. 

    const user = await User.create({
        name,
        email,
        password: hashedPassword
    });

    res.status(201).json({      //Create the User in MongoDB.
        message: "User registered successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const user = await User.findOne({ email });     //MongoDB searches for a user whose email matches the email provided during login.

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);    //Check whether the password the user entered matches the hashed password stored in MongoDB.

    if (!isPasswordCorrect) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }

    const token = jwt.sign(     //Creates a JWT token after the password has been verified successfully. 
        {
            userId: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );

    res.status(200).json({      //Send the JWT token to the user.
        message: "Login successful",
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });

};

const getProfile = (req, res) => {      //Return the currently logged-in user's information.
    res.json({
        message: "Profile accessed successfully",
        user: req.user
    });
};

module.exports = { registerUser, loginUser, getProfile };

