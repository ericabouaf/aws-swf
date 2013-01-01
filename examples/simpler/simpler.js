

sleep({
   name: 'step1'
}, { 
   input: {
      delay: 2000
   }
});


sum({
   name: 'step2'
}, {
  input: {
      a: 4,
      b: 6
  }
});

echo({
   name: 'step3',
   after: {
      step1: COMPLETED,
      step2: COMPLETED
   }
}, {
  input: function() {
      var r = results('step2');
      return {
         resultat: r
      };
  }
});


stop({
   after: {
      step3: COMPLETED
   }
}, 'Everything is good !');
