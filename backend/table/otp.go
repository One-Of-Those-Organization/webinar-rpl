package table

import (
    "gorm.io/gorm"
)

type OTP struct {
    gorm.Model
    OtpID   int    `gorm:"column:otp_id;primaryKey"`
    UserId  int    `gorm:"column:user_id"`
    OtpCode string `gorm:"column:otp_code"`

    User    User   `gorm:"foreignKey:UserId"`
}
