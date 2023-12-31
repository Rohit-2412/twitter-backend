import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
require("dotenv").config();
const ses = new SESClient({});

function createSendEmailCommand(
    toAddress: string,
    fromAddress: string,
    message: string
) {
    return new SendEmailCommand({
        Destination: {
            ToAddresses: [toAddress],
        },
        Source: fromAddress,
        Message: {
            Subject: {
                Charset: "UTF-8",
                Data: "Email Verification",
            },
            Body: {
                Text: {
                    Charset: "UTF-8",
                    Data: message,
                },
            },
        },
    });
}

export async function sendEmailToken(email: string, token: string) {
    const message = `Your OTP for login is ${token}`;
    const command = createSendEmailCommand(
        email,
        "rk212300@outlook.com",
        message
    );
    try {
        return await ses.send(command);
    } catch (e) {
        console.log(e);
        return e;
    }
}
