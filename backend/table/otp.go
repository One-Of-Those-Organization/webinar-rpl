package table

import (
    "gorm.io/gorm"
)

type OTP struct {
    gorm.Model
    ID      int    `gorm:"primaryKey"`
    UserId  int    `gorm:"column:user_id"`
    OtpCode string `gorm:"column:otp_code"`

    User    User   `gorm:"foreignKey:UserId"`
}
