#!/bin/sh
set -eu

replica_id="${REPLICA_ID:-}"

if [ -z "$replica_id" ]; then
  sed -i 's/ data-replica-id="__REPLICA_ID__"//g' /usr/share/nginx/html/index.html
  exit 0
fi

html_escaped_replica_id=$(printf '%s' "$replica_id" | sed 's/&/\&amp;/g; s/"/\&quot;/g; s/</\&lt;/g; s/>/\&gt;/g')
escaped_replica_id=$(printf '%s' "$html_escaped_replica_id" | sed 's/[\/&]/\\&/g')

sed -i "s/__REPLICA_ID__/${escaped_replica_id}/g" /usr/share/nginx/html/index.html
