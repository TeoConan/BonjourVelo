console.log('Script form');


/* Form */

var questionsList = [];
var questionsURL = 'http://localhost/bonjourvelo/front/js/questions.json';
var progressQuestion = 1;

var hud = {
	"globalForm"	: $('#bjvForm'),
	"title"			: $('#formTitle'),
	"type"			: $('#formType'),
	"description"	: $('#formDescr'),
	"confirm"		: $('#formConfirm'),
	"choiceList"	: $('#choiceList'),
	"stepBack"		: $('#formStepBack')
};

var request = new XMLHttpRequest();
request.open('GET', questionsURL);
request.responseType = 'json';
request.send();
request.onload = function() {
  questions = request.response;
  initForm(questions);
}


function initForm(questions) {
	console.log(Object.keys(questions.questions).length, "Lengh");
	for(var i = 0; i < Object.keys(questions.questions).length; i++) {
		questionsList.push(new questionForm(questions.questions[i]));
	}

	//console.log("Forms", questionsList);

	//Display first question
	questionsList[0].displayQuestion();


	initButtonToggle();
}

function choiceForm(choice, parent) {
	this.typeObject = "FORM.QUESTION.CHOICE";
	this.parent = parent;
	this.position = choice.position;
	this.text = choice.text;
	this.additionnalClass = choice.additionnalClass;
	this.icon = choice.icon;
	this.subText = choice.subText;
	this.textButton = choice.textButton;
	this.clientChoice = [];
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
	//à faire
	this.listen = function() {
		var that = this;

		$('#formChoice' + this.position).click(function(){
			if ($('#formChoice' + this.position).attr("checked")) {
				that.clientChoice[this.position] = false;
			} else {
				that.clientChoice[this.position] = true;
			}
		});
	}
}


function questionForm (objQuestion) {
	this.typeObject = "FORM.QUESTION";
	this.position = objQuestion.position;
	this.type = objQuestion.type;
	this.title = objQuestion.question;
	this.subText = objQuestion.subText;
	this.additionnalClass = objQuestion.additionnalClass;
	this.canSkip = objQuestion.canSkip;
	this.minChoice = objQuestion.minChoice;
	this.clientChoice = objQuestion.clientChoice;
	this.display = objQuestion.display;
	this.choices = objQuestion.choices;

	//Create choices for question
	if (this.choices) {
		var tempChoices = [];

		for(var i = 0; i < this.choices.length; i++) {
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