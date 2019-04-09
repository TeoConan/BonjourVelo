console.log('Script form');

/* Form */

//Liste des object des questions
var questionsList = [];
//Adresse de récupération des données
//	Note : le JSON peut être généré par du PHP
var questionsURL = 'http://localhost/bonjourvelo/front/js/questions.json';

//Liste des object HTML utile
var hud = {
	"globalForm"	: $('#bjvForm'),
	"title"			: $('#formTitle'),
	"type"			: $('#formType'),
	"description"	: $('#formDescr'),
	"confirm"		: $('#formConfirm'),	//Button de confirmation de la question
	"choiceList"	: $('#choiceList'),
	"stepBack"		: $('#formStepBack')	//Button de retour en arrière
};


//Instance de la requête pour le JSON
var request = new XMLHttpRequest();
request.open('GET', questionsURL);
request.responseType = 'json';
request.send();
request.onload = function() {
  questions = request.response;
  initForm(questions);
}



//Première fonction appelée pour instancé le formulaire
//Appelé par ligne 31
function initForm(questions) {
	console.log(Object.keys(questions.questions).length, "Lengh");
	for(var i = 0; i < Object.keys(questions.questions).length; i++) {
		//Instance de la totalité des questions du JSON via l'objet questionForm
		questionsList.push(new questionForm(questions.questions[i]));
	}

	//console.log("Forms", questionsList);

	//Affichage de la première question
	questionsList[0].displayQuestion();


	//Dynamisation des button "c-toggle-button" dans les cartes de choix
	initButtonToggle();
}

/*

Question

*/


/*
	Exemple

	var jsonQuestion = 
		{
			"position": 1,
			"question": "Que voulez-vous faire avec votre vélo ?",
			"subText": "Loem ipsum dolor sit amet",
			"type": "radio",
			"display": "card",
			"additionnalClass" : "",
			"canSkip": false,
			"minChoices": 1,
			"clientChoice": null,
			"choices": [
				{
					"position": 1,
					"icon": "res/icons/cityscape.svg",
					"text": "Me déplacer",
					"additionnalClass" : "",
					"subText": "Lorem ipsum dolor sit amet,",
					"textButton": "default"
				},
				{
					"position": 2,
					"icon": "res/icons/river.svg",
					"text": "Me balader",
					"subText": "Lorem ipsum dolor sit amet,"
				},
				{
					"position": 3,
					"icon": "res/icons/soccer-player.svg",
					"text": "Faire du sport",
					"subText": "Lorem ipsum dolor sit amet,"
				},
				{
					"position": 4,
					"icon": "res/icons/beach.svg",
					"text": "Voyager",
					"subText": "Lorem ipsum dolor sit amet,"
				}
			]
		}

	var questionObj = new questionForm(jsonQuestion);

	//Array des choix sous forme d'objet
	var choices = questionObj.choices;

	//Afficher la question
	questionObj.displayQuestion();
*/

//Objet des choix
/*
	Cet objet stocke les informations concernant les choix, tel que l'icône,
	le nom du choix, son statut (selectionné ou non)...
*/
function choiceForm(choice, parent) {
	this.typeObject = "FORM.QUESTION.CHOICE";
	this.parent = parent;
	this.position = choice.position;
	this.text = choice.text;
	this.additionnalClass = choice.additionnalClass;
	this.icon = choice.icon;
	this.subText = choice.subText;
	this.textButton = choice.textButton;
	this.clientChoice = false;
	this.html = "";

	//console.log('New choice : ', choice);

	//Build HTLM choice card
	this.buildCard = function() {
		//console.log('Build card for choice "' + this.text + '"');
		let output = '<li class="choice-card';

		if (this.additionnalClass) {
			output += " " + this.additionnalClass;
		}

		output += '"><div class="mdc-card c-card--preset-3">';

		if (this.icon) {
			output += '<img class="card-image" src="' + '../' + this.icon + '"/>';
		}

		if (this.text) {
			output += '<h4 class="card-title">' + this.text +  '</h4>';
		}

		if (this.subText) {
			output += '<p class="card-subtitle">' + this.subText + '</p>';
		}

		output += '<button class="c-toggle-button no-ripple c-card-button material-icons mdc-elevation--z3 mdc-button" id="formChoice' + this.position + '">';

		if (this.textButton && this.textButton != "default") {
			output += this.textButton;
		} else {
			output += "Confirmer";
		}

		output += '</button></div></li>';

		this.html = output;
		return(this.html);
	}

	//Listeners on action buttons
	//[todo]
	this.listen = function() {
		//Selection des button des cartes de choix
		$('#formChoice' + this.position).click({choiceObj: this}, function(){
			//Si le bouton est checké, alors stocker l'information
			if ($('#formChoice' + this.position).attr("checked")) {
				choiceObj.clientChoice = false;
			} else {
				choiceObj.clientChoice = true;
			}
		});
	}
}

