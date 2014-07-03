var convertLetterToNumber = function(text){
	var text = text.toLowerCase();
	var length = text.length;
	var arrLetter = ['a','b','c','d','e','g','h','g','h'];
	var score = '';
	for(var i=0; i < length; i++){
		for(var j=0; j < arrLetter.length; j++){
			if(text[i] === arrLetter[j]){
				score += j;
			}
		}
	}
	
	return parseInt(score);	
}

module.exports = convertLetterToNumber;