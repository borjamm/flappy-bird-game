(() => {
    window.addEventListener('load', () => {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");

        // Se asigna las dimensiones del canvas
        canvas.width = 900; 
        canvas.height = 506;

        // Inicializamos las imágenes
        var bird = new Image();
        var background = new Image();
        var pipeTop = new Image();
        var pipeBottom = new Image();
        var fail = new Image();

        // Se asigna la ruta de cada imagen
        fail.src = "assets/fail.png";
        bird.src = "assets/bird.png";
        background.src = "assets/background.png";
        pipeTop.src = "assets/pipeTop.png";
        pipeBottom.src = "assets/pipeBottom.png";

        // Espacio entre tubos
        var space = 90;

        // Mínima altura de los tubos superiores
        var minHeightPipeTop;

        // Espacio total del tubo superior más el espacio que existe entre los tubos
        var spaceHeight;

        // Posición inicial del personaje
        var birdX = 5; // Posición eje X
        var birdY = 256; // Posición eje Y

        // Gravedad
        var gravity = 1.5;

        // Puntuación actual del personaje
        var score = 0;

        // Puntación de récord
        var record;

        // Se activa cuando se ha acabado la partida
        var endGame = false;

        // Contenedor de tubos
        var pipes = [];

        // Se crea el primer tubo
        pipes[0] = createPipe(0, (canvas.width/2), 0);

        // Tubos donde el personaje se ha chocado
        var pipesFails = [];

        // Se activa si existe un choque contra con un tubo
        var pipeFail = false;

        // Vidas del jugador
        var lifes = 3;
        
        // Escuchamos si el usuario ha pulsado alguna tecla para incrementar la posición
        // del personaje en el eje vertical (eje Y)  
        document.addEventListener("keydown", function () {
            birdY -= 20 ; // Velocidad hacia arriba (EJE Y)
            if(gravity === 0) gravity = 1.5;
        });

        // Método que inicia el juego
        function startGame() {
            getScoreRecord();
            animate();
        }

        // Método para imprimir la imagen de choque durante medio segundo
        function delayDrawFail(){
            if (pipeFail) {
                ctx.drawImage(fail, birdX + 30, birdY + 10, 30, 30);
                setTimeout(function(){ pipeFail = false; }, 500);
            }
        }

        // Método para recoger la puntación de récord
        function getScoreRecord() {
            if (localStorage.getItem('record')) {
                record = localStorage.getItem('record');
            } else {
                record = 0;
            }
        }

        // Método para establecer récord
        function setScoreRecord() {
            var req = localStorage.getItem('record');
            if (req) {
                if (req < score) localStorage.setItem('record', score);
            } else {
                localStorage.setItem('record', 0);
            }
        }

        // Método para crear tubos
        function createPipe(id, x, y) {
            return {
                id : id,
                x : x,
                y : y,
                counted : true,
            };
        }

        function animate(){
            // Establecemos el fondo
            ctx.drawImage(background,0,0);
            
            // Establecemos el límite de alto y bajo de la dimensión del canvas
            if(birdY > (canvas.height - bird.height)) { // Límite inferior
                birdY = canvas.height - bird.height;
                gravity = 0;
            } 

            if (birdY < 0) birdY = 0; // Límite superior
            
            for(var i = 0; i < pipes.length; i++){
                spaceHeight = pipeTop.height+space;
                ctx.drawImage(pipeTop,pipes[i].x,pipes[i].y);
                ctx.drawImage(pipeBottom,pipes[i].x,pipes[i].y + spaceHeight);

                pipes[i].x -= 2; // Velocidad del juego
                
                // Se crea un nuevo tubo cuando el que se encuentra actualmente por pantalla
                // ha llegado a la posición 430 del eje X
                if(pipes[i].x == 430){
                    minHeightPipeTop = canvas.height - spaceHeight;   
                    var pip = createPipe(pipes.length + 1, canvas.width, (Math.floor(Math.random()*(pipeTop.height - minHeightPipeTop) + minHeightPipeTop) - pipeTop.height));
                    pipes.push(pip);
                }

                // Se comprueba si existe alguna colisión entre el personaje y los tubos
                if((birdX + bird.width) >= pipes[i].x && birdX <= (pipes[i].x + pipeTop.width) && (birdY <= (pipes[i].y + pipeTop.height) || (birdY + bird.height) >= (pipes[i].y + spaceHeight))){
                    
                    // Caso en el que el personaje se haya chocado con el tubo y se debe restar sólo un punto
                    if (!pipesFails.includes(pipes[i].id)) {
                        if (lifes >= 1) lifes--; 
                        
                        if (lifes === 0) {
                            setScoreRecord();
                            endGame = true;
                        } else {
                            pipesFails.push(pipes[i].id);
                            pipes[i].counted = false;
                            if (!pipeFail) pipeFail = true;
                        }
                    }
                }
                
                // Cuando la dimensión de los tubos ha llegado a la posición 0 en
                // eje x y se verifica con la variable "counted" de cada tubo que 
                // el personaje no ha colisionado con estos, se incrementa la 
                // puntación del jugador
                if((pipes[i].x + pipeTop.width) == 0 && pipes[i].counted) score++;
            }

            // Se dibuja al personaje en la pantalla
            ctx.drawImage(bird, birdX, birdY);

            // Se dibuja la imagen de choque en caso de que 
            // haya colisionado el personaje con algún tubo
            delayDrawFail();

            // Se incrementa la posición del eje Y del personaje para
            // para simular que el personaje tiende a caer por la gravedad
            birdY += gravity; 

            // Se dibuja el panel de puntaciones, el récord y las vidas
            ctx.fillStyle = "rgba(0,0,0,.8)";
            ctx.fillRect(canvas.width-200, 5, 190, 100);
            ctx.fillStyle = "#fff";
            ctx.font = "20px Verdana";
            ctx.fillText(`Vidas : ${lifes}`, canvas.width-190, 30);
            ctx.fillText(`Puntuación : ${score}`, canvas.width-190, 60);
            ctx.fillText(`Récord : ${record}`, canvas.width-190, 90);

            // Se comprueba si la partida ha finalizado
            if(endGame){
                location.reload();
            } else {
                requestAnimationFrame(animate);
            }
        }
        setTimeout(() => startGame(), 200);
    });
})();

