import * as dotenv from 'dotenv';

dotenv.config();

const env = process.env.ENV || "TEST";

export const config = {
    projectName: process.env.PROJECTNAME,
}