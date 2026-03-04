#!/bin/sh
set -eu

replica_id="${REPLICA_ID:-}"

html_escaped_replica_id=$(printf '%s' "$replica_id" | sed 's/&/\&amp;/g; s/"/\&quot;/g; s/</\&lt;/g; s/>/\&gt;/g')
escaped_replica_id=$(printf '%s' "$html_escaped_replica_id" | sed 's/[\/&]/\\&/g')

sed -i "s/__REPLICA_ID__/${escaped_replica_id}/g" /usr/share/nginx/html/index.html
