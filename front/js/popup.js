/* TOAST */
	function Toast(text){
			this.text = text;
			this.body = $(document.body);
			this.toast = $('.toast');
			this.p = $('.toast > p');
			this.me = this;

			console.log('Toast elem = ');
			console.log(this.toast);
			console.log(this.p);

			this.show = function(){
				this.p.html(this.text);
				this.toast.css('opacity', '1');
			}

			this.hide = function(){
				this.toast.css('opacity', '0');
			}
		}
					/* AFFICHAGE POPUP*/

var loading = false;

		function hide (addr) {
			document.getElementById(addr).style.display = "none" ;
		}
		function show (addr) {
			document.getElementById(addr).style.display = "block" ;
			loading = true;
			
			setTimeout(function(){
				loading = false;
			}, 1000);
		}
		
		
		function toggle () {
			if(!loading){
				if(document.getElementById('popup').style.display == "none") {
					show('popup');
				}else {
					hide('popup');
				}

			}
				
		}
		window.onload = function() { hide ('popup'); };
		
		/*--------------------------------------------------*/
		
					/* FERMER POPUP */
		
		var lienpopup = document.getElementById('linkpopup');
		var body = document.body;
		var popup = document.getElementById('popup');
		var close = document.getElementById('close');

		lienpopup.addEventListener("click", toggle, false);
		close.addEventListener("click", toggle, false);