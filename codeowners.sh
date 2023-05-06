CONTAINER_NAME=codeowners-codeowners-1
CONTAINER_APP_DIR=/codeowners
PARENT_PATH=$PWD
cd tools/codeowners
CODEOWNERS_TOOL_PATH=$PWD
docker-compose build
docker-compose -p codeowners up -d
cd $PARENT_PATH
docker cp . $CONTAINER_NAME:$CONTAINER_APP_DIR
cd $CODEOWNERS_TOOL_PATH
docker-compose exec codeowners npm install
docker-compose exec codeowners node index.js audit -r /codeowners -u
docker cp $CONTAINER_NAME:/codeowners/codeowner-audit .
docker-compose down
