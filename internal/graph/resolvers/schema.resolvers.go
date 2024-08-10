package resolvers

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.49

import (
	"context"
	"fmt"
	"log"

	"github.com/monoxane/rtr/internal/auth"
	streamsController "github.com/monoxane/rtr/internal/controller/streams"
	"github.com/monoxane/rtr/internal/graph"
	"github.com/monoxane/rtr/internal/graph/model"
	"github.com/monoxane/rtr/internal/repository/streams"
	"github.com/monoxane/rtr/internal/repository/users"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

// Login is the resolver for the login field.
func (r *mutationResolver) Login(ctx context.Context, username string, password string) (*model.LoginResponse, error) {
	user, token, err := auth.Authenticate(username, password)
	if err != nil {
		return nil, err
	}

	return &model.LoginResponse{
		User:  user,
		Token: token,
	}, nil
}

// CreateUser is the resolver for the createUser field.
func (r *mutationResolver) CreateUser(ctx context.Context, user model.UserUpdate) (*model.User, error) {
	requester, err := auth.FromContext(ctx, auth.ROLE_ADMIN)
	if err != nil {
		log.Printf("error authorizing user: %s", err)
		return nil, err
	}

	if user.Password == nil {
		return nil, gqlerror.Wrap(fmt.Errorf("password required"))
	}

	hash, err := auth.HashPassword(*user.Password)
	if err != nil {
		return nil, gqlerror.Wrap(err)
	}

	return users.Create(model.User{
		Username:  *user.Username,
		RealName:  *user.Realname,
		Role:      *user.Role,
		UpdatedBy: &requester.ID,
		Hash:      hash,
	})
}

// UpdateUser is the resolver for the updateUser field.
func (r *mutationResolver) UpdateUser(ctx context.Context, id int, user model.UserUpdate) (*model.User, error) {
	requester, err := auth.FromContext(ctx, auth.ROLE_ADMIN)
	if err != nil {
		log.Printf("error authorizing user: %s", err)
		return nil, err
	}

	err = users.Update(id, model.User{
		Username:  *user.Username,
		RealName:  *user.Realname,
		Role:      *user.Role,
		UpdatedBy: &requester.ID,
	})

	return nil, err
}

// UpdateUserPassword is the resolver for the updateUserPassword field.
func (r *mutationResolver) UpdateUserPassword(ctx context.Context, id int, password string) (*int, error) {
	_, err := auth.FromContext(ctx, auth.ROLE_ADMIN)
	if err != nil {
		log.Printf("error authorizing user: %s", err)
		return &id, err
	}

	hash, err := auth.HashPassword(password)
	if err != nil {
		return &id, gqlerror.Wrap(err)
	}

	err = users.UpdateUserPassword(id, hash)
	if err != nil {
		return &id, gqlerror.Wrap(err)
	}

	return &id, nil
}

// DeactivateUser is the resolver for the deactivateUser field.
func (r *mutationResolver) DeactivateUser(ctx context.Context, id int) (*int, error) {
	requester, err := auth.FromContext(ctx, auth.ROLE_ADMIN)
	if err != nil {
		log.Printf("error authorizing user: %s", err)
		return nil, err
	}

	return &id, users.Deactivate(id, requester.ID)
}

// ReactivateUser is the resolver for the reactivateUser field.
func (r *mutationResolver) ReactivateUser(ctx context.Context, id int) (*int, error) {
	requester, err := auth.FromContext(ctx, auth.ROLE_ADMIN)
	if err != nil {
		log.Printf("error authorizing user: %s", err)
		return nil, err
	}

	return &id, users.Reactivate(id, requester.ID)
}

// CreateStream is the resolver for the createStream field.
func (r *mutationResolver) CreateStream(ctx context.Context, stream model.StreamUpdate) (*model.Stream, error) {
	requester, err := auth.FromContext(ctx, auth.ROLE_ADMIN)
	if err != nil {
		log.Printf("error authorizing user: %s", err)
		return nil, err
	}

	newStream, err := streams.Create(model.Stream{
		Label:       stream.Label,
		Slug:        stream.Slug,
		IsRoutable:  stream.IsRoutable,
		Destination: stream.Destination,
		UpdatedBy:   &requester.ID,
	})

	if err != nil {
		return nil, err
	}

	streamsController.UpdateStream(newStream)

	return newStream, err
}

// DeleteStream is the resolver for the deleteStream field.
func (r *mutationResolver) DeleteStream(ctx context.Context, id int) (*int, error) {
	_, err := auth.FromContext(ctx, auth.ROLE_ADMIN)
	if err != nil {
		log.Printf("error authorizing user: %s", err)
		return nil, err
	}

	return &id, streams.Delete(id)
}

// Roles is the resolver for the roles field.
func (r *queryResolver) Roles(ctx context.Context) ([]string, error) {
	return auth.ROLES, nil
}

// Users is the resolver for the users field.
func (r *queryResolver) Users(ctx context.Context, showDeleted *bool) ([]*model.User, error) {
	_, err := auth.FromContext(ctx, auth.ROLE_ADMIN)
	if err != nil {
		log.Printf("error authorizing user: %s", err)
		return nil, err
	}

	includeDeleted := false

	if showDeleted != nil && *showDeleted {
		includeDeleted = true
	}
	return users.List(includeDeleted)
}

// User is the resolver for the user field.
func (r *queryResolver) User(ctx context.Context, id *int, username *string) (*model.User, error) {
	panic(fmt.Errorf("not implemented: User - user"))
}

// Streams is the resolver for the streams field.
func (r *queryResolver) Streams(ctx context.Context) ([]*model.Stream, error) {
	_, err := auth.FromContext(ctx, auth.ROLE_OPERATOR)
	if err != nil {
		log.Printf("error authorizing user: %s", err)
		return nil, err
	}

	return streams.List()
}

// Stream is the resolver for the stream field.
func (r *queryResolver) Stream(ctx context.Context, id *int, slug *string) (*model.Stream, error) {
	_, err := auth.FromContext(ctx, auth.ROLE_OPERATOR)
	if err != nil {
		log.Printf("error authorizing user: %s", err)
		return nil, err
	}

	if id != nil {
		return streams.GetByID(*id)
	}

	if slug != nil {
		return streams.GetBySlug(*slug)
	}

	return nil, gqlerror.Wrap(fmt.Errorf("id or slug required"))
}

// Stream is the resolver for the Stream field.
func (r *subscriptionResolver) Stream(ctx context.Context, id *int, slug *string) (<-chan *model.Stream, error) {
	if id == nil && slug != nil {
		stream, err := streams.GetBySlug(*slug)
		if err != nil {
			return nil, gqlerror.Wrap(err)
		}

		id = &stream.ID
	}

	return streams.Watch(*id, ctx)
}

// Mutation returns graph.MutationResolver implementation.
func (r *Resolver) Mutation() graph.MutationResolver { return &mutationResolver{r} }

// Query returns graph.QueryResolver implementation.
func (r *Resolver) Query() graph.QueryResolver { return &queryResolver{r} }

// Subscription returns graph.SubscriptionResolver implementation.
func (r *Resolver) Subscription() graph.SubscriptionResolver { return &subscriptionResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
type subscriptionResolver struct{ *Resolver }
