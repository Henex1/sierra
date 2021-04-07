#!/bin/bash
## This script will download the icecat product datasource and load it into
## Elasticsearch. You can override the URL with ELASTICSEARCH_URL (must include
## an index name).

if [ "$1" = "--help" ]; then
    grep -e '^##' "$0"
    exit
fi

ELASTICSEARCH_URL="${ELASTICSEARCH_URL:-http://localhost:9200/icecat}"
BATCH_SIZE=1000

read_n_lines() {
    set +x
    read -r line || return 1
    echo "$line"
    n=$(($1 - 1))
    while [[ $n -gt 0 ]] && read -r line; do
        echo "$line"
        n=$((n-1))
    done
    set -x
}

set -ueo pipefail

curl -fsSLX PUT $ELASTICSEARCH_URL -H 'Content-Type: application/json' --data-binary '{
    "settings": {
        "index.mapping.total_fields.limit": 20000,
        "index.number_of_replicas": 0
    },
    "mappings": {
        "properties": {
            "attrs": { "type": "object", "enabled": false }
        }
    }
}'

wget --continue https://querqy.org/datasets/icecat/icecat-products-150k-20200809.tar.gz -O icecat-products.tar.gz
count=0
echo "Importing docs"
printf "% 6d / % 6d" 0 150000
tar xzf icecat-products.tar.gz --to-stdout | \
    jq -rc '.[] | ({"index":{"_id":.id}} | @json) + "\n" + (@json)' | \
    while lines=$(read_n_lines $((BATCH_SIZE * 2))); do
        echo "$lines" | curl -fsSLX POST $ELASTICSEARCH_URL/_bulk --data-binary @- -H 'Content-Type: application/x-ndjson' >/dev/null
        count=$((count + BATCH_SIZE))
        printf "\r% 6d / % 6d" $count 150000
    done
echo
echo
echo "Import finished and apparently didn't fail!"

rm -f icecat-products.tar.gz
