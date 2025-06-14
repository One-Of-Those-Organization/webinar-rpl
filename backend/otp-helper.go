package main

import (
    "errors"
	"crypto/rand"
	"webrpl/table"
    "math/big"
)

const letterBytes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"

// Gen OTP Code and save it to db.
// return the otp obj
func createOTPCode(backend *Backend, n int, userId int) (*table.OTP, error) {
    if n <= 0 {
        return nil, errors.New("invalid length")
    }

	b := make([]byte, n)
	for i := range b {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(letterBytes))))
		if err != nil {
			return nil, err
		}
		b[i] = letterBytes[num.Int64()]
	}
    result := string(b)

    newOTP := table.OTP{
        UserId: userId,
        OtpCode: result,
    }

    res := backend.db.Save(&newOTP)
    if res.Error != nil {
        return nil, errors.New("Failed to gen the OTP.")
    }
    return &newOTP, nil
}
