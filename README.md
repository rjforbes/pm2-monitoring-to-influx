# pm2-monitoring-to-influx
####Send basic pm2 monitoring data to influx db.

This pm2 module send cpu and memory values for every service running in PM2 to influxdb.  This can then be easily displayed in Grafana for basic monitoring with historial data.

To Install as a PM2 Module:
```
pm2 install pm2-monitoring-to-influx
```

Then set the interval to monitor in ms and the influxdb credentials. The influx database should already be created:
```
pm2 set pm2-monitoring-to-influx:interval 1000
pm2 set pm2-monitoring-to-influx:host 'hostname'
pm2 set pm2-monitoring-to-influx:port 8086
pm2 set pm2-monitoring-to-influx:username 'user'
pm2 set pm2-monitoring-to-influx:password 'pass'
pm2 set pm2-monitoring-to-influx:database 'pm2-monitoring'
```
Then enable the service after configuration is set.
```
pm2 set pm2-monitoring-to-influx:enabled true
```
