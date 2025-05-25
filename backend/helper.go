package main

import (
	"net/mail"
	"os"
	"webrpl/table"
    "errors"
	"gorm.io/gorm"
)

func isEmailValid(e string) bool {
    _, err := mail.ParseAddress(e)
    return err == nil
}

func checkOrMakeAdmin(backend *Backend, secret string) bool {
    reserved := "admin@wowadmin.com"
    var user table.User

    res := backend.db.Where("user_email = ?", reserved).First(&user)
    if res.Error == nil {
        if !CheckPassword(user.UserPassword, secret) {
            hashed, err := HashPassword(secret)
            if err != nil {
                return false
            }
            user.UserPassword = hashed
            if err := backend.db.Save(&user).Error; err != nil {
                return false
            }
        }
        return true
    }

    if !errors.Is(res.Error, gorm.ErrRecordNotFound) {
        return false
    }

    hashed, err := HashPassword(secret)
    if err != nil {
        return false
    }

    user = table.User{
        UserEmail:    reserved,
        UserFullName: "admin",
        UserPassword: hashed,
        UserRole:     1,
    }

    if err := backend.db.Create(&user).Error; err != nil {
        return false
    }

    return true
}

func getCredentialFromEnv() string {
    password := os.Getenv("SECRET_KEY")
    if password == "" {
        password = "secret"
    }
    return password
}
