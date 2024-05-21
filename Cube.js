class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -2;

        this.cubeVerts32 = new Float32Array([
            0,0,0, 1,1,0, 1,0,0,
            0,0,0, 0,1,0, 1,1,0,
            0,1,0, 0,1,1, 1,1,1,
            0,1,0, 1,1,1, 1,1,0,

            1,1,0, 1,1,1, 1,0,0,
            1,0,0, 1,1,1, 1,0,1,
            0,1,0, 0,1,1, 0,0,0,
            0,0,0, 0,1,1, 0,0,1,
     
            0,0,0, 0,0,1, 1,0,1,
            0,0,0, 1,0,1, 1,0,0,
            0,0,1, 1,1,1, 1,0,1,
            0,0,1, 0,1,1, 1,1,1,
        ]);
        this.cubeVerts = [
            0,0,0, 1,1,0, 1,0,0,
            0,0,0, 0,1,0, 1,1,0,
            0,1,0, 0,1,1, 1,1,1,
            0,1,0, 1,1,1, 1,1,0,

            1,1,0, 1,1,1, 1,0,0,
            1,0,0, 1,1,1, 1,0,1,
            0,1,0, 0,1,1, 0,0,0,
            0,0,0, 0,1,1, 0,0,1,
     
            0,0,0, 0,0,1, 1,0,1,
            0,0,0, 1,0,1, 1,0,0,
            0,0,1, 1,1,1, 1,0,1,
            0,0,1, 0,1,1, 1,1,1,
        ];

        // Found out I was doing uv coords wrong and fixed it here
        this.uvVerts32 = new Float32Array([
            // Front
            0,0, 1,1, 1,0,
            0,0, 0,1, 1,1,
            
            // Back
            0,0, 1,1, 1,0,
            0,0, 0,1, 1,1,
            
            // Top
            0,0, 1,1, 1,0,
            0,0, 0,1, 1,1,
            
            // Bottom
            0,0, 1,1, 1,0,
            0,0, 0,1, 1,1,
            
            // Right
            0,0, 1,1, 1,0,
            0,0, 0,1, 1,1,
            
            // Left
            0,0, 1,1, 1,0,
            0,0, 0,1, 1,1
        ]);

        // this.uvVerts = [
        //     0,0, 1,1, 1,0,
        //     0,0, 0,1, 1,1,
        //     0,0, 1,1, 1,0,
        //     0,0, 0,1, 1,1,
        //     0,1, 0,1, 1,1,
        //     0,1, 1,1, 1,1,
        //     0,0, 0,0, 1,0,
        //     0,0, 1,0, 1,0,
        //     0,0, 0,1, 0,0,
        //     0,0, 0,1, 0,1,
        //     1,0, 1,1, 1,0,
        //     1,0, 1,1, 1,1
        // ];
    }
    render() {
        var rgba = this.color;
        
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);


        // Front of cube
        drawTriangle3DUV([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1]);

        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

        // Back of cube
        drawTriangle3DUV([0,0,1, 1,1,1, 1,0,1], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,0,1, 0,1,1, 1,1,1], [0,0, 0,1, 1,1]);

        // gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

        // Top of cube
        drawTriangle3DUV([0,1,0, 0,1,1, 1,1,1], [0,1, 0,1, 1,1]);
        drawTriangle3DUV([0,1,0, 1,1,1, 1,1,0], [0,1, 1,1, 1,1]);

        // Bottom of cube
        drawTriangle3DUV([0,0,0, 0,0,1, 1,0,1], [0,0, 0,0, 1,0]);
        drawTriangle3DUV([0,0,0, 1,0,1, 1,0,0], [0,0, 1,0, 1,0]);

        // Left of Cube
        drawTriangle3DUV([0,0,0, 0,1,1, 0,0,1], [0,0, 0,1, 0,0]);
        drawTriangle3DUV([0,0,0, 0,1,0, 0,1,1], [0,0, 0,1, 0,1]);

        // // Right of Cube
        drawTriangle3DUV([1,0,0, 1,1,1, 1,0,1], [1,0, 1,1, 1,0]);
        drawTriangle3DUV([1,0,0, 1,1,0, 1,1,1], [1,0, 1,1, 1,1]);
    }
    renderfast() {
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, -2);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var allverts = [];

        // Front of cube
        allverts = allverts.concat([0,0,0, 1,1,0, 1,0,0]);
        allverts = allverts.concat([0,0,0, 0,1,0, 1,1,0]);

        // Top of cube
        allverts = allverts.concat([0,1,0, 0,1,1, 1,1,1]);
        allverts = allverts.concat([0,1,0, 1,1,1, 1,1,0]);

        // Right of cube
        allverts = allverts.concat([1,1,0, 1,1,1, 1,0,0,]);
        allverts = allverts.concat([1,0,0, 1,1,1, 1,0,1]);

        // Left of cube
        allverts = allverts.concat([0,1,0, 0,1,1, 0,0,0]);
        allverts = allverts.concat([0,0,0, 0,1,1, 0,0,1]);

        // Bottom of cube
        allverts = allverts.concat([0,0,0, 0,0,1, 1,0,1]);
        allverts = allverts.concat([0,0,0, 1,0,1, 1,0,0]);

        // Back of cube
        allverts = allverts.concat([0,0,1, 1,1,1, 1,0,1]);
        allverts = allverts.concat([0,0,1, 0,1,1, 1,1,1]);

        drawTriangle3D(allverts);

        // console.log("test vert:", allverts);

    }

    renderfaster() {

        var rgba = this.color;

        // No longer hardcoded texture
        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        if (g_vertexBuffer == null || g_uvBuffer == null) {
            initTriangle3D();
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);

        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.uvVerts32, gl.DYNAMIC_DRAW);

        gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_UV);        


        // gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);

        gl.drawArrays(gl.TRIANGLES, 0, 36);

    }
}