package table

import (
    "time"
    "gorm.io/gorm"
)

// Change UserId to UserEmail so it work...
// Added time TimeCreated
type OTP struct {
    gorm.Model
    ID          int       `gorm:"primaryKey"`
    UserEmail   string    `gorm:"column:user_email"`
    OtpCode     string    `gorm:"column:otp_code"`
    TimeCreated time.Time `gorm:"column:time_created"`
    Used        bool      `gorm:"column:used"`
}
