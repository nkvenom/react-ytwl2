npm run build
DEST_DIR=../ytwl-deploy/public
mkdir -p $DEST_DIR/static;

cp dist/*.js dist/*.js.map $DEST_DIR/static
cp index.html $DEST_DIR/
cp favicon.ico $DEST_DIR/
cp -R css/ $DEST_DIR/
cp -R img/ $DEST_DIR/
cp client-id-prod.txt $DEST_DIR/client-id.txt
cp src/auth.js $DEST_DIR/src/
cp node_modules/babel-polyfill/dist/polyfill.js $DEST_DIR/extjs/babel-polyfill.js
