class Cone {
    constructor() {
        this.type = 'cone';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }
    render() {
        var rgba = this.color;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var radius = .2;
        var segments = 100;
        let increment = (2 * Math.PI) / segments;

        for (let i = 0; i < segments; i++) {
            // gl.uniform4f(u_FragColor, rgba[0]*(i/100), rgba[1]*(i/100), rgba[2]*(i/100), rgba[3]);
            let angle = i * increment;
            let x = 0.5 + radius * Math.cos(angle);
            let y = 0.5 + radius * Math.sin(angle);
            let x2 = 0.5 + radius * Math.cos(angle + increment);
            let y2 = 0.5 + radius * Math.sin(angle + increment);
            drawTriangle3D([0.5,0.95,0.5,  x,0.05,y,  x2,0.05,y2 ]);
        }

        // Drawing bottom of cone
        for (let i = 0; i < segments; i++) {
            let angle = i * increment;
            let x = 0.5 + radius * Math.cos(angle);
            let y = 0.05;
            let z = 0.5 + radius * Math.sin(angle);
            let x2 = 0.5 + radius * Math.cos(angle + increment);
            let z2 = 0.5 + radius * Math.sin(angle + increment);
            gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
            drawTriangle3D([0.5,0.05,0.5,  x,y, z,  x2,y,z2]);
        }

    }
}