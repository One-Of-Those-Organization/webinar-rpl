package table

import (
    "time"
    "gorm.io/gorm"
)

// IF 1 then its an ADMIN other is NORMAL USER
type User struct {
    gorm.Model
    ID             int       `gorm:"primaryKey"`
    UserFullName   string    `gorm:"column:user_full_name"`
    UserPassword   string    `gorm:"column:user_password" json:"-"`
    UserEmail      string    `gorm:"column:user_email"`
    UserInstance   string    `gorm:"column:user_instance"`
    UserRole       int       `gorm:"column:user_role"`
    UserPicture    string    `gorm:"column:user_picture"`
    UserCreatedAt  time.Time `gorm:"column:user_created_at;type:datetime"`

    EventParticipants []EventParticipant `gorm:"foreignKey:UserId"`
}
