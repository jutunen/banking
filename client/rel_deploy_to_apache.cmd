USERNAME=ubuntu
KEYFILE=~/avvaimet.pem
SERVER=
PORT=22
SERVER_DIR=/var/www/loremipsum
FILENAME=build.tar

rm $FILENAME
tar cvf $FILENAME build/

if [ -z "$KEYFILE" ]; then
echo "Keyfile not defined, using default"
echo "REMOVING *.txt *.json *.tar *.html *.js from $SERVER_DIR"
ssh -p $PORT $USERNAME@$SERVER "cd $SERVER_DIR && rm -rf static && rm *.txt *.json *.tar *.html *.js"
scp -P $PORT $FILENAME $USERNAME@$SERVER:$SERVER_DIR
ssh -p $PORT $USERNAME@$SERVER "cd $SERVER_DIR && tar xvf $FILENAME --strip-components 1"
else
echo "Using keyfile $KEYFILE"
echo "REMOVING *.txt *.json *.tar *.html *.js from $SERVER_DIR"
ssh -i $KEYFILE -p $PORT $USERNAME@$SERVER "cd $SERVER_DIR && rm -rf static && rm *.txt *.json *.tar *.html *.js"
scp -i $KEYFILE -P $PORT $FILENAME $USERNAME@$SERVER:$SERVER_DIR
ssh -i $KEYFILE -p $PORT $USERNAME@$SERVER "cd $SERVER_DIR && tar xvf $FILENAME --strip-components 1"
fi
