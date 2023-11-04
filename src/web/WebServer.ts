import { EraserTailClient } from "@pencilfoxstudios/erasertail";
import { Client } from "discord.js";
import express from 'express';
import { HopOnDBClient } from "src/api/HopOnDBClient";
import { SteamOpenIdStrategy, SteamOpenIdUser, SteamOpenIdUserProfile, VerifyCallback } from 'passport-steam-openid';

import passport from "passport";
import session from 'express-session';
import { success } from "../helpers/Embeds";

export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080;
export const BASEURL = `http${process.env.env == "dev" ? `://localhost:${PORT}` : "s://hopon.pnfx.dev"}`;

declare module 'express-session' {
    interface Session {
        discordUserId?: string;
    }
}

interface SteamUser {
    steamid: string; // Add the 'steamid' property with the correct data type
    // Other properties you might have in the 'User' object
}

export class WebServer {
    private Discord: Client;
    private EraserTail: EraserTailClient;
    private HopOn: HopOnDBClient;

    private readonly app = express();
    private readonly PORT: number = PORT;

    constructor(client: Client, HopOn: HopOnDBClient, EraserTail: EraserTailClient) {
        this.app.use(session({
            secret: "frick!", // Replace with your own secret key
            resave: false,
            saveUninitialized: false,
            cookie: { secure: false }
        }));
        this.app.use(passport.initialize());
        this.app.use(passport.session());
        this.Discord = client;
        this.HopOn = HopOn;
        this.EraserTail = EraserTail;
        this.init();
    }

    init() {
        const ET = this.EraserTail;

        passport.use(
            new SteamOpenIdStrategy({
                returnURL: `${BASEURL}/auth/steam/callback`,
                profile: true,
                apiKey: process.env.STEAM_API_KEY!
            }, (
                req: express.Request,
                identifier: string,
                profile: SteamOpenIdUserProfile,
                done: any
            ) => {
                console.log(req.session);

                const discordUserId: string | undefined = req.session.discordUserId;

                console.log('Received Discord User ID:', discordUserId);

                if (discordUserId) {
                    this.HopOn.createUser(discordUserId, profile.steamid).then(() => {
                        ET.log("Info", `Created user ${discordUserId} with Steam ID ${profile.steamid}.`);
                        done(null, profile); // Serialize the entire user object
                    }).catch((err) => {
                        ET.log("Error", err as any);
                    });
                } else {
                    ET.log("Error", "No Discord user ID provided!");
                    // Handle the error
                }
            })
        );

        passport.serializeUser((user: any, done) => {
            console.log(`Serialized ${user.steamid}.`);
            done(null, user.steamid);
        });

        passport.deserializeUser((steamid: string, done) => {
            console.log(`Deserialized ${steamid}.`);
            done(null, { steamid }); // Deserialize the entire user object
        });

        this.app.get('/', (request, response) => {
            response.send("I AM ALIVE.");
        });
        this.app.get('/auth', (req, res, next) => {
            req.session.discordUserId = req.query.discordUserId as string;
            res.redirect('/auth/steam');
        });
        this.app.get('/auth/steam', passport.authenticate("steam-openid", { successRedirect: '/auth/steam/callback' }));
        this.app.get('/auth/steam/callback', passport.authenticate("steam-openid"), (req, res) => {
            // Authentication was successful, redirect or do something else
            res.send("Success! You can now close this tab and retry your command.");
        });
    }

    async start() {
        try {
            this.EraserTail.log("Debug", `process.env.PORT => ${process.env.PORT}`);
            this.EraserTail.log("Debug", `Listening on ${this.PORT}`);
            this.app.listen(this.PORT);
        } catch (err) {
            this.EraserTail.log("Error", err as any);
        }
    }
}
