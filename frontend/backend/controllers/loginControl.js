import express from 'express'
import session from 'express-session'
import User from '../models/Users.js'

export const login = async(req,res) => 
{
    const {email, password} = req.body;

    try {
        
       const isUser = await User.findOne({
            email: email,
            isDeleted: false
        });


        if(!isUser)
        {   
            return res.status(400).json({
                message:"Please Sign Up"
            });
        }

         if (password !== isUser.password) {
            return res.status(403).json({ message: "Invalid credentials" });
        }

        if(isUser.status === 'banned')
        {
            return res.status(401).json({
                message:"banned",
                reason:'banned'
            });
        }

        if(isUser.status === 'pending')
        {
            return res.status(402).json({
                message:"pending",
                reason:'pending'
            });
        }

        req.session.user = isUser;

        return res.status(200).json({
            message: "successfully logged in",
            session:
            {
                id:req.session.user._id,
                name: req.session.user.name,
                role: req.session.user.role,
                SP_type:req.session.user.SP_type,
                status: req.session.user.status
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Something went wrong!'
        });
    }
}