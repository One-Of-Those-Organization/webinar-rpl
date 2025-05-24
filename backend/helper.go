package main

import (
	"net/mail"
)

func isEmailValid(e string) bool {
    _, err := mail.ParseAddress(e)
    return err == nil
}
