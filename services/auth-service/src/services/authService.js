const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async ({ name, email, password}) => {
    if (!name || !email || !password) {
        throw new Error("All fields are required");
    }

const existingUser = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );
if (existingUser.rows.length> 0){
    throw new Error("User already exists");

}

const hashedPassword = await bcrypt.hash(password,10);

await pool.query(

    `INSERT INTO users
    (name, email, password_hash)
    VALUES ($1, $2, $3)
    `, 
    [name, email, hashedPassword]
);

return {
    success:true,
    message: "User registered successfully",

};
};


const loginUser=async ({email, password })=> {
    if (!email || !password) {
        throw new Error("email and passowrd are required");

    }

    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );

    const user = result.rows[0];

    if(!user){
        throw new Error("Invalid credentials");

    }

    const isMatch = await bcrypt.compare(
        password,
        user.password_hash
    );

    if(!isMatch) {
        throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
        {
            userId: user.id,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET,

        {
            expiresIn: "1d",
        }
    );

    return {
        success: true,
        token,
        user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
        }

    };

};

const getUserProfile = async (userId) => {
    const result = await pool.query(
        `SELECT
        id,
        name,
        email,
        role,
       created_at
       FROM users
       WHERE id = $1
        `,
        [userId]
    );

    const user = result.rows[0];

    if(!user) {
        throw new Error("User not found");
    }

    return {
        success: true,
        data: user
    };
};




module.exports = { 
    registerUser, 
    loginUser,
    getUserProfile, 

};