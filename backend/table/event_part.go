package table

import (
    "gorm.io/gorm"
)

type UserEventRoleEnum string

const (
    NormalU    UserEventRoleEnum = "normal"
    CommitteeU UserEventRoleEnum = "committee"
)

type EventParticipant struct {
    gorm.Model
    ID           int               `gorm:"primaryKey"`
    EventId      int               `gorm:"column:event_id"`
    UserId       int               `gorm:"column:user_id"`
    EventPRole   UserEventRoleEnum `gorm:"column:eventp_role"`
    EventPCome   bool              `gorm:"column:eventp_come"`
    EventPCode   string            `gorm:"column:eventp_code"`

    Event        Event  `gorm:"foreignKey:EventId"`
    User         User   `gorm:"foreignKey:UserId"`
}
