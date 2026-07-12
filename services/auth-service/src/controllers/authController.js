const authService = require("../services/authService");

const register = async (req, res) => {
    try {
        const result = await authService.registerUser(req.body);

        res.status(201).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
    });
 }
};

const login = async (req, res)=> {
    try {
        const result = await authService.loginUser(req.body);

        res.status(200).json(result);
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message,
        });
       
    }
};

const profile = async (req, res) => {
    try {
        const result =
        await authService.getUserProfile(
            req.user.userId
        );

        res.status(200).json(result);

    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
}




module.exports = { 
    register,
    login,
    profile, 

 };
