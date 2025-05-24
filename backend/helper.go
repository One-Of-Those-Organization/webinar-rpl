package main

import (
    "net/mail"
    "regexp"
)

func isEmailValid(e string) bool {
    _, err := mail.ParseAddress(e)
    return err == nil
}

func isPasswordValid(pass string) bool {
	passwordRegex := `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}\[\]~.]).{8,}$`
	re := regexp.MustCompile(passwordRegex)
	return re.MatchString(pass)
}
