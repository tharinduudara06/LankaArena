import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import router from './routes/Routes.js'
import adminRouter from './admin/adminRoutes.js'
import coachRouter from './coach/coachRoute.js'
import path from 'path'
import { fileURLToPath } from 'url';
import gm_router from './ground_manager/groundManager_routes.js'
import opm_router from './operation_manager/operation_manager_routes.js'
import playerRouter from './player/playerRoute.js'
import notificationRouter from './routes/notificationRoutes.js'
import multer from 'multer'

// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/lankaArena";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    exposedHeaders: ['set-cookie']
}));
app.use(session({
    secret: "ja@#12rvis34",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: MONGO_URI,
        ttl: 60*60*24,
        autoRemove: 'interval',
        touchAfter: 0
    }),
    cookie:
    {
        httpOnly: true,
        maxAge: 1000*60*60*24,
        sameSite: 'lax',
        secure: false,
        expires: new Date(Date.now() + 1000*60*60*24)
    }
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname,'uploads')));

app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'File too large. Maximum size is 5MB.'
            });
        }
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                message: 'Too many files uploaded.'
            });
    }
    res.status(500).json({
        message: error.message || 'Internal server error'
    });
});

mongoose.connect(MONGO_URI)
    .then(() => {

        console.log("DB connected!");
        app.listen(PORT, ()=>{

            console.log(`Server is runnning on port ${PORT}`);
        })
    })
app.use(router);
app.use('/api/admin', adminRouter);
app.use('/api/coach', coachRouter);
app.use('/api/ground-manager', gm_router);
app.use('/api/operation-manager', opm_router);
app.use('/api/player', playerRouter);
app.use('/api/notifications', notificationRouter);