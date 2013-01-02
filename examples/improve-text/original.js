
var text = ""

for (var i = 0; i < 5; i++) {
    // improve text
    var hitId = createImproveHIT(text, 0.02)
    var hit = mturk.waitForHIT(hitId)
    
    var newText = hit.assignments[0].answer.newText
    print("-------------------")
    print(newText)
    print("-------------------")
    
    // verify improvement
    if (vote(text, newText, 0.01)) {
        text = newText
        mturk.approveAssignment(hit.assignments[0])
        print("\nvote = keep\n")
    } else {
        mturk.rejectAssignment(hit.assignments[0])
        print("\nvote = reject\n")
    }    
}


function createImproveHIT(oldText, improveCost) {
    default xml namespace = "http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2005-10-01/QuestionForm.xsd";
    var q = <QuestionForm>
        <Question>
            <QuestionIdentifier>newText</QuestionIdentifier>
            <IsRequired>true</IsRequired>
            <QuestionContent>
                <FormattedContent><![CDATA[
<ul>
<li>Please improve the description for this image.</li>
<li>People will vote whether to approve your work.</li>
</ul>
<img src="http://groups.csail.mit.edu/uid/turkit/www/nut_people.jpg" alt="description not available"></img>
]]></FormattedContent>
            </QuestionContent>
            <AnswerSpecification>
                <FreeTextAnswer>
                    <Constraints>
                        <Length minLength="2" maxLength="500"></Length>
                        <AnswerFormatRegex regex="\S" errorText="The content cannot be blank."/>
                    </Constraints>
                    <DefaultText>{oldText}</DefaultText>
                    <NumberOfLinesSuggestion>3</NumberOfLinesSuggestion>
                </FreeTextAnswer>
            </AnswerSpecification>
        </Question>
    </QuestionForm>
    
    return mturk.createHIT({title : "Improve Text", desc : "Improve a small paragraph toward a goal.", question : "" + q, reward : improveCost, assignmentDurationInSeconds : 5 * 60})
}


function vote(textA, textB, voteCost) {
    default xml namespace = "http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2005-10-01/QuestionForm.xsd";
    var q = <QuestionForm>
        <Question>
            <QuestionIdentifier>vote</QuestionIdentifier>
            <IsRequired>true</IsRequired>
            <QuestionContent>
                <FormattedContent><![CDATA[
<ul>
<li>Please select the better description for this image.</li>
</ul>
<img src="http://groups.csail.mit.edu/uid/turkit/www/nut_people.jpg" alt="description not available"></img>
]]></FormattedContent>
            </QuestionContent>
            <AnswerSpecification>
                <SelectionAnswer>
                    <Selections>
                    </Selections>
                </SelectionAnswer>
            </AnswerSpecification>
        </Question>
    </QuestionForm>

    var options = [{key:"a",value:textA}, {key:"b",value:textB}]
    shuffle(options)
    foreach(options, function (op) {
        default xml namespace = "http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2005-10-01/QuestionForm.xsd";
        q.Question.AnswerSpecification.SelectionAnswer.Selections.Selection +=
            <Selection>
                <SelectionIdentifier>{op.key}</SelectionIdentifier>
                <Text>{op.value}</Text>
            </Selection>
    })
    var voteHitId = mturk.createHIT({title : "Vote on Text Improvement", desc : "Decide which two small paragraphs is closer to a goal.", question : "" + q,  reward : voteCost, maxAssignments : 2})
    var voteResults = mturk.vote(voteHitId, function (answer) {return answer.vote[0]})
    return voteResults.bestOption == "b"
}