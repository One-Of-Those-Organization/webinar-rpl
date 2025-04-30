package table

import (
    "gorm.io/gorm"
)

type EventMaterial struct {
    gorm.Model
    EventMatId         int    `gorm:"column:eventm_id;primaryKey"`
    EventId            int    `gorm:"column:event_id"`
    EventMatAttachment string `gorm:"column:eventm_attach"`

    Event              Event  `gorm:"foreignKey:EventId"`
}
