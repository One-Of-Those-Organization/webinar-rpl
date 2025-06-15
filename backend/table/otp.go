package table

import (
    "time"
    "gorm.io/gorm"
)

type OTP struct {
    gorm.Model
    ID          int       `gorm:"primaryKey"`
    UserId      int       `gorm:"column:user_id"`
    OtpCode     string    `gorm:"column:otp_code"`
    TimeCreated time.Time `gorm:"column:time_created"`

    User    User   `gorm:"foreignKey:UserId"`
}
