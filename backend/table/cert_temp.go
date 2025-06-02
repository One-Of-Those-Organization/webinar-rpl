package table

import (
    "gorm.io/gorm"
)

type CertTemplate struct {
    gorm.Model
    ID           int    `gorm:"primaryKey"`
    CertTemplate string `gorm:"column:cert_template"`
    EventId      int    `gorm:"column:event_id"`

    Event   Event  `gorm:"foreignKey:EventId"`
}
