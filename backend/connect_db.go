package main

import (
    "log"
    "gorm.io/driver/sqlite"
    "gorm.io/gorm"
    "webrpl/table"
)

func open_db(dbFile string) (*gorm.DB, error) {
    db, err := gorm.Open(sqlite.Open(dbFile), &gorm.Config{})
    if err != nil {
        return nil, err
    }
    return db, nil
}

func migrate_db(db *gorm.DB) error {
    err := db.AutoMigrate(&table.User{})
    if err != nil {
        log.Fatal("failed to migrate database:", err)
        return err
    }
    err = db.AutoMigrate(&table.Event{})
    if err != nil {
        log.Fatal("failed to migrate database:", err)
        return err
    }
    err = db.AutoMigrate(&table.OTP{})
    if err != nil {
        log.Fatal("failed to migrate database:", err)
        return err
    }
    err = db.AutoMigrate(&table.EventParticipant{})
    if err != nil {
        log.Fatal("failed to migrate database:", err)
        return err
    }
    err = db.AutoMigrate(&table.EventMaterial{})
    if err != nil {
        log.Fatal("failed to migrate database:", err)
        return err
    }
    err = db.AutoMigrate(&table.CertTemplate{})
    if err != nil {
        log.Fatal("failed to migrate database:", err)
        return err
    }
    return nil
}
