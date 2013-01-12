/*global mturk,workflow_input,results,stop,COMPLETED*/

// swf-start improve-text  "{\"text_to_improve\":\"this is a test\"}"

////////////
// Helpers
////////////

function improveHitResult(i) {
   return (i === -1) ? workflow_input().text_to_improve : results('improve-hit-'+i).results[0].QuestionFormAnswers.Answer.FreeText;
}

function improveHit(i) {
  return function() {

        var text_to_improve;

        if(i === 0) {
          text_to_improve = workflow_input().text_to_improve;
        }
        else {
         // "a" or "b"
         var SelectionIdentifier = results('vote-hit-'+(i-1)).results[0].QuestionFormAnswers.Answer.SelectionIdentifier;

         var textA = improveHitResult(i-2);
         var textB = improveHitResult(i-1);

          text_to_improve = (SelectionIdentifier === "a") ? textA : textB;
        }

        return {
          title : "Improve Text",
          description : "Improve a small paragraph toward a goal.",
          reward : 0.02,
          duration : 5 * 60,

          questionXML : '<QuestionForm xmlns="http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2005-10-01/QuestionForm.xsd">'+
                     '<Question>'+
                        '<QuestionIdentifier>newText</QuestionIdentifier>'+
                        '<IsRequired>true</IsRequired>'+
                        '<QuestionContent>'+
                           '<FormattedContent><![CDATA['+
                              '<ul>'+
                                 '<li>Please improve the description for this image.</li>'+
                                 '<li>People will vote whether to approve your work.</li>'+
                              '</ul>'+
                              '<img src="http://groups.csail.mit.edu/uid/turkit/www/nut_people.jpg" alt="description not available"></img>'+
                           ']]></FormattedContent>'+
                        '</QuestionContent>'+
                        '<AnswerSpecification>'+
                           '<FreeTextAnswer>'+
                              '<Constraints>'+
                                 '<Length minLength="2" maxLength="500"></Length>'+
                                 '<AnswerFormatRegex regex="\\S" errorText="The content cannot be blank."/>'+
                              '</Constraints>'+
                              '<DefaultText>'+text_to_improve+'</DefaultText>'+
                              '<NumberOfLinesSuggestion>3</NumberOfLinesSuggestion>'+
                           '</FreeTextAnswer>'+
                        '</AnswerSpecification>'+
                     '</Question>'+
                     '</QuestionForm>'

        };
      };
}

function voteHit(i) {
  return function() {
        var textA = improveHitResult(i-1); // TODO: le vote ne doit pas se faire avec le improve-hit i-1, mais avec le résultat du vote précédent !
        var textB = improveHitResult(i);

        var selections = '<Selection>'+
                           '<SelectionIdentifier>a</SelectionIdentifier>'+
                           '<Text>'+textA+'</Text>'+
                         '</Selection>'+
                         '<Selection>'+
                           '<SelectionIdentifier>b</SelectionIdentifier>'+
                           '<Text>'+textB+'</Text>'+
                         '</Selection>';

        return {
          title : "Vote on Text Improvement",
          description : "Decide which two small paragraphs is closer to a goal.",
          reward : 0.01,
          duration: 3600, /* 1 hour*/
          maxAssignments : 1,

          questionXML : '<QuestionForm xmlns="http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2005-10-01/QuestionForm.xsd">'+
                     '<Question>'+
                        '<QuestionIdentifier>vote</QuestionIdentifier>'+
                        '<IsRequired>true</IsRequired>'+
                        '<QuestionContent>'+
                           '<FormattedContent><![CDATA['+
                              '<ul>'+
                                 '<li>Please select the better description for this image.</li>'+
                              '</ul>'+
                              '<img src="http://groups.csail.mit.edu/uid/turkit/www/nut_people.jpg" alt="description not available"></img>'+
                           ']]></FormattedContent>'+
                        '</QuestionContent>'+
                        '<AnswerSpecification>'+
                        '<SelectionAnswer>'+
                           '<Selections>'+
                           selections+
                           '</Selections>'+
                        '</SelectionAnswer>'+
                        '</AnswerSpecification>'+
                     '</Question>'+
                     '</QuestionForm>'
        };
    };
}


////////////
// Process
////////////

for(var i = 0 ; i < 5 ; i++) {

   // Improve Hit
   schedule({
      name: 'improve-hit-'+i,
      activity: 'mturk_createHit',
      after: (i > 0) ? 'vote-hit-'+(i-1) : [],
      input: improveHit(i)
   }, {
      // No timeout
      heartbeatTimeout: "NONE",
      scheduleToCloseTimeout: "NONE",
      scheduleToStartTimeout: "NONE",
      startToCloseTimeout: "NONE"
   });

   // Vote Hit
   schedule({
      name: 'vote-hit-'+i,
      activity: 'mturk_createHit',
      input: voteHit(i),
      after: 'improve-hit-'+i
   }, {
      // No timeout
      heartbeatTimeout: "NONE",
      scheduleToCloseTimeout: "NONE",
      scheduleToStartTimeout: "NONE",
      startToCloseTimeout: "NONE"
   });

}

stop({
   after: 'vote-hit-4',
   result: 'Everything is good !'
});

