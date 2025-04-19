const express = require('express');
const settingRouter = express.Router();
const SettingModel = require('../models/setting');

require("dotenv").config();

const fs = require('fs');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);


// --------------------------------------------POST SETTING DATA API---------------------------------------------
// settingRouter.post('/setting', async (req, res) => {

//     const {ridetimeout, stop} = req.body;
//     console.log("16", req.body)

//     try {
//         const settingData = new SettingModel({
//             ridetimeout: ridetimeout,
//             stop: stop,
//         })

//         await settingData.save();
//         console.log(settingData);
//         res.status(200).json({
//             success: true,
//             message: "Setting Data Added Successfully",
//             settingData,
//           });

//     } catch (error) {
//     console.log(error);
//     res.status(500).json({ success: false, message: error });
//     }
// })


// --------------------------------------------GET SETTING DATA API---------------------------------------------
settingRouter.put("/updatesetting", async (req, res) => {
    try {
        console.log("Received update request:", req.body);
        
        const id = req.body.id;
        if (!id) {
            return res.status(400).json({ success: false, message: "ID is required" });
        }

        const data = {
            ridetimeout: +req.body.settingdata.ridetimeout,
            stop: +req.body.settingdata.stop,
            EMAIL_USER: req.body.settingdata.EMAIL_USER,
            EMAIL_PASSWORD: req.body.settingdata.EMAIL_PASSWORD,
            accountSid: req.body.settingdata.accountSid,
            authToken: req.body.settingdata.authToken,
            twilioPhoneNumber: req.body.settingdata.twilioPhoneNumber,
            STRIPE_Publishable_key: req.body.settingdata.STRIPE_Publishable_key,
            STRIPE_Secret_key: req.body.settingdata.STRIPE_Secret_key
        };

        console.log("Updating document with ID:", id);
        console.log("Update Data:", data);

        let settingdata = await SettingModel.findByIdAndUpdate(id, data, { new: true });

        if (!settingdata) {
            return res.status(404).json({ success: false, message: "Setting data not found" });
        }

        res.status(200).json({
            success: true,
            message: "Setting Data Updated Successfully",
            settingdata,
        });
    } catch (error) {
        console.log("Error in update setting:", error);
        res.status(500).json({ success: false, message: error.message, error: error });
    }
});

module.exports = settingRouter;

