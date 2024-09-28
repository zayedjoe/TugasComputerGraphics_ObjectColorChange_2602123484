// Wait for the page to load
window.onload = function() {
    // Get the canvas element
    const canvas = document.getElementById('glCanvas');
    // Initialize the GL context
    const gl = canvas.getContext('webgl');

    // Only continue if WebGL is available and working
    if (!gl) {
        alert('Unable to initialize WebGL. Your browser may not support it.');
        return;
    }

    // Function to set the background color to black and clear the canvas
    function clearBackground() {
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // Set background to black
        gl.clear(gl.COLOR_BUFFER_BIT);     // Clear the canvas
    }

    // Vertex shader program (with corrected backticks)
    const vsSource = `
        attribute vec4 aVertexPosition;
        void main() {
            gl_Position = aVertexPosition;
        }
    `;

    // Fragment shader program (initial red color)
    let fsSource = `
        void main() {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);  // Red color
        }
    `;

    // Initialize a shader program
    let shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    // Get the attribute location
    const vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');

    // Create a buffer for the rectangle's positions
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Create an array of positions for the rectangle
    const positions = [
        -0.7,  0.5,
         0.7,  0.5,
        -0.7, -0.5,
         0.7, -0.5,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Tell WebGL how to pull out the positions from the position buffer into the vertexPosition attribute
    gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPosition);

    // Function to update the color of the fragment shader
    function updateFragmentShaderColor(r, g, b) {
        const newFsSource = `
            void main() {
                gl_FragColor = vec4(${r}, ${g}, ${b}, 1.0);  // Updated color
            }
        `;
        shaderProgram = initShaderProgram(gl, vsSource, newFsSource);  // Reinitialize shader with new color
        gl.useProgram(shaderProgram);  // Use the updated shader program
        
        clearBackground();  // Clear the background before drawing the new color
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);  // Redraw the rectangle
    }

    // Function to reset the fragment shader (make the rectangle transparent)
    function resetFragmentShader() {
        const resetFsSource = `
            void main() {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);  // Black color (not transparent)
            }
        `;
        shaderProgram = initShaderProgram(gl, vsSource, resetFsSource);  // Reinitialize shader with reset color
        gl.useProgram(shaderProgram);  // Use the updated shader program
        
        clearBackground();  // Clear the canvas and set background to black
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);  // Redraw the rectangle
    }

    // Draw the initial rectangle
    clearBackground();  // Make sure background is black when the page loads
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Event listeners for buttons to change colors
    document.getElementById('button1').addEventListener('click', () => updateFragmentShaderColor(1.0, 0.0, 0.0)); // Red
    document.getElementById('button2').addEventListener('click', () => updateFragmentShaderColor(0.0, 1.0, 0.0)); // Green
    document.getElementById('button3').addEventListener('click', () => updateFragmentShaderColor(0.0, 0.0, 1.0)); // Blue
    document.getElementById('button4').addEventListener('click', resetFragmentShader); // Reset (black)
}

// Initialize a shader program, so WebGL knows how to draw our data
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

// Creates a shader of the given type, uploads the source and compiles it
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}
