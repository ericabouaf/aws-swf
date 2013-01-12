

schedule({
   name: 'step1',
   activity: 'sleep',
   input: {
      delay: 2000
   }
});


schedule({
   name: 'step2',
   activity: 'sum',
   input: {
      a: 4,
      b: 6
   }
});


schedule({
   name: 'step3',
   activity: 'echo',
   after: {
      step1: COMPLETED,
      step2: COMPLETED
   },
   input: function() {
      var r = results('step2');
      return {
         resultat: r
      };
   }
});


stop({
   result: function() {
      return results('step3').resultat;
   },
   after: {
      step3: COMPLETED
   }
});
