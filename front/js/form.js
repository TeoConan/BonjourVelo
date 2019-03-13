console.log('Script form');

/* Components */
$('.bjv-form .form-choice .c-card-button.c-toggle-button').each(function(){
	$(this).click(function(){
		toggleCardButton(this);
	});
});


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


/* Form */

var questions = [];
var questionsURL = 'http://localhost/bonjourvelo/front/js/questions.json';
var progressQuestion = 1;

var hud = {
	"globalForm"	: $('#bjvForm'),
	"title"			: $('#formTitle'),
	"type"			: $('#formType'),
	"description"	: $('#formDescr'),
	"confirm"		: $('#formConfirm'),
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


console.log("end");

function initForm(questions) {
	console.log(questions, "questions");
	console.log(Object.keys(questions.questions).length, "Lengh");
	for(var i = 0; i < Object.keys(questions.questions).length; i++) {
		questions.push(new questionForm(questions[i]));
	}
}

function questionForm (objQuestion) {
	console.log(objQuestion, "New object");
	this.position = this.objQuestion.position;
	this.type = this.objQuestion.type;
	this.title = this.this.objQuestion.question;
	this.subText = this.objQuestion.subText;
	this.additionnalClass = this.objQuestion.additionnalClass;
	this.canSkip = this.objQuestion.canSkip;
	this.minChoice = this.objQuestion.minChoice;
	this.clientChoice = this.objQuestion.clientChoice;
	this.display = this.objQuestion.display;
	this.choices = {};



	this.displayQuestion = function(question) {
		console.log('Display question ' + index);
		console.log(Object.keys(questions).length);
		question = null;

		//Search question
		console.log(questions, "questions");
		console.log(questions.lengh, "Lengh");
		for(var i = 0; i < Object.keys(questions.questions).length; i++) {
			console.log('Position ' + questions.questions[i].position);
			if (questions.questions[i].position == index) {
				question = questions.questions[i];
				break;
			}
		}

		let type = "Question à choix ";

		if (question.type == "checkbox") {
			type += "multiple";
		} else if (question.type == "radio") {
			type += "unique";
		}

		hud['title'].text(question.question);
		hud['type'].text(type);
		hud['description'].text(question.subText);

		//Additionnal class
		if (!question.additionnalClass.trim()) {
			hud['globalForm'].addClass(question.additionnalClass);
		}

		//Skip
		if (!question.canSkip) {
			hud['confirm'].prop('disabled', true);
		}

		console.log(question);
	}


}

function choiceForm(choice) {
	this.position = choice.position;
	this.text = choice.text;
	this.additionnalClass = choice.additionnalClass;
	this.icon = choice.icon;
	this.subText = choice.subText;
	this.textButton = choice.textButton;

	this.buildCard = function() {

	}
}
