
    maintimer=0;
    maintimer.active = false;
    hasPressed=new Object();
    hasPressed.left=0;
    hasPressed.right=0;
    playertimer=0;
    playercount=0;
    maincount=0;
        
$(document).ready(function() {

    var IOBoard = BO.IOBoard;
    var IOBoardEvent = BO.IOBoardEvent;
    var LED = BO.io.LED;
    var Button = BO.io.Button;
    var ButtonEvent = BO.io.ButtonEvent;

    // Set to true to print debug messages to console
    BO.enableDebugging = true; 
    
    // If you are not serving this file from the same computer
    // that the Arduino Leonardo board is connected to, replace
    // window.location.hostname with the IP address or hostname
    // of the computer that the Arduino board is connected to.
    var host = window.location.hostname;
    // if the file is opened locally, set the host to "localhost"
	if (window.location.protocol.indexOf("file:") === 0) {
		host = "localhost";
	}
    
    // Variables
    var arduino = new IOBoard(host, 8887); //new IOBoard instance
    var button1; //Player 1
    var button2; //Player 2
    
    //Check if Buzz.js is supported by browser
	if (!buzz.isSupported()) {
    		alert("Your browser is too old, time to update!");
	}    
	var buzzer = new buzz.sound("buzz1.mp3");
	var beep = new buzz.sound("beep.wav");
	var timeup =  new buzz.sound("timeup.mp3");
	buzzer.load();
	beep.load();
	timeup.load();
    
    //TIMER Function
	function mainTimer(max){
		$('#TIME').html(max);
	    beep.play();
	    beep.loop();
		//creating maintimer
		maintimer = $.timer(
			function() {
				maincount++;
				$('#TIME').html(max-maincount);
				if((max-maincount)==0){
					$('#TIME').html("Time's Up!");
					beep.stop();
					timeup.play();
					maintimer.stop()
					maintimer.active=0;
					maincount=0;
				}
			},
			1000,
			false
		);
	
		maintimer.play();
		return false;
	}

	function steal(){
		beep.play();
		if(!hasPressed.left){
		$('#playerstate').html("Steal?");
		button2.addEventListener(ButtonEvent.PRESS, onPress);
        button2.addEventListener(ButtonEvent.RELEASE, onRelease);
		}
		else if(!hasPressed.right){
		$('#playerstate').html("Steal?");		
		button1.addEventListener(ButtonEvent.PRESS, onPress);
        button1.addEventListener(ButtonEvent.RELEASE, onRelease);
		}
		else{
		$('#playerstate').html("Stealing is disabled.");		
		}
	
	}

    //PLAYERTIMERTIMER Function
    function playerTimer(max){
    beep.pause();
	$('#TIME').html(max);
	
	playertimer = $.timer(
		function() {
			playercount++;
			playertimer.active=1;
			$('#TIME').html(max-playercount);		
			if((max-playercount)==0){
				//add steal functionality
				playertimer.stop()
				steal();
				playercount=0;
				if(maintimer.active){
					maintimer.play()
				}
				
				playertimer.active=0;
			}
		},
		1000,
		false
	);
	
	playertimer.play();
	return false;
	}


    // Listen for the IOBoard READY event which indicates the IOBoard
    // is ready to send and receive data
    arduino.addEventListener(IOBoardEvent.READY, onReady);

    function onReady(event) {
        // Remove the event listener because it is no longer needed
        arduino.removeEventListener(IOBoardEvent.READY, onReady);

        // Create a new Button object to interface with the physical
        // button wired to the I/O board
        button1 = new Button(arduino, arduino.getDigitalPin(3));
        button2 = new Button(arduino, arduino.getDigitalPin(2));
        
        // Listen for button press and release events
        button1.addEventListener(ButtonEvent.PRESS, onPress);
        button1.addEventListener(ButtonEvent.RELEASE, onRelease);
        button2.addEventListener(ButtonEvent.PRESS, onPress);
        button2.addEventListener(ButtonEvent.RELEASE, onRelease);
    }
    
    function gameStart(type){
    
	$('#go').attr("disabled", true);

    //check if player input or go button
    if(type=="GO_BUTTON"){
    mainTimer(10);
    maintimer.active=1;
    }
    else if(type=="PLAYER_INPUT"){
    mainTimer(10);
	maintimer.active=1;    
    maintimer.pause();
    playerTimer(5);
    }
    
    //also need to handle "steals"
    
    }
    
    
    //ULTIMATE RESET BUTTON
    function reset(){
        beep.stop();
        if(maintimer.active){
        maintimer.stop()
        }
        if(playertimer.active){
        playertimer.stop()
        }
		playercount=0;
		maincount=0;
		$('#go').attr("disabled", false);
        $('#playerstate').html("The question is being read...");
        $('#TIME').html("");
        //$('#state').html("Display Button State");
	    hasPressed.left=0;
	    hasPressed.right=0;        
        button1.addEventListener(ButtonEvent.PRESS, onPress);
        button1.addEventListener(ButtonEvent.RELEASE, onRelease);
        button2.addEventListener(ButtonEvent.PRESS, onPress);
        button2.addEventListener(ButtonEvent.RELEASE, onRelease);      
        }

	function getPlayer(player){
	var name=0;
        switch(player){
        
        case 2:
        name = "Left"
        hasPressed.left=1;
        break;
        

        case 3:
        name = "Right"
        hasPressed.right=1;
        break;
        }	
	return name;
	
	}

    function onPress(evt) {
        // Get a reference to the target which is the button that 
        // triggered the events
        var btn = evt.target;
        var player;
        
        buzzer.play();
        
        button1.removeEventListener(ButtonEvent.PRESS, onPress);
        button1.removeEventListener(ButtonEvent.RELEASE, onRelease);
        button2.removeEventListener(ButtonEvent.PRESS, onPress);
        button2.removeEventListener(ButtonEvent.RELEASE, onRelease);

		//getPlayerNames
		player=getPlayer(btn.pinNumber);

        
        if (maintimer.active){
        maintimer.pause();
        gameStart("PLAYER_INPUT");
        }
        else{
        gameStart("PLAYER_INPUT");
        }
        
        // Display the state on the page
        $('#playerstate').html("Team " + player + " GO!");
       // $('#state').html("Button " + btn.pinNumber + " state: Pressed");
    }
    

    function onRelease(evt) {
        // Get a reference to the target which is the button that 
        // triggered the event      
        var btn = evt.target;
        // Display the state on the page
        //$('#state').html("Button " + btn.pinNumber + " state: Released");
    }
    
    $('#go').click(function(){
    $('#playerstate').html("Go!");
    gameStart("GO_BUTTON");
    });

    $('#reset').click(function(){
    reset();
    });


});
