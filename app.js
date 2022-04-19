const pm2 = require('pm2');
const Influx = require('influx');
const os = require('os');
var pmx = require('pmx');

pmx.initModule({

  // Options related to the display style on Keymetrics
  widget : {

    // Logo displayed
    logo : 'https://app.keymetrics.io/img/logo/keymetrics-300.png',

    // Module colors
    // 0 = main element
    // 1 = secondary
    // 2 = main border
    // 3 = secondary border
    theme            : ['#141A1F', '#222222', '#3ff', '#3ff'],

    // Section to show / hide
    el : {
      probes  : true,
      actions : true
    },

    // Main block to show / hide
    block : {
      actions : false,
      issues  : true,
      meta    : true,

      // Custom metrics to put in BIG
      main_probes : ['test-probe']
    }

  }

}, function(err, config) {

  
pm2.connect(function(err) {
    if (err) {
      console.error("PM2 Connect Error" + err);
    } else {
        if(config.enabled){
            console.log('Connecting to InfluxDB.');
      
            infclient = new Influx.InfluxDB({
              host: config.host,
              port: config.port,
              username: config.username,
              password: config.password,
              database: config.database,
              schema: [
                {
                  measurement: 'cpu',
                  fields: {
                    cpu_process_usage: Influx.FieldType.FLOAT
                  },
                  tags: [
                    'host','service'
                  ]
                },
                {
                  measurement: 'memory',
                  fields: {
                    physical: Influx.FieldType.INTEGER
                  },
                  tags: [
                    'host','service'
                  ]
                }
              ]
            });
            console.log('Starting PM2 List Scan.');
            pm2.list(errback);
            setInterval(function() { pm2.list(errback);}, config.interval);
        } else {
            console.log('InfluxDB not enabled. Please configure and enable then restart the service.'); 
        }
    }
  });
  
  function errback(err, resp){
    if (err) {
      console.error("PM2 List Error" + err);
    } else {
        var pointArray = [];
        for (var index = 0; index < resp.length; index++) {
          var element = resp[index];
          //console.log(element);
          var cpu_process_usage = element.monit.cpu;
          var physical = element.monit.memory;
          pointArray.push({
            measurement: 'cpu',
            tags: { host: os.hostname() , service: element.name},
            fields: { cpu_process_usage },
          });
          pointArray.push({
              measurement: 'memory',
              tags: { host: os.hostname() , service: element.name},
              fields: { physical }
           });

        }
        //console.log(pointArray);
        infclient.writePoints(pointArray).catch(err => {
            //console.error(`Error saving data to InfluxDB! ${err.stack}`);
        });
    }
  }


});
