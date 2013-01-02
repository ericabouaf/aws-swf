
////////////
// Helpers
////////////


function improveHit(i) {
  return function() {

        var text_to_improve;

        if(i === 0) {
          text_to_improve = workflow_input().text_to_improve;
        }
        else {
          text_to_improve = results('vote-hit-'+(i-1));
        }

        return {
          title : "Improve Text",
          desc : "Improve a small paragraph toward a goal.",
          question : "" + q,
          reward : improveCost,
          assignmentDurationInSeconds : 5 * 60
        };
      };
}

function voteHit(i) {
  return function() {
        var textA = (i === 0) ?
          workflow_input().text_to_improve :
          results('improve-hit-'+(i-1)).text_to_improve;
        var textB = results('improve-hit-'+i).text_to_improve;

        return {
          title : "Vote on Text Improvement",
          desc : "Decide which two small paragraphs is closer to a goal.",
          question : "" + q,
          reward : voteCost,
          maxAssignments : 2
        };
    };
}


////////////
// Process
////////////

for(var i = 0 ; i < 5 ; i++) {

  // Improve Hit
  var improveHitParams = {
     name: 'improve-hit-'+i
  };
  if (i === 0) {
    improveHitParams.after = 'vote-hit-'+i;
  }
  mturk.hit(improveHitParams, { input: improveHit(i) });


  // Vote Hit
  mturk.hit({
     name: 'vote-hit-'+i,
     after: 'improve-hit-'+i // TODO: handle this in decider-worker.js
  }, {
    input: voteHit(i)
  });


}