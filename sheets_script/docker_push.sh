#!/usr/bin/env bash

echo $CR_PAT | docker login ghcr.io -u USERNAME --password-stdin

BUILDER_NAME="multiarch-builder"

if ! docker buildx inspect $BUILDER_NAME > /dev/null 2>&1; then
  echo "Creating builder multi-architecture..."
  docker buildx create --name $BUILDER_NAME --use
fi

docker buildx use $BUILDER_NAME

docker buildx build --platform linux/amd64 -t lb-sheets-script --load .

docker tag lb-sheets-script ghcr.io/edgarp-dev/lb-sheets-script:latest

docker push ghcr.io/edgarp-dev/lb-sheets-script:latest