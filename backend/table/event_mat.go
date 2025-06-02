package table

import (
    "gorm.io/gorm"
)

type EventMaterial struct {
    gorm.Model
    ID                 int    `gorm:"primaryKey"`
    EventId            int    `gorm:"column:event_id"`
    EventMatAttachment string `gorm:"column:eventm_attach"`

    Event              Event  `gorm:"foreignKey:EventId"`
}
