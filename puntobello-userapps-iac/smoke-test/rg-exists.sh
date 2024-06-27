#!/usr/bin/env bash
set -euo pipefail

: "${TK_NAME_ID:?Missing TK_NAME_ID environment variable}"
: "${DEPLOY_STAGE:?Missing DEPLOY_STAGE environment variable}"

RG="${TK_NAME_ID}-${DEPLOY_STAGE}-rg"

if az group show -n "${RG}" -o none; then
  echo "✅ Resource group exists: ${RG}"
else
  echo "❌ Resource group does not exist: ${RG}"
  exit 1
fi
