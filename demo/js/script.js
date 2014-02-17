var but = document.getElementById('but');

ES.add(['s1', 's2', 's3']);

ES.on({node: but, event: 'click', space: ['s1', 's2']}, function(){alert('s1 o s2');});
ES.on({node: but, event: 'click', space: ['s3']}, function(){alert('s3');});

ES.set('s1');