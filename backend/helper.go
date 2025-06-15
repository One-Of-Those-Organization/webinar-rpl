package main

import (
    "crypto/rand"
    "encoding/base64"
    "errors"
    "fmt"
    "math/big"
    "net/mail"
    "os"
    "time"
    "webrpl/table"

    "github.com/gofiber/fiber/v2"
    "github.com/golang-jwt/jwt/v5"
    "golang.org/x/crypto/bcrypt"
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

func HashPassword(password string) (string, error) {
    // The cost parameter determines how computationally expensive the hash is to calculate
    // The default is 10, but you can increase it for better security (at the cost of performance)
    hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    if err != nil {
        return "", fmt.Errorf("failed to hash password: %w", err)
    }
    return string(hashedBytes), nil
}

func CheckPassword(hashedPassword, plainPassword string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(plainPassword))
    return err == nil
}

func RandStringBytes(backend *Backend, value string) string {
    str := base64.StdEncoding.EncodeToString([]byte(value))
    return str
}

func GetJWT(c *fiber.Ctx) (jwt.MapClaims, error) {
    user := c.Locals("user").(*jwt.Token)
    if user == nil {
        return nil, errors.New("JWT token not valid")
    }
    claims := user.Claims.(jwt.MapClaims)
    return claims, nil
}

const otpExpiryDuration = 5 * time.Minute
const letterBytes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"
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

    var existingOTP table.OTP
    res := backend.db.Where("user_id = ?", userId).First(&existingOTP)

    if res.Error != nil {
        if !errors.Is(res.Error, gorm.ErrRecordNotFound) {
            return nil, res.Error
        }

        newOTP := table.OTP{
            UserId:      userId,
            OtpCode:     result,
            TimeCreated: time.Now(),
        }
        if err := backend.db.Create(&newOTP).Error; err != nil {
            return nil, errors.New("failed to create new OTP")
        }
        return &newOTP, nil
    }

    if time.Since(existingOTP.TimeCreated) < otpExpiryDuration {
        return &existingOTP, nil
    }

    existingOTP.OtpCode = result
    existingOTP.TimeCreated = time.Now()

    if err := backend.db.Save(&existingOTP).Error; err != nil {
        return nil, errors.New("failed to update existing OTP")
    }
    return &existingOTP, nil
}

func IsOTPExpired(otp table.OTP) bool {
	return time.Since(otp.TimeCreated) > otpExpiryDuration
}