//Objet des questions
/*
	Cet objet stocke les informations relative à la question, tel que le
	titre, le type mais aussi les choix
	Cependant les choix sont aussi de leurs côtés des objets (ligne 61)
*/

function questionForm (objQuestion) {
	this.typeObject = "FORM.QUESTION";
	this.position = objQuestion.position;
	this.type = objQuestion.type;
	this.title = objQuestion.question;
	this.subText = objQuestion.subText;
	this.additionnalClass = objQuestion.additionnalClass;
	this.canSkip = objQuestion.canSkip;
	this.minChoice = objQuestion.minChoice;
	//Boolean array
	this.clientChoice = objQuestion.clientChoice;
	this.display = objQuestion.display;
	this.choices = objQuestion.choices;

	//Create choices for question
	if (this.choices) {
		var tempChoices = [];

		for(var i = 0; i < this.choices.length; i++) {
			//Instance des différents choix disponible dans la question
			tempChoices.push(new choiceForm(this.choices[i], this));
		}

		this.choices = tempChoices;
	}
	


	//Affichage de la question sur la page, ajout des choix dans le dom
	this.displayQuestion = function() {
		let typeStr = "Question à choix ";

		if (this.type == "checkbox") {
			typeStr += "multiple";
		} else if (this.type == "radio") {
			typeStr += "unique";
		}

		hud['title'].text(this.title);
		hud['type'].text(typeStr);
		hud['description'].text(this.subText);

		//Additionnal class
		if (!this.additionnalClass.trim()) {
			hud['globalForm'].addClass(this.additionnalClass);
		}

		//Add in DOM
		if (this.display == "card") {
			console.log('Display cards form', this.choices);


			for(var i = 0; i < this.choices.length; i++) {
				hud['choiceList'].prepend(
					this.choices[i].buildCard()
					);
				this.choices[i].listen();
			}
		}

		//Skip
		if (!this.canSkip) {
			hud['confirm'].prop('disabled', true);

		}
	}


}



/* Components */
function initButtonToggle() {
	$('.bjv-form .form-choice .c-card-button.c-toggle-button').each(function(){
		$(this).click(function(){
			toggleCardButton(this);
		});
	});
}

function toggleCardButton(button) {
	if ($(button).attr("checked")) {
		uncheckCardButton(button);
	} else {
		checkCardButton(button);
	}
}

function checkCardButton(button) {
	//console.log('Check button ', button);
	$(button).text('check');
	$(button).addClass('c-card-button--checked');
	$(button).addClass('mdc-icon-button');
	$(button).removeClass('mdc-button');
	$(button).addClass('mdc-icon-button--checked');
	$(button).attr('checked', true);
}

function uncheckCardButton(button) {
	//console.log('Uncheck button ', button);
	$(button).text('Confirmer');
	$(button).removeClass('c-card-button--checked');
	$(button).removeClass('mdc-icon-button');
	$(button).addClass('mdc-button');
	$(button).removeClass('mdc-icon-button--checked');
	$(button).attr('checked', false);
}




initButtonToggle();