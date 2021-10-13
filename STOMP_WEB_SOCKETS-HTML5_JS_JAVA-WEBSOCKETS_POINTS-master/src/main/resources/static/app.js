var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
	var dibujoID = null;

	var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };

	var addPolygonToCanvas = function (points) {
		let c2 = canvas.getContext('2d');
		let init = false;

		c2.fillStyle = '#f00';
        c2.beginPath();
        points.map(function (value, index ){
			if (!init){
				c2.moveTo(value.x,value.y);
				init = true;
			} else {
				c2.lineTo(value.x,value.y);
			}
        });
		c2.closePath();
		c2.fill();
	};


    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function (dibujoID) {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint/'+dibujoID, function (eventbody) {
                let jsonObj = JSON.parse(eventbody.body);
				//alert("Coordenadas recibidas: "+jsonObj.x+", "+jsonObj.y);   -> Parte 1
				addPointToCanvas(new Point(jsonObj.x, jsonObj.y));
            });
			stompClient.subscribe('/topic/newpolygon/'+dibujoID, function (eventbody){
				addPolygonToCanvas(JSON.parse(eventbody.body));
			});
        });

    };



    return {

        init: function () {
            var can = document.getElementById("canvas");
			dibujoID = parseInt(document.getElementById("dibujoID").value);
            if (isNaN(dibujoID)){
				alert("El valor debe ser un número");
			} else {
            	//websocket connection
				alert("conectado a dibujo #"+dibujoID);
				can.getContext('2d').clearRect(0, 0, 800, 600);
            	connectAndSubscribe(dibujoID);
			}
        },

        publishPoint: function(px,py){
			if (dibujoID == null) {
				alert("¡Conectese a un dibujo primero!");
			} else {
	            var pt=new Point(px,py);
	            console.info("publishing point at "+pt);

	            //publicar el evento
				//stompClient.send("/topic/newpoint/"+dibujoID, {}, JSON.stringify(pt)); -> PARTE 3
				stompClient.send("/app/newpoint/"+dibujoID, {}, JSON.stringify(pt));
			}
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();