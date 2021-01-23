//my global variables
var user;
var lastCard = null;
var lastCardClicked;
var guesses = 0;
var matches=0;
var level = 4;
var blockClick = false;


//on ready function
$(function(){

	user = window.prompt("Please Enter your Name (if you dont enter anything it will be set to default): ");
	if(user === "")
	{
		user = "default";
	}
	//doing the post request by calling the postIt function
	postIt(user);

});
//post function
function postIt(user){
		$.ajax({
			method:"Post",
			url:"/memory/intro",
			data: JSON.stringify({'username':user, 'level' : level}),
			success: displayGameBoard,
			dataType:'json'
	});
}
//displays the game board by appending tiles on the gameboard
function displayGameBoard(data){
	level= data.level;

	if(level >= 10){
		level = 10;
	}

	$("#gameboard").empty();
	for(var i = 0; i < data.level; i++){
		var row = $("<tr></tr>")
		for (var j = 0; j < data.level; j++){
			var div = $("<div class='cardDown' data-row='"+i+"' data-col= "+j+" data-value ="+false+" ></div>");
			div.click(selectedCard);
			row.append(div);			
		}

		$("#gameboard").append(row);
	}
}

//Name: selectedCard
 //Purpose:looks at the selected card and call the flipcard function
function selectedCard(){

	var cardSelected = $(this);
	$.ajax({
			method:"GET",
			url:"/memory/card",
			data: {'username':user, 'row':cardSelected.data('row'), 'col':cardSelected.data('col')},
			success: function(data) {
			flipCard(cardSelected, data)
			},
			dataType:'json'
	});
}

function flipCard(cardSelected, data){
	//checks if selected card has value of true
	if(cardSelected.data('value') === true){

		return;
	}
	//initializes the first card
	if((lastCard === undefined || lastCard === null)){
		lastCard = cardSelected;
		lastCard.attr("class", "cardUp");
		lastCard.append("<span>" + data + "</span>");
		cardSelected.data('value', true);
		valueOfLastCard = data;
		$("div.cardUp").css({"transform-style": "preserve-3d", "transition": "all 0.5s linear"});

		return;
	}

	////checks if both cards are same
	if((lastCard !== undefined || lastCard !== null) && (cardSelected.data('value') === false) && blockClick == false) {

		cardSelected.attr("class", "cardUp");
		cardSelected.append("<span>" + data + "</span>");
		cardSelected.data('value', true);
		$("div.cardUp").css({"transform-style": "preserve-3d", "transition": "all 0.5s linear"});
		blockClick = true;



		if(valueOfLastCard === data){
			lastCard = undefined;
			valueOfLastCard = undefined;
			blockClick = false;
			matches++
			guesses++;

		}
		//does the timeout and sets both cards to undefined
		else{
			window.setTimeout(function(){
				lastCard.attr("class", "cardDown");
				lastCard.data('value', false);
				lastCard.find("span").remove();
				lastCard = undefined;
				valueOfLastCard = undefined;
				cardSelected.attr("class", "cardDown");
				cardSelected.data('value', false);
				cardSelected.find("span").remove();
				blockClick = false;
				guesses++;
			},1100)
		
		}
		
	}
	//increases difficulty by asking user if he want to try a harder level
	if(matches == ((level / 2) * level)){
		setTimeout(function(){ 
		window.alert("congratz you won. your number of guesses were " + guesses);

		if (confirm("Would you like to play a harder level? ") == true) {
        	matches = 0;
        	postIt(user);
    } 	else {
        	window.alert("see you later......");
    }

		}, 500);
	}

}
