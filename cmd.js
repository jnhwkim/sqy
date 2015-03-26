var moment     = require('moment');
var mongoose   = require( 'mongoose' );
var HJX        = mongoose.model( 'HJX' );
var Settings   = mongoose.model( 'Settings' );
var Allocation = mongoose.model( 'Allocation' );
var statistics = require('./statistics');

module.exports = {
  update_settings: function ( req, res, next ) {
    var PRESET = [[1,2,3,4],[4,1,2,3],[3,4,1,2],[2,3,4,1],[1,3,2,4],[1,4,2,3]];
    var _type = 0;
    Allocation.remove().exec();
    for (i = 1; i <= req.body.numParticipants; i++) {
      if (0 == (i-1) % PRESET.length) {
        seed = Math.floor(Math.random() * PRESET.length);
        _type = _type % 2 + 1;
      } else {
        seed = (seed + 1) % PRESET.length;
      }
      var allocation = new Allocation({
        pid: i,
        type: _type,
        testset: PRESET[seed],
        updated_at: Date.now()
      })
      allocation.save( function ( err ){
        if (err) res.send( '{success: false}' );
      });
    }
    var settings = new Settings({
      numParticipants: req.body.numParticipants,
      numStimuli: parseInt(req.body.numStimuli),
      duration: parseInt(req.body.duration),
      timeset: parseInt(req.body.timeset),
      timeshift: parseInt(req.body.timeshift),
      updated_at : Date.now()
    });
    settings.save( function ( err ){
      if(!err){
        res.writeHead(302, {'Location': '/settings'});
        res.end();
      } else res.send( '{success: false}' );
    });
  },
  export_answers_csv: function ( req, res, next ) {
    HJX.aggregate([ 
      { $sort: { pid: -1, stimulus: -1, updated_at: -1 }}, {$group: { _id: { pid: "$pid", stimulus: "$stimulus"}, 
                 type: { $first: "$type" }, 
                 step: { $first: "$step" }, 
             question: { $first: "$question" }, 
              answer1: { $first: "$answer1"},
              answer2: { $first: "$answer2"},
           updated_at: { $first: "$updated_at"}}}]).exec(function(err, hjxes){
      res.writeHead(200, {'Content-Type':'text/csv', 'pragma':'public'});
      fields = ['pid', 'type', 'step', 'question', 'stimulus', 'answer1', 'answer2', 'updated_at'];
      res.write(fields.join(', ') + '\n');
      hjxes.forEach(function(hjx, i){
        var values = [];
        fields.forEach(function(field, j){
          if ('pid' == field || 'stimulus' == field)
            var value = hjx['_id'][field];
          else
            var value = hjx[field];
          if (value instanceof Date)
            values.push(moment(value).format('YYYY-MM-DD hh:mm:ss'));
          else
            values.push(value);
        });
        res.write(values.join(', ') + '\n');
      });
      res.end();
    });
  },
  export_switches_csv: function ( req, res, next ) {
    //HJX.find({type: 2})
    HJX.find() //test
       .sort({ pid: 1, step: 1, updated_at: 1})
       .exec(function(err, hjxes){
      res.writeHead(200, {'Content-Type':'text/csv', 'pragma':'public'});
      var logs = {};
      hjxes.forEach(function(hjx, i){
        var key = hjx.pid + '|' + hjx.step;
        if (!logs[key]) logs[key] = {updated_at:[], elapse:[]};
        var l = logs[key]['elapse'].length;
        if (0 < l)
          var elapse = hjx.updated_at.getTime() - logs[key]['updated_at'][l-1].getTime();
        else
          var elapse = 0;
        logs[key]['type'] = hjx.type;
        logs[key]['updated_at'].push(hjx.updated_at);
        logs[key]['elapse'].push(Math.round(elapse / 1000));
      });
      fields = ['pid', 'type', 'step', 'mean', 'std', 'raw'];
      res.write(fields.join(', ') + '\n');
      Object.keys(logs).forEach(function(key, i){
        var pid = key.split('|')[0];
        var type = logs[key]['type'];
        var step = key.split('|')[1];
        var elapse = logs[key]['elapse'];
        elapse.shift(); // remove start 0
        var mean = statistics.mean(logs[key]['elapse']);
        var std = statistics.std(logs[key]['elapse']);
        var values = [pid, type, step, mean, std, elapse];
        res.write(values.join(', ') + '\n');
      });
      res.end();
    });
  },
  reset: function ( req, res, next ) {
    HJX.remove().exec();
    Settings.remove().exec();
    Allocation.remove().exec();
    res.writeHead(302, {'Location': '/settings'});
    res.end();
  }
};





