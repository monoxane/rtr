package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.49

import (
	"context"
	"fmt"

	"github.com/monoxane/rtr/internal/graph"
	"github.com/monoxane/rtr/internal/graph/model"
	"github.com/monoxane/rtr/internal/repository/users"
)

// CreatedAt is the resolver for the createdAt field.
func (r *routerResolver) CreatedAt(ctx context.Context, obj *model.Router) (*int, error) {
	ret := int(obj.CreatedAt.Unix())
	return &ret, nil
}

// UpdatedAt is the resolver for the updatedAt field.
func (r *routerResolver) UpdatedAt(ctx context.Context, obj *model.Router) (*int, error) {
	ret := int(obj.CreatedAt.Unix())
	return &ret, nil
}

// UpdatedBy is the resolver for the updatedBy field.
func (r *routerResolver) UpdatedBy(ctx context.Context, obj *model.Router) (*model.User, error) {
	return users.GetByID(*obj.UpdatedBy)
}

// Destinations is the resolver for the destinations field.
func (r *routerResolver) Destinations(ctx context.Context, obj *model.Router) ([]*model.Destination, error) {
	panic(fmt.Errorf("not implemented: Destinations - destinations"))
}

// Sources is the resolver for the sources field.
func (r *routerResolver) Sources(ctx context.Context, obj *model.Router) ([]*model.Source, error) {
	panic(fmt.Errorf("not implemented: Sources - sources"))
}

// Router returns graph.RouterResolver implementation.
func (r *Resolver) Router() graph.RouterResolver { return &routerResolver{r} }

type routerResolver struct{ *Resolver }
