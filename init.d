#!/bin/bash
#
# nodejs - Startup script for node.js server
#

#
# Check the root directory
rootdir="/opt/www/poKaifuBot"
server="$rootdir/dist/src/index.js"
nodejs=${NODEJS-/usr/local/bin/node}

script="$(basename $0)"
lockfile="/var/lock/subsys/$script"


ulimit -n 12000
RETVAL=0

do_start()
{
    if [ ! -f "$lockfile" ] ; then
    echo -n $"Starting $server: "
    #runuser -l  -c "nohup $nodejs $server"
    runuser -l  -c "NODE_ENV=production $nodejs $server production"
    RETVAL=$?
        echo
            [ $RETVAL -eq 0 ] && touch "$lockfile"
else
    echo "$server is locked."
    RETVAL=1
    fi
}

do_stop()
{

    echo -n $"Stopping $server: "
    pid=`ps -aefw | grep "$nodejs $server" | grep -v " grep " | awk '{print $2}'`
    kill -9 $pid > /dev/null 2>&1 && echo_success || echo_failure
    RETVAL=$?
        echo
            [ $RETVAL -eq 0 ] && rm -f "$lockfile"

    if [ "$pid" = "" -a -f "$lockfile" ]; then
    rm -f "$lockfile"
    echo "Removed lockfile ( $lockfile )"
    fi
}

do_status()
{
    pid=`ps -aefw | grep "$nodejs $server" | grep -v " grep " | awk '{print $2}'`
    if [ "$pid" != "" ]; then
    echo "$nodejs $server (pid $pid) is running..."
else
    echo "$nodejs $server is stopped"
    fi
}

case "$1" in
start)
do_start
;;
stop)
do_stop
;;
status)
do_status
;;
restart)
do_stop
do_start
RETVAL=$?
;;
*)
echo "Usage: $0 {start|stop|status|restart}"
RETVAL=1
esac

exit $RETVAL