const emailValidator = require("email-validator")
const userModel = require("../models/userModel")
const jwt = require('jsonwebtoken')

const createUser = async function (req, res) {
    const validName = /^[A-Za-z -.]+$/
    const validPhoneNumber = /^[0]?[6789]\d{9}$/
    let validPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;
    let userData = req.body;
    const { title, name, phone, email, password, address } = userData;

    if (Object.keys(userData).length == 0) return res.status(400).send({ status: false, message: "Require-Body Mandatory" })
    if (!title) return res.status(400).send({ status: false, message: "title is  Mandatory" })
    if (!(["Mr", "Mrs", "Miss"].includes(title))) return res.status(400).send({ status: false, message: "title should be Mr Mrs Miss" })
    if (!name) return res.status(400).send({ status: false, message: "name is  Mandatory" })
    if (!phone) return res.status(400).send({ status: false, message: "phoneNumber is  Mandatory" })
    if (!email) return res.status(400).send({ status: false, message: "email is  Mandatory" })
    if (!password) return res.status(400).send({ status: false, message: "password is  Mandatory" })


    if (!validName.test(name)) return res.status(400).send({ status: false, message: "name is Invalid" })
    if (!validPhoneNumber.test(phone)) return res.status(400).send({ status: false, message: "phoneNumber is incorrect" })
    if (!emailValidator.validate(email)) return res.status(400).send({ status: false, message: "Provide email in correct format  " })
    if (!validPassword.test(password)) return res.status(400).send({ status: false, message: "password should be min 8 and max 15 char length, ex:Nitin@123" })

    let uniqueEmail = await userModel.findOne({ email: email })
    if (uniqueEmail) return res.status(400).send({ status: false, message: "Email already exist" })

    let uniquePhone = await userModel.findOne({ phone: phone })
    if (uniquePhone) return res.status(400).send({ status: false, message: "Phone Number already exist" })

    let data = await userModel.create(userData)
    return res.status(201).send({ status: true, data: data })
}

const loginUser = async function (req, res) {
    try {
        let email = req.body.email
        let password = req.body.password

        let userData = await userModel.findOne({ email: email, password: password })
        if (!userData) { return res.status(400).send({ status: false, message: "Please use correct email or password" }) }
        let token = jwt.sign(
            {
                userId: userData._id.toString(),
                batch: "radon",
                organisation: "FunctionUp",
            },
            "project-bookManagement"
        );
        res.setHeader("x-api-key", token);
        return res.status(200).send({ status: true, message: "Success", data: { token } });
    } catch (err) {
        return res.status(500).send({ msg: "Error", Error: err.message })
    }
};

module.exports.createUser = createUser
module.exports.loginUser = loginUser