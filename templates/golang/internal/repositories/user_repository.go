package repositories

import (
	"context"

	"{{PROJECT_NAME}}/internal/domain"
	"{{PROJECT_NAME}}/internal/models"

	"gorm.io/gorm"
)

// userRepository implements domain.UserRepository using GORM + PostgreSQL.
type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) domain.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(ctx context.Context, user *domain.User) error {
	m := toModel(user)
	if err := r.db.WithContext(ctx).Create(m).Error; err != nil {
		return err
	}
	user.ID = m.ID
	user.CreatedAt = m.CreatedAt
	user.UpdatedAt = m.UpdatedAt
	return nil
}

func (r *userRepository) FindByID(ctx context.Context, id uint) (*domain.User, error) {
	var m models.User
	if err := r.db.WithContext(ctx).First(&m, id).Error; err != nil {
		return nil, err
	}
	return toDomain(&m), nil
}

func (r *userRepository) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
	var m models.User
	if err := r.db.WithContext(ctx).Where("email = ?", email).First(&m).Error; err != nil {
		return nil, err
	}
	return toDomain(&m), nil
}

func (r *userRepository) Update(ctx context.Context, user *domain.User) error {
	m := toModel(user)
	return r.db.WithContext(ctx).Save(m).Error
}

func (r *userRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.User{}, id).Error
}

func toModel(u *domain.User) *models.User {
	return &models.User{
		ID:       u.ID,
		Email:    u.Email,
		Password: u.Password,
		Name:     u.Name,
	}
}

func toDomain(m *models.User) *domain.User {
	return &domain.User{
		ID:        m.ID,
		Email:     m.Email,
		Password:  m.Password,
		Name:      m.Name,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
	}
}
