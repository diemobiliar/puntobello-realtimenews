#!/usr/bin/env bash
set -euo pipefail

: "${TK_NAME_ID:?Missing TK_NAME_ID environment variable}"
: "${DEPLOY_STAGE:?Missing DEPLOY_STAGE environment variable}"

RG="${TK_NAME_ID}-${DEPLOY_STAGE}-rg"

VNET_NAME=example-vnet

if az network vnet show -g "${RG}" -n "${VNET_NAME}" -o none ; then
  echo "✅ Virtual network exists: ${VNET_NAME}"
else
  echo "❌ Virtual network does not exist:  ${VNET_NAME}"
  exit 1
fi
