package main

// Thanks to:
//   https://mailtrap.io/blog/golang-send-email-gmail/
//   https://www.mailjerry.com/create-gmail-app-password

import (
    "log"
    gomail "gopkg.in/mail.v2"
)

func sendEmailTo(backend *Backend, to string, subject string, body string) bool {
    message := gomail.NewMessage()

    message.SetHeader("From", backend.email)
    message.SetHeader("To", to)
    message.SetHeader("Subject", subject)

    message.SetBody("text/plain", body)
    dialer := gomail.NewDialer("smtp.gmail.com", 587, backend.email, backend.emailpass)

    if err := dialer.DialAndSend(message); err != nil {
        log.Println("Error:", err)
        return false
    }

    log.Println("Email sent successfully!")
    return true
}
