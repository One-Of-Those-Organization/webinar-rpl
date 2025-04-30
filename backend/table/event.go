package table

import (
    "time"
    "gorm.io/gorm"
)

type AttTypeEnum string

const (
    Online  AttTypeEnum = "online"
    Offline AttTypeEnum = "offline"
)

type Event struct {
    gorm.Model
    EventId      int         `gorm:"column:event_id;primaryKey"`
    EventDesc    string      `gorm:"column:event_desc"`
    EventName    string      `gorm:"column:event_name"`
    EventDStart  time.Time   `gorm:"column:event_dstart;type:datetime"`
    EventDEnd    time.Time   `gorm:"column:event_dend;type:datetime"`
    EventLink    string      `gorm:"column:event_link"`
    EventSpeaker string      `gorm:"column:event_speaker"`
    EventAtt     AttTypeEnum `gorm:"column:event_att"`

    EventMaterials    []EventMaterial    `gorm:"foreignKey:EventId"`
    EventParticipants []EventParticipant `gorm:"foreignKey:EventId"`
    CertTemplates     []CertTemplate     `gorm:"foreignKey:EventId"`
}
