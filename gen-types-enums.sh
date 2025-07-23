#!/bin/bash

# Shell script wrapper for gen-types-enums-psql-schema

if [ $# -eq 0 ]; then
  echo "Usage: $0 <schema_name|--all> [flags]"
  exit 1
fi

# Forward all arguments to the CLI
DATABASE_URL="$DATABASE_URL" npx gen-types-enums-psql-schema "$@" 