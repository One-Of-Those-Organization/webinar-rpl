package table

import (
    "gorm.io/gorm"
)

type CertTemplate struct {
    gorm.Model
    CertId  int    `gorm:"column:cert_id;primaryKey"`
    EventId int    `gorm:"column:event_id"`

    Event   Event  `gorm:"foreignKey:EventId"`
}
