set -e

esindexdump $ESURL > tmp.ldj
curl -XDELETE $ESURL
curl -XPUT $ESURL -d @index.json
curl -XPOST $ESURL/_bulk --data-binary @tmp.ldj
