# pinterest-clone-backend

Backend API for Pinterest Clone
Created by using ExpressJs and Amazon Web Services(DynamoDB, S3 bucket)

## Users API

### GET /users

Get list of the users (needs authentication)

### GET /users/:user_id

Get details of the user (needs authentication)

### POST /users/register

User's registration

### POST /users/login

User's login

## Images API

### GET /images

Get all images (needs authenticate)

### GET /images/:image_id

Get image by id (needs authenticate)

### POST /images

Upload image to the bucket(S3) and the database(DynamoDB) (needs authenticate)

### DELETE /images/:image_id

Delete image from the bucket(S3) and the database(DynamoDB) (needs authenticate)

## Lists API

### GET /lists

Get all lists (needs authenticate)

### GET /lists/:list_name

Get list by list name (needs authenticate)

### POST /lists

Add image to the list, if list is not existed will create it (needs authenticate)

### PUT /lists/remove_from

Remove image from the list (needs authenticate)

### DELETE /lists/:list_name

Delete entire list (needs authenticate)
