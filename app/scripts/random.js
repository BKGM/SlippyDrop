module.exports = function(min, max){
	return Math.floor(min + Math.random()*(max-min));
}