
var worker = require('./mturk-createhit').worker;

var config = require('./config');



var task = {

    config: {
         
         taskToken: "1A8B6I45A665V536I3J5HF65SD3F25J5H32Q3D5G9DF8H5G22AQ3XW2VCXB266",
         
        input: JSON.stringify({
            title : 'Extract Information from a Receipt',
            description : 'If the receipt is absolutely unreadable do mark it as unreadable. We will inform the user that he needs to take a better picture./Text',
            reward : 0.02,
            duration: 3600, /* 1 hour*/
            options: {
              keywords: "fitness, health",
              autoApprovalDelayInSeconds: 3600
            },
            questionXML: '<QuestionForm xmlns="http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2005-10-01/QuestionForm.xsd">'+
                        '  <Overview>'+
                        '    <Title>Extract Information from a Receipt</Title>'+
                        '    <Text>If the receipt is absolutely unreadable do mark it as unreadable. We will inform the user that he needs to take a better picture.</Text>'+
                        '    <Binary>'+
                        '      <MimeType>'+
                        '        <Type>image</Type>'+
                        '        <SubType>gif</SubType>'+
                        '      </MimeType>'+
                        '      <DataURL>http://www.act1.net/screens/ReceiptPage.gif</DataURL>'+
                        '      <AltText>Receipt image</AltText>'+
                        '    </Binary>'+
                        '  </Overview>'+

                        '  <Question>'+
                        '    <QuestionIdentifier>amount</QuestionIdentifier>'+
                        '    <DisplayName>Total Amount</DisplayName>'+
                        '    <IsRequired>true</IsRequired>'+
                        '    <QuestionContent>'+
                        '      <Text>Total amount for the receipt, tax and tip included:</Text>'+
                        '    </QuestionContent>'+
                        '    <AnswerSpecification>'+
                        '      <FreeTextAnswer>'+
                        '        <Constraints>'+
                        '          <IsNumeric></IsNumeric>'+
                        '        </Constraints>'+
                        '        <NumberOfLinesSuggestion>1</NumberOfLinesSuggestion>'+
                        '      </FreeTextAnswer>'+
                        '    </AnswerSpecification>'+
                        '  </Question>'+

                        '  <Question>'+
                        '    <QuestionIdentifier>comments</QuestionIdentifier>'+
                        '    <DisplayName>Comments</DisplayName>'+
                        '    <IsRequired>false</IsRequired>'+
                        '    <QuestionContent>'+
                        '      <Text>Please provide any comments you may have below, we appreciate your input!</Text>'+
                        '    </QuestionContent>'+
                        '    <AnswerSpecification>'+
                        '      <FreeTextAnswer></FreeTextAnswer>'+
                        '    </AnswerSpecification>'+
                        '  </Question>'+
                        '</QuestionForm>'
            
        })
    },

    respondCompleted: function (results) {
        console.log("Done !");
        console.log(results);
    }

};

worker(task, config);
