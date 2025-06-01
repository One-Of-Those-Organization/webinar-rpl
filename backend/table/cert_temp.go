package table

import (
    "gorm.io/gorm"
)

type CertTemplate struct {
    gorm.Model
    CertId       int    `gorm:"column:cert_id;primaryKey"`
    CertTemplate string `gorm:"column:cert_template"`
    EventId      int    `gorm:"column:event_id"`

    Event   Event  `gorm:"foreignKey:EventId"`
}
