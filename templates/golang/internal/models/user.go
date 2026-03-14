package models

import (
	"time"

	"gorm.io/gorm"
)

// User is the GORM model for the users table.
// This is the infrastructure layer representation — map to/from domain.User as needed.
type User struct {
	ID        uint `gorm:"primarykey"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
	Email     string         `gorm:"uniqueIndex;not null"`
	Password  string         `gorm:"not null"`
	Name      string
}

func (User) TableName() string {
	return "users"
}
