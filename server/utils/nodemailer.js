import nodemail from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemail.createTransport({
    service: "gmail",
    port: 587,
    auth: {
        user: process.env.MAIL_EMAIL,
        pass: process.env.MAIL_PWD,
    },
    secure: false,
});

export function sendSignedUpMail(username, userMail) {
    const message = {
        from: process.env.MAIL_EMAIL,
        to: userMail,
        subject: "Welcome to Wow Chatter",
        html: `<b>Greetings ${username}!</b>
                <br>
                <p>We here at Wow Chatter would like to welcome you to the site. 
                We hope you'll enjoy your stay.</p>
                <br>
                <i>Kind regards <br> The Wow Chatter dev</i>`
    };

    transporter.sendMail(message, (error, info) => {
        if (error) {
            console.error(error);
        } else {
            console.log(`Email sent: ${info.response}`);
        }
    });
}