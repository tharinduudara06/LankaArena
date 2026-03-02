import express from 'express'
import OTP from '../models/otp.js'
import User from '../models/Users.js'
import nodemailer from 'nodemailer'

const from_email = 'pasinduh84@gmail.com';
const App_pass = 'oylo ganv vrhp yimo';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: from_email,
        pass: App_pass
    }
});

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export const register = async (req, res) => {
    const {
        name,
        email,
        mobile,
        password,
        role,
        status
    } = req.body;

    try {
        // Check for ANY existing user (including soft-deleted ones)
        const existUser = await User.findOne({
            $or: [
                { email: email },
                { mobile: mobile },
            ],
        });

        if (existUser) {
            // If user exists (whether deleted or not), prevent registration
            if (existUser.isDeleted) {
                return res.status(400).json({
                    message: "This email or mobile number was previously used and cannot be reused. Please use different credentials."
                });
            } else {
                // User exists and is active
                return res.status(400).json({
                    message: "User already exists!"
                });
            }
        }

        // If no user exists (deleted or active), proceed with registration
        req.session.regUser = {
            Name: name,
            Email: email,
            Mobile: mobile,
            Pass: password,
            Role: role,
            status: status,
            isDeleted: false
        };

        await OTP.deleteMany({ email });

        const otp = generateOTP();

        const newOtp = new OTP({ email, otp });
        await newOtp.save();

        const mailOptions = {
            from: from_email,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP code is: ${otp}. It will expire in 5 minutes`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email: ', error);
                req.session.regUser = null;
                return res.status(500).json({
                    message: 'Failed to send OTP'
                });
            }

            console.log(req.session.regUser);

            return res.status(200).json({
                message: 'OTP sent successfully!'
            });
        });

    } catch (error) {
        console.error('Error sending OTP: ', error);
        return res.status(500).json({
            message: "Server error"
        });
    }
}

export const otpVerify = async (req, res) => {
    const { otp } = req.body;

    try {
        if (!req.session.regUser) {
            return res.status(400).json({
                message: "Session expired or invalid. Please try registering again."
            });
        }

        const user_email = req.session.regUser.Email;

        const isVerify = await OTP.findOne({ otp, email: user_email });

        if (!isVerify) {
            console.log(`Invalid OTP attempt for email: ${user_email}`);
            return res.status(400).json({
                message: "Invalid OTP code!"
            });
        }

        // Final check to ensure no user exists with this email/mobile (race condition protection)
        const finalCheck = await User.findOne({
            $or: [
                { email: user_email },
                { mobile: req.session.regUser.Mobile },
            ],
        });

        if (finalCheck) {
            return res.status(400).json({
                message: "User registration failed. Please try again with different credentials."
            });
        }

        // Create new user
        const newUser = new User({
            name: req.session.regUser.Name,
            email: req.session.regUser.Email,
            mobile: req.session.regUser.Mobile,
            password: req.session.regUser.Pass,
            role: req.session.regUser.Role,
            status: req.session.regUser.status,
            isDeleted: false
        });

        await newUser.save();

        // Clear session after successful registration
        req.session.regUser = null;

        return res.status(200).json({
            message: "Successfully registered!"
        });

    } catch (error) {
        console.error('Error during OTP verification: ', error);
        
        // Handle duplicate key error specifically
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Registration failed. The email or mobile number is already in use."
            });
        }
        
        return res.status(500).json({
            message: "Server error during registration"
        });
    }
}