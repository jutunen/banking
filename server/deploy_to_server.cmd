USERNAME=ubuntu
KEYFILE=~/avvaimet.pem
SERVER=ec2-13-48-45-90.eu-north-1.compute.amazonaws.com
PORT=22
SERVER_DIR=/opt/express_server
FILENAME=server.tar
SERVICEFILE=nodeserver.service
SERVICEFILE_DIR=/etc/systemd/system

rm $FILENAME
tar cvf $FILENAME *.js package.json

echo "Stopping the server."
ssh -i $KEYFILE -p $PORT $USERNAME@$SERVER "sudo systemctl stop nodeserver.service"

echo "Removing the server directory and creating it again."
ssh -i $KEYFILE -p $PORT $USERNAME@$SERVER "sudo rm -rf $SERVER_DIR && mkdir -p $SERVER_DIR"

echo "Copying files to server directory."
scp -i $KEYFILE -P $PORT $FILENAME $USERNAME@$SERVER:$SERVER_DIR

echo "Installing the server."
ssh -i $KEYFILE -p $PORT $USERNAME@$SERVER "cd $SERVER_DIR && tar xvf $FILENAME && npm install"

echo "Copying server service file to its destination."
scp -i $KEYFILE -P $PORT $SERVICEFILE $USERNAME@$SERVER:$SERVICEFILE_DIR

echo "Starting the server as service."
ssh -i $KEYFILE -p $PORT $USERNAME@$SERVER "sudo systemctl enable nodeserver.service && sudo systemctl start nodeserver.service"
