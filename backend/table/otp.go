package table

import (
    "time"
    "gorm.io/gorm"
)

// CHange userid to useremail so it work...
type OTP struct {
    gorm.Model
    ID          int       `gorm:"primaryKey"`
    UserEmail   string    `gorm:"column:user_email"`
    OtpCode     string    `gorm:"column:otp_code"`
    TimeCreated time.Time `gorm:"column:time_created"`
}
