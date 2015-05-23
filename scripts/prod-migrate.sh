set -e

curl -XDELETE $ESURL
curl -XPUT $ESURL -d @index.json
esindexdump $ESURLPROD > tmp.ldj
curl -XPOST $ESURL/_bulk --data-binary @tmp.ldj
node migrations/000-public-not-active.js
curl -XPOST $ESURL/_bulk --data-binary @migrations/001-first-users.ldj
